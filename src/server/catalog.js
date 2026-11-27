const { ApiError } = require('./http');

async function seedCatalog(pool, seedHotels, seedDestinations) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [728194204]);
    const result = await client.query('SELECT count(*)::int AS count FROM hotels');
    if (result.rows[0].count === 0) {
      for (const hotel of seedHotels) {
        const { reviews, ...data } = hotel;
        await client.query(
          'INSERT INTO hotels (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING',
          [hotel.id, JSON.stringify({ ...data, status: hotel.status || 'published' })]
        );
      }
    }
    await client.query(
      `INSERT INTO app_destinations (id, data)
       VALUES ('main', $1::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [JSON.stringify(seedDestinations)]
    );
    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('[catalog] seed rollback failed', rollbackError.code || rollbackError.name);
    }
    throw error;
  } finally {
    client.release();
  }
}

async function getCatalog(pool, user) {
  const isAdmin = user?.role === 'admin';
  const hotelsResult = await pool.query(
    `SELECT id, data
       FROM hotels
      WHERE $1::boolean OR COALESCE(data->>'status', 'published') <> 'archived'
      ORDER BY data->>'name'`,
    [isAdmin]
  );
  const hotelIds = hotelsResult.rows.map(row => row.id);
  const reviewsResult = hotelIds.length
    ? await pool.query(
        `SELECT r.id, r.hotel_id, r.user_id, u.name AS author, r.rating, r.review_text,
                r.status, r.admin_reply, r.created_at,
                COUNT(l.review_id)::int AS likes,
                COALESCE(bool_or(l.user_id = $3::uuid), false) AS viewer_liked,
                EXISTS (
                  SELECT 1 FROM bookings b
                   WHERE b.owner_user_id = r.user_id
                     AND b.hotel_snapshot->>'id' = r.hotel_id
                     AND b.status = 'completed_demo'
                ) AS verified_stay
           FROM hotel_reviews r
           JOIN users u ON u.id = r.user_id
           LEFT JOIN hotel_review_likes l ON l.review_id = r.id
          WHERE r.hotel_id = ANY($1::varchar[])
            AND ($2::boolean OR r.status = 'published' OR r.user_id = $3)
          GROUP BY r.id, u.name
          ORDER BY r.created_at DESC`,
        [hotelIds, isAdmin, user?.id || null]
      )
    : { rows: [] };
  const reviewsByHotel = new Map(hotelIds.map(id => [id, []]));
  for (const row of reviewsResult.rows) {
    reviewsByHotel.get(row.hotel_id).push({
      id: row.id,
      userId: row.user_id,
      author: row.author,
      date: new Date(row.created_at).toLocaleDateString('ru-RU'),
      rating: row.rating,
      text: row.review_text,
      status: row.status,
      adminReply: row.admin_reply || '',
      likes: row.likes,
      likedBy: row.viewer_liked ? [user.id] : [],
      verifiedStay: row.verified_stay
    });
  }
  const directoryResult = await pool.query("SELECT data FROM app_destinations WHERE id = 'main'");
  if (!directoryResult.rowCount) throw new ApiError(503, 'Справочник направлений не инициализирован');
  const hotels = hotelsResult.rows.map(({ id, data }) => {
    const reviews = reviewsByHotel.get(id) || [];
    const publishedReviews = reviews.filter(review => review.status === 'published');
    const rating = publishedReviews.length
      ? Number((publishedReviews.reduce((sum, review) => sum + review.rating, 0) / publishedReviews.length).toFixed(1))
      : null;
    return { ...data, id, reviews, rating };
  });
  return { hotels, destinationDirectory: directoryResult.rows[0].data };
}

module.exports = { getCatalog, seedCatalog };
