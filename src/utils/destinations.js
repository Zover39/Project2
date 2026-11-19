import { COUNTRIES, CITIES, DESTINATION_ALIASES } from '../data/appData';

export const normalizeDestinationKey = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('ru-RU')
  .replace(/ё/g, 'е')
  .replace(/[^a-z0-9а-я]/gi, '');

const normalizeAliases = aliases => Array.from(new Set(
  (Array.isArray(aliases) ? aliases : [])
    .map(alias => String(alias || '').trim())
    .filter(Boolean)
));

export const buildDefaultDestinationDirectory = () => COUNTRIES.map(name => ({
  name,
  aliases: DESTINATION_ALIASES.countries[name] || [],
  cities: (CITIES[name] || []).map(cityName => ({
    name: cityName,
    aliases: DESTINATION_ALIASES.cities[cityName] || []
  }))
}));

const findByAlias = (items, value) => {
  const key = normalizeDestinationKey(value);
  if (!key) return null;
  return items.find(item => [item.name, ...(item.aliases || [])]
    .some(alias => normalizeDestinationKey(alias) === key)) || null;
};

export const normalizeDestinationDirectory = (storedDirectory = []) => {
  const directory = buildDefaultDestinationDirectory();
  if (!Array.isArray(storedDirectory)) return directory;

  storedDirectory.forEach(storedCountry => {
    const name = String(storedCountry?.name || '').trim();
    if (!name) return;

    let country = findByAlias(directory, name);
    if (!country) {
      country = { name, aliases: [], cities: [] };
      directory.push(country);
    }

    country.aliases = normalizeAliases([...country.aliases, ...normalizeAliases(storedCountry.aliases)]);
    const storedCities = Array.isArray(storedCountry.cities) ? storedCountry.cities : [];
    storedCities.forEach(storedCity => {
      const cityName = String(typeof storedCity === 'string' ? storedCity : storedCity?.name || '').trim();
      if (!cityName) return;
      const cityAliases = normalizeAliases(typeof storedCity === 'string' ? [] : storedCity?.aliases);
      let city = findByAlias(country.cities, cityName);
      if (!city) {
        city = { name: cityName, aliases: [] };
        country.cities.push(city);
      }
      city.aliases = normalizeAliases([...city.aliases, ...cityAliases]);
    });
  });

  return directory;
};

export const findDestinationCountry = (directory, value) => findByAlias(directory, value);

export const findDestinationCity = (directory, countryValue, cityValue) => {
  const country = findDestinationCountry(directory, countryValue);
  return country ? findByAlias(country.cities, cityValue) : null;
};

export const ensureDestinationDirectory = (directory, hotels = []) => {
  const result = normalizeDestinationDirectory(directory);
  hotels.forEach(hotel => {
    const countryName = String(hotel?.country || '').trim();
    const cityName = String(hotel?.city || '').trim();
    if (!countryName) return;

    let country = findDestinationCountry(result, countryName);
    if (!country) {
      country = { name: countryName, aliases: [], cities: [] };
      result.push(country);
    }
    if (!cityName || findByAlias(country.cities, cityName)) return;
    country.cities.push({ name: cityName, aliases: [] });
  });
  return result;
};

export const canonicalizeHotelDestination = (hotel, directory) => {
  const country = findDestinationCountry(directory, hotel.country);
  const city = country && findDestinationCity(directory, country.name, hotel.city);
  return {
    ...hotel,
    country: country?.name || hotel.country,
    city: city?.name || hotel.city
  };
};
