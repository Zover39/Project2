import { useState, useEffect } from 'react';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage';

export default function useFavorites(showToast) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => { setFavorites(loadJSON(STORAGE_KEYS.favorites, [])); }, []);

  const toggleFavorite = (id) => {
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(item => item !== id);
      showToast('Удалено из избранного');
    } else {
      updated = [...favorites, id];
      showToast('Добавлено в избранное ❤️');
    }
    setFavorites(updated);
    saveJSON(STORAGE_KEYS.favorites, updated);
  };

  const clearFavorites = () => {
    setFavorites([]);
    saveJSON(STORAGE_KEYS.favorites, []);
    showToast('Избранное очищено');
  };

  return { favorites, toggleFavorite, clearFavorites };
}
