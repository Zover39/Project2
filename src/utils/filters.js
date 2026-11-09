export const filterHotels = (hotels, { country, meal, stars, query }) => {
  const q = query.toLowerCase();
  return hotels.filter(h => {
    const matchCountry = country === 'all' || h.country === country;
    const matchMeal = meal === 'all' || h.meal.includes(meal);
    const matchStars = stars === 'all' || (stars === 'sandy' ? h.beach.includes('Песчаный') : h.stars.toString() === stars);
    const matchQuery = h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q);
    return matchCountry && matchMeal && matchStars && matchQuery;
  });
};
