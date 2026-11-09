import { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage';

export default function useBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => { setBookings(loadJSON(STORAGE_KEYS.bookings, [])); }, []);

  const addBooking = (booking) => {
    const updated = [booking, ...bookings];
    setBookings(updated);
    saveJSON(STORAGE_KEYS.bookings, updated);
  };

  return { bookings, addBooking };
}
