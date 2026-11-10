import { COUNTRIES, generateHotels } from './appData';

const hotels = generateHotels();

export const COUNTRIES_CONFIG = COUNTRIES.map(name => {
  const countryHotels = hotels.filter(hotel => hotel.country === name);
  return {
    name,
    city: [...new Set(countryHotels.map(hotel => hotel.city))].join(' / '),
    imgBase: countryHotels[0]?.image || ''
  };
});

export const COUNTRY_NAMES = COUNTRIES;
