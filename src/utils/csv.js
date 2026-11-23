import { getBookingStatusLabel } from './booking';

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
    ['Номер заявки', 'Дата оформления', 'Отель', 'Страна', 'Город', 'Заезд', 'Выезд', 'Гости', 'Ночей', 'Стоимость (₸)', 'Статус', 'Клиент', 'Телефон', 'Email', 'Участники поездки', 'Статусы приглашений', 'Причина последней отмены', 'Дата и время отмены', 'Комментарий к отмене'],
    ...bookings.map(booking => {
      const cancellation = booking.cancellationHistory?.[booking.cancellationHistory.length - 1] || booking.cancellation || {};
      const inviteLabels = { pending: 'ожидает принятия', accepted: 'принято', declined: 'отклонено', revoked: 'доступ отозван' };
      return [
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
        getBookingStatusLabel(booking.status),
        booking.user?.name,
        booking.user?.phone,
        booking.user?.email,
        (booking.travelers || []).map(traveler => `${traveler.name} (${traveler.type === 'child' ? 'ребёнок' : 'взрослый'})`).join(', '),
        (booking.shareInvites || []).map(invite => {
          const names = (booking.travelers || [])
            .filter(traveler => invite.travelerIds?.includes(traveler.id))
            .map(traveler => traveler.name)
            .join(', ');
          return `${names || 'Участник'}: ${inviteLabels[invite.status] || invite.status}`;
        }).join('; '),
        cancellation.reason,
        cancellation.cancelledAt,
        cancellation.note
      ];
    })
  ];

  return serializeCsv(rows);
};
