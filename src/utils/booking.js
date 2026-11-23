import { formatPrice } from './format';

export const BOOKING_STATUSES = [
  { value: 'pending_demo', label: 'Новая · демо' },
  { value: 'confirmed_demo', label: 'Подтверждена · демо' },
  { value: 'completed_demo', label: 'Завершена · демо' },
  { value: 'cancelled_demo', label: 'Отменена · демо' },
  { value: 'rejected_demo', label: 'Отклонена · демо' }
];

export const getBookingStatusLabel = status =>
  BOOKING_STATUSES.find(item => item.value === status)?.label || 'Статус не указан';

export const buildBooking = ({ hotel, room, date, nights, adults, childrenCount, total }) => ({
  id: 'AST-' + Math.floor(100000 + Math.random() * 900000),
  hotelName: hotel.name,
  country: hotel.country,
  city: hotel.city,
  image: hotel.image,
  roomName: room.name,
  date,
  nights,
  passengers: `${adults} взр. ${childrenCount > 0 ? '+ ' + childrenCount + ' дет.' : ''}`,
  totalStr: formatPrice(total) + ' ₸',
  flightRoute: hotel.flightRoute,
  createdAt: new Date().toLocaleDateString('ru-RU')
});
