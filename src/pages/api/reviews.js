import { getHotels, upsertHotel } from '../../server/store';

const recalcRating = (reviews = []) => {
  if (!reviews.length) return 4.5;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return Number((sum / reviews.length).toFixed(1));
};

export default function handler(req, res) {
  const { hotelId } = req.body || req.query || {};
  if (!hotelId) {
    return res.status(400).json({ error: 'Требуется hotelId' });
  }

  const hotel = getHotels().find((h) => String(h.id) === String(hotelId));
  if (!hotel) {
    return res.status(404).json({ error: 'Отель не найден на сервере' });
  }

  const reviews = Array.isArray(hotel.reviews) ? [...hotel.reviews] : [];

  if (req.method === 'POST') {
    const { author, rating, text, userId } = req.body || {};
    if (!text || !rating) {
      return res.status(400).json({ error: 'Требуются оценка и текст отзыва' });
    }
    const newReview = {
      id: 'rev-' + Date.now(),
      userId: userId || null,
      author: author || 'Турист',
      rating: Math.min(5, Math.max(1, Number(rating))),
      text: String(text).trim(),
      date: new Date().toLocaleDateString('ru-RU'),
      likes: 0,
      adminReply: ''
    };
    const nextReviews = [newReview, ...reviews];
    const updated = upsertHotel({
      ...hotel,
      reviews: nextReviews,
      rating: recalcRating(nextReviews)
    });
    return res.status(201).json({ hotel: updated, review: newReview });
  }

  if (req.method === 'PATCH') {
    const { reviewId, adminReply, likeDelta } = req.body || {};
    if (!reviewId) {
      return res.status(400).json({ error: 'Требуется reviewId' });
    }
    const nextReviews = reviews.map((r) => {
      if (r.id !== reviewId) return r;
      return {
        ...r,
        ...(adminReply !== undefined ? { adminReply: String(adminReply) } : {}),
        ...(likeDelta ? { likes: Math.max(0, (r.likes || 0) + Number(likeDelta)) } : {})
      };
    });
    const updated = upsertHotel({ ...hotel, reviews: nextReviews });
    return res.status(200).json({ hotel: updated });
  }

  if (req.method === 'DELETE') {
    const { reviewId } = req.body || req.query || {};
    if (!reviewId) {
      return res.status(400).json({ error: 'Требуется reviewId' });
    }
    const nextReviews = reviews.filter((r) => r.id !== reviewId);
    const updated = upsertHotel({
      ...hotel,
      reviews: nextReviews,
      rating: recalcRating(nextReviews)
    });
    return res.status(200).json({ hotel: updated });
  }

  res.setHeader('Allow', ['POST', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
