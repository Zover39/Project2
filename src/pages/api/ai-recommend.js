export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { query = '', maxBudget = 0, country = 'ALL', hotels = [] } = req.body || {};
  const q = String(query).toLowerCase();

  const scored = (Array.isArray(hotels) ? hotels : []).map((hotel) => {
    let score = 50;
    const reasons = [];

    if (country !== 'ALL' && hotel.country === country) {
      score += 20;
      reasons.push(`Страна: ${hotel.country}`);
    }

    if (maxBudget > 0) {
      if (hotel.price <= maxBudget) {
        score += 20;
        reasons.push('Вписывается в бюджет');
      } else {
        score -= 25;
      }
    }

    if (q.includes('море') || q.includes('пляж')) {
      if ((hotel.beach || '').toLowerCase().includes('1-я') || (hotel.beach || '').toLowerCase().includes('собств')) {
        score += 15;
        reasons.push('Отличный пляж');
      }
    }
    if (q.includes('бассейн') && (hotel.amenities || []).some((a) => a.toLowerCase().includes('бассейн'))) {
      score += 12;
      reasons.push('Есть бассейн');
    }
    if ((q.includes('все включено') || q.includes('all')) && (hotel.meal || '').toLowerCase().includes('all')) {
      score += 15;
      reasons.push('Питание All Inclusive');
    }
    if (q.includes('люкс') || q.includes('премиум') || q.includes('5')) {
      if (hotel.stars >= 5) {
        score += 12;
        reasons.push('5 звёзд');
      }
    }
    if (hotel.rating >= 4.7) {
      score += 10;
      reasons.push(`Высокий рейтинг ${hotel.rating}`);
    }

    return {
      hotelId: hotel.id,
      name: hotel.name,
      country: hotel.country,
      city: hotel.city,
      price: hotel.price,
      rating: hotel.rating,
      score: Math.min(99, Math.max(10, score)),
      reasons: reasons.length ? reasons : ['Сбалансированный вариант по цене и качеству']
    };
  });

  const recommendations = scored.sort((a, b) => b.score - a.score).slice(0, 4);
  return res.status(200).json({ recommendations });
}
