import { deleteHotelById, getHotels, setHotels, upsertHotel } from '../../server/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ hotels: getHotels() });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const hotel = req.body;
    if (!hotel?.id || !hotel?.name) {
      return res.status(400).json({ error: 'Требуются id и name отеля' });
    }
    const saved = upsertHotel(hotel);
    return res.status(req.method === 'POST' ? 201 : 200).json({ hotel: saved });
  }

  if (req.method === 'PATCH') {
    // Bulk price adjustment: { percent: number, country?: string }
    const { percent = 0, country = 'ALL' } = req.body || {};
    const multiplier = 1 + Number(percent) / 100;
    if (!Number.isFinite(multiplier) || multiplier <= 0) {
      return res.status(400).json({ error: 'Некорректный процент изменения цены' });
    }
    const updated = getHotels().map((h) => {
      if (country !== 'ALL' && h.country !== country) return h;
      return { ...h, price: Math.max(10000, Math.round(h.price * multiplier)) };
    });
    setHotels(updated);
    return res.status(200).json({ hotels: updated });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || req.body?.id;
    if (!id) {
      return res.status(400).json({ error: 'Требуется id отеля' });
    }
    const deleted = deleteHotelById(id);
    return res.status(200).json({ deleted });
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
