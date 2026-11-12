const escapeCsvCell = value => {
  const cell = String(value ?? '');
  const safeCell = /^[\t\r\n ]*[=+\-@]/.test(cell) ? `'${cell}` : cell;
  return `"${safeCell.replace(/"/g, '""')}"`;
};

const serializeCsv = rows =>
  `\uFEFF${rows.map(row => row.map(escapeCsvCell).join(';')).join('\r\n')}`;

export const buildFavoritesCsv = (hotels, notes = {}) => {
  const rows = [
    ['Отель', 'Страна', 'Город', 'Цена (₸)', 'Звёзды', 'Питание', 'Пляж', 'Заметка', 'Сайт'],
    ...hotels.map(hotel => [
      hotel.name,
      hotel.country,
      hotel.city,
      hotel.price,
      hotel.stars,
      hotel.meal,
      hotel.beach,
      notes[hotel.id],
      hotel.officialUrl
    ])
  ];

  return serializeCsv(rows);
};

export const buildBookingsCsv = bookings => {
  const rows = [
    ['Номер заявки', 'Дата оформления', 'Отель', 'Страна', 'Город', 'Заезд', 'Выезд', 'Гости', 'Ночей', 'Стоимость (₸)', 'Статус'],
    ...bookings.map(booking => [
      booking.id,
      booking.date,
      booking.hotel?.name,
      booking.hotel?.country,
      booking.hotel?.city,
      booking.trip?.departureDate,
      booking.trip?.checkOutDate,
      booking.trip?.pax ?? 2,
      booking.trip?.nights ?? 7,
      booking.price,
      booking.status === 'cancelled_demo' ? 'Отменено' : 'Демо подтверждено'
    ])
  ];

  return serializeCsv(rows);
};
