import { useState } from 'react';
import { HOTELS_DATA } from '../data/hotels';
import { filterHotels } from '../utils/filters';

export default function useHotelFilters() {
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedMeal, setSelectedMeal] = useState('all');
  const [selectedStars, setSelectedStars] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHotels = filterHotels(HOTELS_DATA, {
    country: selectedCountry, meal: selectedMeal, stars: selectedStars, query: searchQuery
  });

  const resetFilters = () => {
    setSelectedCountry('all');
    setSelectedMeal('all');
    setSelectedStars('all');
    setSearchQuery('');
  };

  return {
    selectedCountry, setSelectedCountry,
    selectedMeal, setSelectedMeal,
    searchQuery, setSearchQuery,
    filteredHotels, resetFilters
  };
}
