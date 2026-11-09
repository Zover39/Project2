import { useState } from 'react';
import { calculatePrice } from '../utils/pricing';

// Состояние конструктора поездки: выбранный отель, номер, класс перелёта, гости, даты
export default function useTripBuilder() {
  const [activeHotel, setActiveHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [flightClass, setFlightClass] = useState(1.0);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [nights, setNights] = useState(7);
  const [departureDate, setDepartureDate] = useState('2026-06-01');

  const openHotel = (hotel) => { setActiveHotel(hotel); setSelectedRoom(hotel.rooms[0]); };
  const closeHotel = () => setActiveHotel(null);

  const total = calculatePrice({ hotel: activeHotel, room: selectedRoom, nights, adults, childrenCount, flightClass });

  return {
    activeHotel, selectedRoom, setSelectedRoom,
    flightClass, setFlightClass,
    adults, setAdults,
    childrenCount, setChildrenCount,
    nights, setNights,
    departureDate, setDepartureDate,
    openHotel, closeHotel, total
  };
}
