import { getBookings, getHotels, getLogs, getUsers } from '../../server/store';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const bookings = getBookings();
  const hotels = getHotels();
  const users = getUsers();
  const logs = getLogs();

  const activeBookings = bookings.filter((b) => b.status !== 'cancelled_demo');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled_demo');
  const totalRevenue = activeBookings.reduce((sum, b) => sum + Number(b.price || 0), 0);
  const avgCheck = activeBookings.length ? Math.round(totalRevenue / activeBookings.length) : 0;

  const countryStats = activeBookings.reduce((acc, b) => {
    const country = b.hotel?.country || 'Другое';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  return res.status(200).json({
    metrics: {
      totalBookings: bookings.length,
      activeBookings: activeBookings.length,
      cancelledBookings: cancelledBookings.length,
      totalRevenue,
      avgCheck,
      totalHotels: hotels.length,
      totalUsers: users.length,
      bannedUsers: users.filter((u) => u.isBanned).length,
      recentLogsCount: logs.length,
      topCountries: Object.entries(countryStats)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
    }
  });
}
