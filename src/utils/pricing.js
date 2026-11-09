// Итоговая цена тура: (цена отеля + доплата за номер) × ночи/7 × гости × класс перелёта
export const calculatePrice = ({ hotel, room, nights, adults, childrenCount, flightClass }) => {
  if (!hotel || !room) return 0;
  const nightsFactor = nights / 7;
  const paxFactor = (adults * 0.5) + (childrenCount * 0.35);
  return Math.round((hotel.price + room.priceExtra) * nightsFactor * paxFactor * flightClass);
};
