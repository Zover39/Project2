const escapeCsvCell = value => {
  const cell = String(value ?? '');
  const safeCell = /^[\t\r\n ]*[=+\-@]/.test(cell) ? `'${cell}` : cell;
  return `"${safeCell.replace(/"/g, '""')}"`;
};

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

  return `\uFEFF${rows.map(row => row.map(escapeCsvCell).join(';')).join('\r\n')}`;
};
