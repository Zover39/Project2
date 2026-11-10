import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { COUNTRIES, CITIES, MEAL_TYPES, generateHotels, INITIAL_USERS } from '../data/appData';
import { formatMoney } from '../utils/format';
import UserWorkspace from '../components/app/UserWorkspace';
import AdminWorkspace from '../components/app/AdminWorkspace';
import HotelBookingModal from '../components/app/HotelBookingModal';
import Head from 'next/head';
import { Moon, Plane, ShieldAlert, Users, Sun, ShoppingBag, CheckCircle2, Heart } from 'lucide-react';

const TAB_PATHS = {
  catalog: '/catalog',
  favorites: '/favorites',
  'trip-finder': '/trip-finder',
  compare: '/compare',
  recent: '/recent',
  tinder: '/tinder',
  ai: '/ai-assistant',
  profile: '/account',
  'admin-dash': '/admin/dashboard',
  'admin-bookings': '/admin/bookings',
  'admin-hotels': '/admin/hotels',
  'admin-crm': '/admin/customers',
  'admin-mod': '/admin/reviews'
};

const PATH_TABS = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab])
);
const HOTEL_CATALOG_VERSION = 'curated-2026-01';

const addNightsToDate = (date, nights) => {
  if (!date) return '';
  const result = new Date(`${date}T00:00:00`);
  result.setDate(result.getDate() + nights);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
};

export default function AstanaTravelApp() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // -- ОСНОВНОЙ СТЕЙТ --
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [activeTab, setActiveTab] = useState('catalog'); 
  const [theme, setTheme] = useState('light');

  // -- ДАННЫЕ --
  const [hotels, setHotels] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteNotes, setFavoriteNotes] = useState({});
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser] = useState(INITIAL_USERS[0]); 

  // -- ФИЛЬТРЫ КАТАЛОГА --
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterMeal, setFilterMeal] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(4000000);
  const [sortOrder, setSortOrder] = useState('recommended');
  const [quickFilters, setQuickFilters] = useState([]);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [appliedDestination, setAppliedDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // -- СОСТОЯНИЯ UI --
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [activeHotel, setActiveHotel] = useState(null);
  const [modalTab, setModalTab] = useState('info'); // info | reviews
  const [tinderIndex, setTinderIndex] = useState(0);
  const [adminReplyText, setAdminReplyText] = useState({});
  const [logFilter, setLogFilter] = useState('ALL');

  // -- КОНСТРУКТОР ТУРА --
  const [tourConfig, setTourConfig] = useState({ class: 1, pax: 2, adults: 2, children: 0, nights: 7, datePrice: 0 });
  const [checkoutStep, setCheckoutStep] = useState(0);

  // -- АДМИНКА --
  const [bulkConfig, setBulkConfig] = useState({ country: 'ОАЭ', percent: 10 });
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [hotelForm, setHotelForm] = useState({ 
    name: '', price: 0, image: '', country: 'ОАЭ', city: 'Дубай', 
    meal: 'Ultra All Inclusive', stars: 5, beach: 'Песчаный', description: '', gallery: ''
  });

  useEffect(() => {
    setMounted(true);
    const sHotels = localStorage.getItem('at_hotels_v2');
    const sFav = localStorage.getItem('at_favs');
    const sFavoriteNotes = localStorage.getItem('at_favorite_notes');
    const sRecent = localStorage.getItem('at_recent_hotels');
    const sCompare = localStorage.getItem('at_compare_hotels');
    const sBook = localStorage.getItem('at_books');
    const sLogs = localStorage.getItem('at_logs');
    const sUsers = localStorage.getItem('at_users');
    const sTheme = localStorage.getItem('at_theme');

    const savedHotels = sHotels ? JSON.parse(sHotels) : null;
    const seededHotels = generateHotels();
    const isCurrentCatalog = localStorage.getItem('at_hotels_catalog_version') === HOTEL_CATALOG_VERSION;
    const customHotels = savedHotels?.filter(hotel => hotel.id.startsWith('h-custom-')) || [];
    const initialHotels = savedHotels && isCurrentCatalog
      ? savedHotels
      : [...seededHotels, ...customHotels];
    const validHotelIds = new Set(initialHotels.map(hotel => hotel.id));
    setHotels(initialHotels);
    localStorage.setItem('at_hotels_v2', JSON.stringify(initialHotels));
    localStorage.setItem('at_hotels_catalog_version', HOTEL_CATALOG_VERSION);
    if (sUsers) setUsers(JSON.parse(sUsers));
    if (sFav) {
      const savedFavorites = JSON.parse(sFav).filter(id => validHotelIds.has(id));
      setFavorites(savedFavorites);
      localStorage.setItem('at_favs', JSON.stringify(savedFavorites));
    }
    if (sFavoriteNotes) {
      const savedNotes = JSON.parse(sFavoriteNotes);
      const validNotes = Object.fromEntries(Object.entries(savedNotes).filter(([id]) => validHotelIds.has(id)));
      setFavoriteNotes(validNotes);
      localStorage.setItem('at_favorite_notes', JSON.stringify(validNotes));
    }
    if (sRecent) {
      const recent = JSON.parse(sRecent).filter(id => validHotelIds.has(id));
      setRecentlyViewedIds(recent);
      localStorage.setItem('at_recent_hotels', JSON.stringify(recent));
    }
    if (sCompare) {
      const compared = JSON.parse(sCompare).filter(id => validHotelIds.has(id)).slice(0, 3);
      setCompareIds(compared);
      localStorage.setItem('at_compare_hotels', JSON.stringify(compared));
    }
    if (sBook) {
      const bookingsWithCurrentHotels = JSON.parse(sBook).map(booking => {
        const hotel = initialHotels.find(item => item.id === booking.hotel?.id);
        return hotel ? { ...booking, hotel } : booking;
      });
      setBookings(bookingsWithCurrentHotels);
      localStorage.setItem('at_books', JSON.stringify(bookingsWithCurrentHotels));
    }
    if (sLogs) setLogs(JSON.parse(sLogs));
    if (sTheme) setTheme(sTheme);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('at_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!mounted || !router.isReady) return;

    const [routePath, routeQuery = ''] = router.asPath.split('?');
    const query = new URLSearchParams(routeQuery);
    const routeTab = PATH_TABS[routePath] || 'catalog';
    const routeRole = routeTab.startsWith('admin-') ? 'admin' : 'user';
    const hotelId = query.get('hotel');
    const routeHotel = hotelId ? hotels.find(hotel => hotel.id === hotelId) : null;
    const routeSection = query.get('section') === 'reviews' ? 'reviews' : 'info';
    const parsedStep = Number(query.get('step'));
    const routeStep = Number.isInteger(parsedStep) && parsedStep >= 0 && parsedStep <= 2 ? parsedStep : 0;

    setActiveTab(routeTab);
    setRole(routeRole);
    setModalTab(routeSection);
    setCheckoutStep(routeHotel ? routeStep : 0);

    if (!hotelId) {
      setActiveHotel(null);
    } else if (hotels.length > 0) {
      setActiveHotel(routeHotel || null);
    }
  }, [router.asPath, router.isReady, mounted, hotels]);

  // -- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ --
  const pushToast = (msg) => {
    clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const writeRoute = ({ tab = activeTab, hotel = activeHotel, section = modalTab, step = checkoutStep } = {}) => {
    const pathname = TAB_PATHS[tab] || TAB_PATHS.catalog;
    const query = {};
    if (hotel?.id) query.hotel = hotel.id;
    if (hotel && section === 'reviews') query.section = 'reviews';
    if (hotel && step > 0) query.step = String(step);

    const currentPath = router.asPath.split('?')[0];
    router.push({ pathname, query }, undefined, { shallow: currentPath === pathname });
  };

  const navigateToTab = (tab) => {
    setActiveTab(tab);
    setRole(tab.startsWith('admin-') ? 'admin' : 'user');
    setActiveHotel(null);
    setCheckoutStep(0);
    setModalTab('info');
    writeRoute({ tab, hotel: null, section: 'info', step: 0 });
  };

  const updateGuestCounts = (nextAdults, nextChildren) => {
    setAdults(nextAdults);
    setChildren(nextChildren);
    setTourConfig(config => ({
      ...config,
      adults: nextAdults,
      children: nextChildren,
      pax: nextAdults + nextChildren
    }));
  };

  const openHotel = (hotel, tripOptions = {}) => {
    const selectedAdults = tripOptions.adults ?? adults;
    const selectedChildren = tripOptions.children ?? children;
    const selectedNights = tripOptions.nights ?? tourConfig.nights;
    const selectedCheckIn = tripOptions.departureDate ?? checkInDate ?? '';
    const selectedCheckOut = tripOptions.checkOutDate ?? addNightsToDate(selectedCheckIn, selectedNights);
    setActiveHotel(hotel);
    setModalTab('info');
    setCheckoutStep(0);
    setTourConfig(config => ({
      ...config,
      adults: selectedAdults,
      children: selectedChildren,
      pax: selectedAdults + selectedChildren,
      nights: selectedNights,
      departureDate: selectedCheckIn,
      checkOutDate: selectedCheckOut,
      datePrice: hotel.price,
      mealPlan: hotel.mealPlans?.[0] || hotel.meal,
      roomType: hotel.roomTypes?.[0] || 'Вариант размещения'
    }));
    const updatedRecent = [hotel.id, ...recentlyViewedIds.filter(id => id !== hotel.id)].slice(0, 8);
    setRecentlyViewedIds(updatedRecent);
    localStorage.setItem('at_recent_hotels', JSON.stringify(updatedRecent));
    writeRoute({ hotel, section: 'info', step: 0 });
  };

  const closeHotel = () => {
    setActiveHotel(null);
    setCheckoutStep(0);
    setModalTab('info');
    writeRoute({ hotel: null, section: 'info', step: 0 });
  };

  const changeModalTab = (section) => {
    setModalTab(section);
    writeRoute({ section });
  };

  const changeCheckoutStep = (step) => {
    setCheckoutStep(step);
    writeRoute({ step });
  };

  const logAction = (action, details, type = 'СИСТЕМА') => {
    const newLog = { id: Date.now(), time: new Date().toLocaleString('ru-RU'), action, details, type };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem('at_logs', JSON.stringify(newLogs));
  };

  const syncHotels = (newH) => { setHotels(newH); localStorage.setItem('at_hotels_v2', JSON.stringify(newH)); };
  const syncUsers = (newU) => { setUsers(newU); localStorage.setItem('at_users', JSON.stringify(newU)); };

  const handleRoleSwitch = () => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    navigateToTab(newRole === 'admin' ? 'admin-dash' : 'catalog');
    pushToast(`Смена роли: Вы вошли как ${newRole === 'admin' ? 'АДМИНИСТРАТОР' : 'ТУРИСТ'}`);
  };

  const toggleFav = (h) => {
    const isFav = favorites.includes(h.id);
    const newFavs = isFav ? favorites.filter(id => id !== h.id) : [...favorites, h.id];
    setFavorites(newFavs);
    localStorage.setItem('at_favs', JSON.stringify(newFavs));
    pushToast(isFav ? 'Удалено из избранного' : 'Добавлено в избранное!');
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.setItem('at_favs', JSON.stringify([]));
    pushToast('Избранное очищено');
  };

  const updateFavoriteNote = (hotelId, note) => {
    const updated = { ...favoriteNotes, [hotelId]: note };
    setFavoriteNotes(updated);
    localStorage.setItem('at_favorite_notes', JSON.stringify(updated));
  };

  const toggleCompare = (hotel) => {
    if (compareIds.includes(hotel.id)) {
      const updated = compareIds.filter(id => id !== hotel.id);
      setCompareIds(updated);
      localStorage.setItem('at_compare_hotels', JSON.stringify(updated));
      pushToast('Убрано из сравнения');
      return;
    }

    if (compareIds.length >= 3) {
      pushToast('Можно сравнить не больше 3 отелей');
      return;
    }

    const updated = [...compareIds, hotel.id];
    setCompareIds(updated);
    localStorage.setItem('at_compare_hotels', JSON.stringify(updated));
    pushToast('Добавлено к сравнению');
  };

  const clearCompare = () => {
    setCompareIds([]);
    localStorage.setItem('at_compare_hotels', JSON.stringify([]));
  };

  const resetFilters = () => {
    setSearch('');
    setDestinationQuery('');
    setAppliedDestination('');
    setCheckInDate('');
    setCheckOutDate('');
    setAdults(2);
    setChildren(0);
    setFilterCountry('ALL');
    setFilterCity('ALL');
    setFilterMeal('ALL');
    setMaxPrice(4000000);
    setSortOrder('recommended');
    setQuickFilters([]);
    setTourConfig(config => ({
      ...config,
      pax: 2,
      adults: 2,
      children: 0,
      nights: 7,
      departureDate: '',
      checkOutDate: ''
    }));
  };

  const handleCatalogSearch = (event) => {
    event.preventDefault();
    const guestCount = adults + children;
    if (guestCount < 1 || guestCount > 5) {
      pushToast('Выберите от 1 до 5 гостей для демо-расчёта');
      return;
    }

    if (Boolean(checkInDate) !== Boolean(checkOutDate)) {
      pushToast('Укажите обе даты поездки');
      return;
    }

    const nights = checkInDate && checkOutDate
      ? Math.round((new Date(`${checkOutDate}T00:00:00`) - new Date(`${checkInDate}T00:00:00`)) / 86400000)
      : tourConfig.nights;
    if (!Number.isFinite(nights) || nights < 1) {
      pushToast('Дата выезда должна быть позже даты заезда');
      return;
    }

    setAppliedDestination(destinationQuery.trim());
    setFilterCountry('ALL');
    setFilterCity('ALL');
    setTourConfig(config => ({
      ...config,
      pax: guestCount,
      adults,
      children,
      nights,
      departureDate: checkInDate || config.departureDate || '',
      checkOutDate: checkOutDate || ''
    }));
  };

  const confirmBooking = () => {
    const packagePrice = (tourConfig.datePrice || activeHotel.price) * (tourConfig.nights / 7);
    const finalPrice = packagePrice * tourConfig.class * tourConfig.pax;
    const newBooking = {
      id: 'PNR-' + Math.floor(Math.random()*90000),
      hotel: activeHotel,
      price: finalPrice,
      date: new Date().toLocaleDateString('ru-RU'),
      user: currentUser,
      status: 'confirmed_demo',
      paymentMode: 'demo',
      trip: { ...tourConfig }
    };
    const newBooks = [newBooking, ...bookings];
    setBookings(newBooks);
    localStorage.setItem('at_books', JSON.stringify(newBooks));
    logAction('Демо-бронирование', `Пользователь ${currentUser.name} оформил демо-тур в ${activeHotel.name} за ${formatMoney(finalPrice)} ₸`, 'ПОКУПКА');
    
    changeCheckoutStep(2); // Show Voucher
    pushToast('Демо-бронирование оформлено. Оплата не производилась.');
  };

  const cancelBooking = (bookingId) => {
    const updated = bookings.map(booking => booking.id === bookingId
      ? { ...booking, status: 'cancelled_demo' }
      : booking);
    setBookings(updated);
    localStorage.setItem('at_books', JSON.stringify(updated));
    logAction('Отмена демо-брони', `Демо-бронирование ${bookingId} отменено`, 'ПОКУПКА');
    pushToast('Демо-бронирование отменено');
  };

  // -- МАССОВОЕ УПРАВЛЕНИЕ ЦЕНАМИ --
  const applyBulkPrice = () => {
    if (!Number.isFinite(bulkConfig.percent) || bulkConfig.percent < -90 || bulkConfig.percent > 500) {
      pushToast('Укажите изменение цены от -90% до 500%');
      return;
    }
    const multiplier = 1 + (bulkConfig.percent / 100);
    const newHotels = hotels.map(h => {
      if (bulkConfig.country === 'ALL' || h.country === bulkConfig.country) {
        return { ...h, price: Math.round(h.price * multiplier) };
      }
      return h;
    });
    syncHotels(newHotels);
    logAction('Изменение цен', `Цены на ${bulkConfig.country} изменены на ${bulkConfig.percent}%`, 'СИСТЕМА');
    pushToast('Цены успешно обновлены!');
  };

  // -- СОХРАНЕНИЕ / РЕДАКТИРОВАНИЕ ОТЕЛЯ В АДМИНКЕ --
  const handleSaveHotel = () => {
    if(!hotelForm.name) return pushToast('Введите название отеля!');
    const gallery = hotelForm.gallery.split(/\r?\n/).map(url => url.trim()).filter(Boolean);
    const photoUrls = [hotelForm.image, ...gallery].filter(Boolean);
    
    if (editingHotelId) {
      const updated = hotels.map(h => {
        if (h.id !== editingHotelId) return h;
        const photos = photoUrls.map(url => h.photos?.find(photo => photo.url === url) || { url, alt: hotelForm.name });
        return {
          ...h,
          ...hotelForm,
          gallery,
          photos,
          price: Number(hotelForm.price),
          stars: Number(hotelForm.stars)
        };
      });
      syncHotels(updated);
      pushToast('Информация об отеле успешно обновлена!');
      logAction('Редактирование', `Изменены данные отеля: ${hotelForm.name}`, 'СИСТЕМА');
      setEditingHotelId(null);
    } else {
      const newH = { 
        id: `h-custom-${Date.now()}`, 
        ...hotelForm, 
        gallery,
        photos: photoUrls.map(url => ({ url, alt: hotelForm.name })),
        price: Number(hotelForm.price), 
        stars: Number(hotelForm.stars), 
        rating: null,
        roomsLeft: null,
        viewers: null,
        reviews: [] 
      };
      syncHotels([newH, ...hotels]);
      pushToast('Новый отель добавлен в базу!'); 
      logAction('Создание', `Добавлен новый отель: ${hotelForm.name}`, 'СИСТЕМА');
    }
    setHotelForm({name:'', price:0, image:'', country:'ОАЭ', city:'Дубай', meal:'Ultra All Inclusive', beach: 'Песчаный', stars: 5, description: '', gallery: ''});
  };

  const handleEditHotel = (hotel) => {
    setEditingHotelId(hotel.id);
    setHotelForm({
      name: hotel.name,
      price: hotel.price,
      image: hotel.image,
      gallery: (hotel.photos?.slice(1).map(photo => photo.url) || hotel.gallery || []).join('\n'),
      country: hotel.country,
      city: hotel.city,
      meal: hotel.meal,
      beach: hotel.beach,
      stars: hotel.stars,
      description: hotel.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -- ФУНКЦИИ МОДЕРАЦИИ (CRM / ОТЗЫВЫ) --
  const toggleBlockUser = (userId) => {
    const updated = users.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u);
    syncUsers(updated);
    const user = updated.find(u => u.id === userId);
    logAction('Модерация', `Пользователь ${user.name} ${user.isBanned ? 'ЗАБЛОКИРОВАН' : 'РАЗБЛОКИРОВАН'}`, 'МОДЕРАЦИЯ');
    pushToast(user.isBanned ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
  };

  const deleteReview = (hotelId, reviewId) => {
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) return { ...h, reviews: h.reviews.filter(r => r.id !== reviewId) };
      return h;
    });
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
    logAction('Удаление отзыва', `Отзыв удален модератором (Отель ID: ${hotelId})`, 'МОДЕРАЦИЯ');
    pushToast('Отзыв удален');
  };

  const replyToReview = (hotelId, reviewId) => {
    const reply = adminReplyText[reviewId];
    if (!reply) return;
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) {
        return {
          ...h, reviews: h.reviews.map(r => r.id === reviewId ? { ...r, adminReply: reply } : r)
        };
      }
      return h;
    });
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
    setAdminReplyText({...adminReplyText, [reviewId]: ''});
    logAction('Ответ на отзыв', `Администратор ответил на отзыв в ${hotelId}`, 'МОДЕРАЦИЯ');
    pushToast('Ответ опубликован');
  };

  const likeReview = (hotelId, reviewId) => {
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) return { ...h, reviews: h.reviews.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r) };
      return h;
    });
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
  };


  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-8" role="status" aria-label="Загружаем каталог отелей">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-16 rounded-2xl bg-white" />
          <div className="h-56 rounded-3xl bg-indigo-200" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(item => (
              <div key={item} className="overflow-hidden rounded-3xl bg-white">
                <div className="h-56 bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-6 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -- ЛОГИКА ФИЛЬТРАЦИИ КАТАЛОГА --
  const filteredCatalog = hotels.filter(h => {
    const searchableText = `${h.name} ${h.city} ${h.country} ${h.locationDescription || ''}`.toLowerCase();
    const matchesSearch = searchableText.includes(search.trim().toLowerCase());
    const matchesDestination = !appliedDestination
      || searchableText.includes(appliedDestination.toLowerCase());
    const matchesCountry = filterCountry === 'ALL' || h.country === filterCountry;
    const matchesCity = filterCity === 'ALL' || h.city === filterCity;
    const matchesMeal = filterMeal === 'ALL' || h.meal === filterMeal;
    const matchesPrice = h.price <= maxPrice;
    const matchesQuickFilters = quickFilters.every(filter => {
      if (filter === 'beach') return /пляж|побереж|лагун|остров/i.test(`${h.beach} ${h.locationDescription || ''}`);
      if (filter === 'pool') return (h.amenities || []).some(amenity => /бассейн/i.test(amenity));
      if (filter === 'breakfast') return [...(h.mealPlans || []), h.meal].some(meal => /завтрак|breakfast|полупансион|полный пансион/i.test(meal));
      if (filter === 'budget') return h.price <= 1000000;
      return true;
    });
    return matchesSearch && matchesDestination && matchesCountry && matchesCity && matchesMeal && matchesPrice && matchesQuickFilters;
  }).sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0;
  });
  const favoriteHotels = hotels.filter(hotel => favorites.includes(hotel.id));
  const recentlyViewedHotels = recentlyViewedIds
    .map(id => hotels.find(hotel => hotel.id === id))
    .filter(Boolean);
  const comparedHotels = compareIds
    .map(id => hotels.find(hotel => hotel.id === id))
    .filter(Boolean);

  const filteredLogs = logs.filter(l => logFilter === 'ALL' || l.type === logFilter);
  const allReviews = hotels.flatMap(h => h.reviews.map(r => ({ ...r, hotelName: h.name, hotelId: h.id })));
  const app = {
    role, activeTab, setActiveTab: navigateToTab, hotels, favorites, bookings, users, currentUser,
    search, setSearch, filterCountry, setFilterCountry, filterCity, setFilterCity,
    filterMeal, setFilterMeal, maxPrice, setMaxPrice, sortOrder, setSortOrder,
    quickFilters, setQuickFilters,
    destinationQuery, setDestinationQuery, checkInDate, setCheckInDate,
    checkOutDate, setCheckOutDate, adults, children, updateGuestCounts,
    appliedDestination, setAppliedDestination, handleCatalogSearch,
    toast, activeHotel, setActiveHotel, openHotel, closeHotel, pushToast,
    modalTab, setModalTab: changeModalTab, tinderIndex, setTinderIndex, adminReplyText, setAdminReplyText,
    logFilter, setLogFilter, tourConfig, setTourConfig, checkoutStep, setCheckoutStep: changeCheckoutStep,
    bulkConfig, setBulkConfig, editingHotelId, setEditingHotelId, hotelForm, setHotelForm,
    COUNTRIES, CITIES, MEAL_TYPES, formatMoney, filteredCatalog, favoriteHotels, favoriteNotes,
    recentlyViewedHotels, comparedHotels, compareIds, filteredLogs, allReviews,
    pushToast, toggleFav, clearFavorites, updateFavoriteNote, toggleCompare, clearCompare,
    resetFilters, confirmBooking, cancelBooking, applyBulkPrice, handleSaveHotel, handleEditHotel,
    syncHotels, logAction, toggleBlockUser, deleteReview, replyToReview, likeReview
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Head><title>Astana Premium Travel | App</title></Head>

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button type="button" aria-label="На главную" className="flex items-center gap-2 text-left" onClick={() => navigateToTab(role === 'admin' ? 'admin-dash' : 'catalog')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg">
              <Plane className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black text-indigo-600 leading-none">ASTANA TRAVEL</h1>
              <span className="text-[10px] font-bold text-slate-400">PREMIUM BOOKING</span>
            </div>
          </button>

          <nav aria-label="Основная навигация" className="flex items-center gap-1 sm:gap-2">
            <label className="sr-only" htmlFor="mobile-navigation">Навигация</label>
            <select
              id="mobile-navigation"
              value={activeTab}
              onChange={event => navigateToTab(event.target.value)}
              className="xl:hidden max-w-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-2 text-xs font-bold"
            >
              {role === 'user' ? (
                <>
                  <option value="catalog">Каталог</option>
                  <option value="favorites">Избранное</option>
                  <option value="trip-finder">Подбор тура</option>
                  <option value="compare">Сравнение ({compareIds.length})</option>
                  <option value="recent">Недавно смотрели</option>
                  <option value="profile">Кабинет</option>
                </>
              ) : (
                <>
                  <option value="admin-dash">Дашборд</option>
                  <option value="admin-bookings">Заявки и брони</option>
                  <option value="admin-hotels">Каталог отелей</option>
                  <option value="admin-crm">CRM и пользователи</option>
                  <option value="admin-mod">Модерация</option>
                </>
              )}
            </select>
            {role === 'user' ? (
              <>
                <button onClick={() => navigateToTab('catalog')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='catalog'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Каталог</button>
                <button onClick={() => navigateToTab('favorites')} aria-label="Избранное" className={`hidden xl:flex px-3 py-1.5 rounded-lg text-sm font-bold items-center gap-1 ${activeTab==='favorites'?'bg-rose-100 text-rose-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Heart className="w-4 h-4" />
                  <span className="hidden md:inline">Избранное</span>
                  {favorites.length > 0 && <span className="text-xs">{favorites.length}</span>}
                </button>
                <button onClick={() => navigateToTab('trip-finder')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='trip-finder'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Подбор тура</button>
                <button onClick={() => navigateToTab('compare')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='compare'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Сравнение ({compareIds.length})</button>
                <button onClick={() => navigateToTab('recent')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='recent'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Недавно смотрели</button>
                <button onClick={() => navigateToTab('profile')} className={`hidden xl:flex px-3 py-1.5 rounded-lg text-sm font-bold items-center gap-1 ${activeTab==='profile'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><ShoppingBag className="w-4 h-4"/> Кабинет</button>
              </>
            ) : (
              <>
                <button onClick={() => navigateToTab('admin-dash')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-dash'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Дашборд</button>
                <button onClick={() => navigateToTab('admin-bookings')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-bookings'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Заявки</button>
                <button onClick={() => navigateToTab('admin-hotels')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-hotels'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Каталог</button>
                <button onClick={() => navigateToTab('admin-crm')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-crm'?'bg-slate-800 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>CRM & Пользователи</button>
                <button onClick={() => navigateToTab('admin-mod')} className={`hidden xl:block px-3 py-1.5 rounded-lg text-sm font-bold ${activeTab==='admin-mod'?'bg-rose-600 text-white':'text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>Модерация</button>
              </>
            )}
            
            {/* СМЕНА РОЛЕЙ И ТЕМЫ */}
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700 ml-2">
              <button onClick={handleRoleSwitch} aria-label={`Переключить роль: сейчас ${role}`} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1 border transition-colors ${role === 'admin' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                {role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                {role}
              </button>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex="-1" className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6">
        
        {/* === РЕЖИМ ТУРИСТА (B2C) === */}
        {role === 'user' && <UserWorkspace app={app} />}

        {role === 'admin' && <AdminWorkspace app={app} />}

      </main>

      {/* === МОДАЛЬНОЕ ОКНО ОТЕЛЯ (ИНФО И ОТЗЫВЫ) === */}
      <HotelBookingModal app={app} />

      {/* TOAST ALERTS */}
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-2xl animate-in slide-in-from-bottom-5 dark:bg-white dark:text-slate-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
          {toast}
        </div>
      )}
    </div>
  );
}