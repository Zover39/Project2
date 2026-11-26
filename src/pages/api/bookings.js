import { addBooking, getBookings, updateBookingById } from '../../server/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ bookings: getBookings() });
  }

  if (req.method === 'POST') {
    const { hotel, price, user, trip, pricingBreakdown } = req.body || {};
    if (!hotel?.id || !user?.id || !price) {
      return res.status(400).json({ error: 'Некорректные данные бронирования' });
    }

    const existing = getBookings().find(
      (b) =>
        b.status !== 'cancelled_demo' &&
        b.user?.id === user.id &&
        b.hotel?.id === hotel.id &&
        trip?.departureDate &&
        b.trip?.departureDate === trip.departureDate
    );

    if (existing) {
      return res.status(409).json({
        error: 'У вас уже есть активная заявка на этот отель и дату вылета'
      });
    }

    const booking = {
      id: 'PNR-' + Math.floor(100000 + Math.random() * 900000),
      hotel,
      price,
      pricingBreakdown: pricingBreakdown || null,
      date: new Date().toLocaleDateString('ru-RU'),
      createdAt: new Date().toISOString(),
      user,
      status: 'confirmed_demo',
      paymentMode: 'demo',
      trip: trip || {}
    };

    addBooking(booking);
    return res.status(201).json({ booking });
  }

  if (req.method === 'PATCH') {
    const { id, status, cancellation, cancellationHistory } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ error: 'Требуется id и status' });
    }
    const updated = updateBookingById(id, (item) => ({
      ...item,
      status,
      ...(cancellation ? { cancellation } : {}),
      ...(cancellationHistory ? { cancellationHistory } : {})
    }));
    if (!updated) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }
    return res.status(200).json({ booking: updated });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
