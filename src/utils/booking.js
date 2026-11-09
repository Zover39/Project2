import { formatPrice } from './format';

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
