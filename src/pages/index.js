import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { MEAL_TYPES, generateHotels, INITIAL_USERS } from '../data/appData';
import { formatMoney } from '../utils/format';
import { calculateSmartTourPrice } from '../utils/pricing';
import { getPublishedReviews, getReviewAverage } from '../utils/reviews';
import {
  buildDefaultDestinationDirectory, canonicalizeHotelDestination, ensureDestinationDirectory,
  findDestinationCity, findDestinationCountry, normalizeDestinationKey
} from '../utils/destinations';
import UserWorkspace from '../components/app/UserWorkspace';
import AdminWorkspace from '../components/app/AdminWorkspace';
import HotelBookingModal from '../components/app/HotelBookingModal';
import Head from 'next/head';
import { Moon, Plane, ShieldAlert, Users, Sun, User, CheckCircle2, Heart } from 'lucide-react';

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
const DESTINATION_DIRECTORY_KEY = 'at_destination_directory';

const addNightsToDate = (date, nights) => {
  if (!date) return '';
  const result = new Date(`${date}T00:00:00`);
  result.setDate(result.getDate() + nights);
  return `${result.getFullYear()}-${String(result.getMonth() + 1).padStart(2, '0')}-${String(result.getDate()).padStart(2, '0')}`;
};

const EMPTY_PERSONAL_DATA = {
  favorites: [],
  favoriteNotes: {},
  recentlyViewedIds: [],
  compareIds: []
};
const personalDataKey = userId => `at_personal_data_${userId || 'guest'}`;

const readPersonalData = userId => {
  const raw = localStorage.getItem(personalDataKey(userId));
  return raw ? { ...EMPTY_PERSONAL_DATA, ...JSON.parse(raw) } : null;
};

const apiRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ');
  }
  if (!response.ok) throw new Error(data.error || `Ошибка запроса (${response.status})`);
  return data;
};

const createTravelerDrafts = (adults, children, user, previous = []) =>
  Array.from({ length: adults + children }, (_, index) => {
    const existing = previous[index];
    const isPrimaryAdult = index === 0;
    return {
      id: existing?.id || `traveler-${Date.now()}-${index}`,
      type: index < adults ? 'adult' : 'child',
      name: existing?.name ?? (isPrimaryAdult ? user?.name || '' : ''),
      phone: existing?.phone ?? (isPrimaryAdult ? user?.phone || '' : '')
    };
  });

export default function AstanaTravelApp() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // -- ОСНОВНОЙ СТЕЙТ --
  const [demoRole, setDemoRole] = useState('user');
  const [backendMode, setBackendMode] = useState('checking');
  const [backendUser, setBackendUser] = useState(null);
  const [backendPendingInvitations, setBackendPendingInvitations] = useState([]);
  const [backendError, setBackendError] = useState('');
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
  const [currentUserId, setCurrentUserId] = useState(INITIAL_USERS[0].id);
  const touristUsers = users.filter(user => user.role === 'admin' ? false : user.status !== 'Staff');
  const [destinationDirectory, setDestinationDirectory] = useState(buildDefaultDestinationDirectory);
  const COUNTRIES = destinationDirectory.map(country => country.name);
  const CITIES = Object.fromEntries(destinationDirectory.map(country => [
    country.name,
    country.cities.map(city => city.name)
  ]));
  const demoCurrentUser = currentUserId
    ? users.find(user => user.id === currentUserId) || null
    : null;
  const currentUser = backendMode === 'backend' ? backendUser : backendMode === 'demo' ? demoCurrentUser : null;
  const role = backendMode === 'backend'
    ? (backendUser?.role === 'admin' ? 'admin' : 'user')
    : demoRole;

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
  const [travelerDetails, setTravelerDetails] = useState([]);

  // -- СОСТОЯНИЯ UI --
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [activeHotel, setActiveHotel] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [modalTab, setModalTab] = useState('info'); // info | reviews
  const [tinderIndex, setTinderIndex] = useState(0);
  const [adminReplyText, setAdminReplyText] = useState({});
  const [logFilter, setLogFilter] = useState('ALL');

  // -- КОНСТРУКТОР ТУРА --
  const [tourConfig, setTourConfig] = useState({ class: 1, pax: 2, adults: 2, children: 0, nights: 7, datePrice: 0 });
  const [checkoutStep, setCheckoutStep] = useState(0);

  // -- АДМИНКА --
  const [bulkConfig, setBulkConfig] = useState({ country: 'ОАЭ', percent: 10 });
  const [lastBulkPriceChange, setLastBulkPriceChange] = useState(null);
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
    const sDestinations = localStorage.getItem(DESTINATION_DIRECTORY_KEY);
    const sBulkPriceChange = localStorage.getItem('at_last_bulk_price_change');

    const savedHotels = sHotels ? JSON.parse(sHotels) : null;
    const seededHotels = generateHotels();
    const isCurrentCatalog = localStorage.getItem('at_hotels_catalog_version') === HOTEL_CATALOG_VERSION;
    const customHotels = savedHotels?.filter(hotel => hotel.id.startsWith('h-custom-')) || [];
    const savedHotelCatalog = savedHotels && isCurrentCatalog
      ? savedHotels
      : [...seededHotels, ...customHotels];
    const initialDirectory = ensureDestinationDirectory(
      sDestinations ? JSON.parse(sDestinations) : buildDefaultDestinationDirectory(),
      savedHotelCatalog
    );
    const initialHotels = savedHotelCatalog.map(hotel => canonicalizeHotelDestination(hotel, initialDirectory));
    const validHotelIds = new Set(initialHotels.map(hotel => hotel.id));
    setDestinationDirectory(initialDirectory);
    setHotels(initialHotels);
    localStorage.setItem('at_hotels_v2', JSON.stringify(initialHotels));
    localStorage.setItem('at_hotels_catalog_version', HOTEL_CATALOG_VERSION);
    localStorage.setItem(DESTINATION_DIRECTORY_KEY, JSON.stringify(initialDirectory));
    const loadedUsers = sUsers ? JSON.parse(sUsers) : INITIAL_USERS;
    setUsers(loadedUsers);
    const sCurrentUserId = localStorage.getItem('at_current_user_id');
    const touristList = loadedUsers.filter(user => user.status !== 'Staff');
    const availableTourists = touristList.filter(user => !user.isBanned);
    let activeProfileId = '';
    if (sCurrentUserId === null) {
      const defaultId = availableTourists[0]?.id || '';
      activeProfileId = defaultId;
      setCurrentUserId(defaultId);
      localStorage.setItem('at_current_user_id', defaultId);
    } else if (sCurrentUserId === '') {
      setCurrentUserId('');
    } else if (availableTourists.some(user => user.id === sCurrentUserId)) {
      activeProfileId = sCurrentUserId;
      setCurrentUserId(sCurrentUserId);
    } else {
      const fallbackId = availableTourists[0]?.id || '';
      activeProfileId = fallbackId;
      setCurrentUserId(fallbackId);
      localStorage.setItem('at_current_user_id', fallbackId);
    }
    const scopedData = readPersonalData(activeProfileId);
    const personalData = scopedData || {
      favorites: sFav ? JSON.parse(sFav) : [],
      favoriteNotes: sFavoriteNotes ? JSON.parse(sFavoriteNotes) : {},
      recentlyViewedIds: sRecent ? JSON.parse(sRecent) : [],
      compareIds: sCompare ? JSON.parse(sCompare) : []
    };
    const savedFavorites = personalData.favorites.filter(id => validHotelIds.has(id));
    const savedNotes = Object.fromEntries(Object.entries(personalData.favoriteNotes).filter(([id]) => validHotelIds.has(id)));
    const recent = personalData.recentlyViewedIds.filter(id => validHotelIds.has(id));
    const compared = personalData.compareIds.filter(id => validHotelIds.has(id)).slice(0, 3);
    const validPersonalData = {
      favorites: savedFavorites,
      favoriteNotes: savedNotes,
      recentlyViewedIds: recent,
      compareIds: compared
    };
    setFavorites(savedFavorites);
    setFavoriteNotes(savedNotes);
    setRecentlyViewedIds(recent);
    setCompareIds(compared);
    localStorage.setItem(personalDataKey(activeProfileId), JSON.stringify(validPersonalData));
    localStorage.setItem('at_favs', JSON.stringify(savedFavorites));
    localStorage.setItem('at_favorite_notes', JSON.stringify(savedNotes));
    localStorage.setItem('at_recent_hotels', JSON.stringify(recent));
    localStorage.setItem('at_compare_hotels', JSON.stringify(compared));
    if (sBook) {
      const bookingsWithCurrentHotels = JSON.parse(sBook).map(booking => {
        const status = booking.status || 'confirmed_demo';
        const history = booking.statusHistory || [{
          status: status === 'cancelled_demo' ? 'cancelled_demo' : status,
          changedAt: booking.createdAt || booking.date,
          changedBy: 'Система',
          note: 'История статусов восстановлена для ранее созданной демо-заявки.'
        }];
        return { ...booking, status, statusHistory: history };
      });
      setBookings(bookingsWithCurrentHotels);
      localStorage.setItem('at_books', JSON.stringify(bookingsWithCurrentHotels));
    }
    if (sLogs) setLogs(JSON.parse(sLogs));
    if (sBulkPriceChange) setLastBulkPriceChange(JSON.parse(sBulkPriceChange));
    if (sTheme) setTheme(sTheme);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    let active = true;
    apiRequest('/api/auth/me', { cache: 'no-store' })
      .then(data => {
        if (!active) return;
        if (!['demo', 'backend', 'unavailable'].includes(data.mode)) {
          throw new Error('Сервер не сообщил режим работы');
        }
        setBackendMode(data.mode);
        setBackendUser(data.mode === 'backend' ? data.user : null);
        if (data.mode === 'unavailable') {
          setBackendError('Backend не настроен. Добавьте DATABASE_URL и выполните миграции базы данных.');
          setUsers([]);
          setCurrentUserId('');
        }
      })
      .catch(error => {
        if (!active) return;
        setBackendMode('unavailable');
        setBackendError(error.message);
        setBackendUser(null);
        setUsers([]);
        setCurrentUserId('');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (backendMode !== 'backend') return;
    let active = true;
    if (!backendUser) {
      setBookings([]);
      setBackendPendingInvitations([]);
      setUsers([]);
      return () => { active = false; };
    }

    Promise.all([
      apiRequest('/api/bookings'),
      backendUser.role === 'admin' ? apiRequest('/api/admin/users') : Promise.resolve({ users: [backendUser] })
    ])
      .then(([bookingData, userData]) => {
        if (!active) return;
        setBookings(bookingData.bookings);
        setBackendPendingInvitations(bookingData.pendingInvitations);
        setUsers(userData.users);
        setBackendError('');
      })
      .catch(error => {
        if (!active) return;
        setBackendError(error.message);
      });
    return () => { active = false; };
  }, [backendMode, backendUser?.id, backendUser?.role]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('at_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!mounted || backendMode === 'checking' || !router.isReady) return;

    const [routePath, routeQuery = ''] = router.asPath.split('?');
    const query = new URLSearchParams(routeQuery);
    const routeTab = PATH_TABS[routePath] || 'catalog';
    const wantsAdmin = routeTab.startsWith('admin-');
    if (backendMode !== 'demo' && wantsAdmin && backendUser?.role !== 'admin') {
      setActiveTab('profile');
      setActiveHotel(null);
      setCheckoutStep(0);
      router.replace('/account');
      return;
    }
    const routeRole = wantsAdmin ? 'admin' : 'user';
    const hotelId = query.get('hotel');
    const routeHotel = hotelId ? hotels.find(hotel => hotel.id === hotelId) : null;
    const routeSection = query.get('section') === 'reviews' ? 'reviews' : 'info';
    const parsedStep = Number(query.get('step'));
    const routeStep = Number.isInteger(parsedStep) && parsedStep >= 0 && parsedStep <= 2 ? parsedStep : 0;

    setActiveTab(routeTab);
    if (backendMode === 'demo') setDemoRole(routeRole);
    setModalTab(routeSection);
    setCheckoutStep(routeHotel ? routeStep : 0);

    if (!hotelId) {
      setActiveHotel(null);
    } else if (hotels.length > 0) {
      setActiveHotel(routeHotel || null);
    }
  }, [router.asPath, router.isReady, mounted, hotels, backendMode, backendUser?.role]);

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

  const refreshBackendBookings = async () => {
    const data = await apiRequest('/api/bookings');
    setBookings(data.bookings);
    setBackendPendingInvitations(data.pendingInvitations);
    return data;
  };

  const refreshBackendUsers = async (user = backendUser) => {
    if (user?.role === 'admin') {
      const data = await apiRequest('/api/admin/users');
      setUsers(data.users);
      return data.users;
    }
    if (user) setUsers([user]);
    else setUsers([]);
    return [];
  };

  const navigateToTab = (tab) => {
    if (tab.startsWith('admin-') && (backendMode !== 'demo' && backendUser?.role !== 'admin')) {
      pushToast('Для панели администратора нужен подтверждённый аккаунт администратора');
      return false;
    }
    setActiveTab(tab);
    if (backendMode === 'demo') setDemoRole(tab.startsWith('admin-') ? 'admin' : 'user');
    setActiveHotel(null);
    setCheckoutStep(0);
    setModalTab('info');
    writeRoute({ tab, hotel: null, section: 'info', step: 0 });
    return true;
  };

  const updateGuestCounts = (nextAdults, nextChildren) => {
    setAdults(nextAdults);
    setChildren(nextChildren);
    setTravelerDetails(previous => createTravelerDrafts(nextAdults, nextChildren, currentUser, previous));
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
    setCreatedBookingId('');
    setTravelerDetails(previous => createTravelerDrafts(selectedAdults, selectedChildren, currentUser, previous));
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
    savePersonalData('recentlyViewedIds', updatedRecent);
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

  const logAction = (action, details, type = 'СИСТЕМА', subjectUserId = '') => {
    const newLog = { id: Date.now(), time: new Date().toLocaleString('ru-RU'), action, details, type, subjectUserId };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem('at_logs', JSON.stringify(newLogs));
  };

  const syncHotels = (newH) => { setHotels(newH); localStorage.setItem('at_hotels_v2', JSON.stringify(newH)); };
  const syncUsers = (newU) => { setUsers(newU); localStorage.setItem('at_users', JSON.stringify(newU)); };
  const savePersonalData = (field, value, userId = currentUserId) => {
    const data = readPersonalData(userId) || { ...EMPTY_PERSONAL_DATA };
    const updated = { ...data, [field]: value };
    localStorage.setItem(personalDataKey(userId), JSON.stringify(updated));
    const legacyKeys = {
      favorites: 'at_favs',
      favoriteNotes: 'at_favorite_notes',
      recentlyViewedIds: 'at_recent_hotels',
      compareIds: 'at_compare_hotels'
    };
    localStorage.setItem(legacyKeys[field], JSON.stringify(value));
    return updated;
  };
  const loadPersonalData = userId => {
    const data = readPersonalData(userId) || { ...EMPTY_PERSONAL_DATA };
    const validHotelIds = new Set(hotels.map(hotel => hotel.id));
    const next = {
      favorites: data.favorites.filter(id => validHotelIds.has(id)),
      favoriteNotes: Object.fromEntries(Object.entries(data.favoriteNotes).filter(([id]) => validHotelIds.has(id))),
      recentlyViewedIds: data.recentlyViewedIds.filter(id => validHotelIds.has(id)),
      compareIds: data.compareIds.filter(id => validHotelIds.has(id)).slice(0, 3)
    };
    setFavorites(next.favorites);
    setFavoriteNotes(next.favoriteNotes);
    setRecentlyViewedIds(next.recentlyViewedIds);
    setCompareIds(next.compareIds);
    localStorage.setItem(personalDataKey(userId), JSON.stringify(next));
  };
  const syncDestinationDirectory = directory => {
    setDestinationDirectory(directory);
    localStorage.setItem(DESTINATION_DIRECTORY_KEY, JSON.stringify(directory));
  };
  const parseDestinationAliases = value => String(value || '')
    .split(/[,\n;]/)
    .map(alias => alias.trim())
    .filter(Boolean);
  const mergeDestinationAliases = (existingAliases, candidates, canonicalName, findOwner) => {
    const aliases = [...(existingAliases || [])];
    const knownKeys = new Set([canonicalName, ...aliases].map(normalizeDestinationKey));
    for (const candidate of candidates) {
      const key = normalizeDestinationKey(candidate);
      if (!key || knownKeys.has(key)) continue;
      const owner = findOwner(candidate);
      if (owner && owner.name !== canonicalName) {
        return { aliases, conflict: owner };
      }
      aliases.push(candidate);
      knownKeys.add(key);
    }
    return { aliases, conflict: null };
  };
  const addDestinationCountry = (value, aliasesText = '') => {
    const name = String(value || '').trim();
    if (!name) {
      pushToast('Введите название страны');
      return '';
    }
    const aliases = parseDestinationAliases(aliasesText);
    const existing = findDestinationCountry(destinationDirectory, name);
    if (existing) {
      const merged = mergeDestinationAliases(
        existing.aliases,
        [name, ...aliases],
        existing.name,
        alias => findDestinationCountry(destinationDirectory, alias)
      );
      if (merged.conflict) {
        pushToast(`Вариант «${merged.conflict.name}» уже используется другой страной`);
        return '';
      }
      if (merged.aliases.length === existing.aliases.length) {
        pushToast(`Страна «${existing.name}» уже есть в справочнике`);
        return existing.name;
      }
      syncDestinationDirectory(destinationDirectory.map(country => country.name === existing.name
        ? { ...country, aliases: merged.aliases }
        : country));
      pushToast(`Варианты названия добавлены к стране «${existing.name}»`);
      return existing.name;
    }

    const merged = mergeDestinationAliases(
      [],
      aliases,
      name,
      alias => findDestinationCountry(destinationDirectory, alias)
    );
    if (merged.conflict) {
      pushToast(`Вариант «${merged.conflict.name}» уже используется другой страной`);
      return '';
    }
    syncDestinationDirectory([...destinationDirectory, { name, aliases: merged.aliases, cities: [] }]);
    pushToast(`Страна «${name}» добавлена`);
    return name;
  };
  const addDestinationCity = (countryValue, value, aliasesText = '') => {
    const country = findDestinationCountry(destinationDirectory, countryValue);
    const name = String(value || '').trim();
    if (!country) {
      pushToast('Сначала выберите страну');
      return '';
    }
    if (!name) {
      pushToast('Введите название города');
      return '';
    }
    const aliases = parseDestinationAliases(aliasesText);
    const existing = findDestinationCity(destinationDirectory, country.name, name);
    const updatedAliases = mergeDestinationAliases(
      existing?.aliases || [],
      [name, ...aliases],
      existing?.name || name,
      alias => findDestinationCity(destinationDirectory, country.name, alias)
    );
    if (updatedAliases.conflict) {
      pushToast(`Вариант «${updatedAliases.conflict.name}» уже используется другим городом в этой стране`);
      return '';
    }

    const cities = existing
      ? country.cities.map(city => city.name === existing.name
        ? { ...city, aliases: updatedAliases.aliases }
        : city)
      : [...country.cities, { name, aliases: updatedAliases.aliases }];
    const changed = !existing || updatedAliases.aliases.length !== existing.aliases.length;
    if (!changed) {
      pushToast(`Город «${existing.name}» уже есть в справочнике`);
      return existing.name;
    }
    syncDestinationDirectory(destinationDirectory.map(item => item.name === country.name
      ? { ...item, cities }
      : item));
    pushToast(existing
      ? `Варианты названия добавлены к городу «${existing.name}»`
      : `Город «${name}» добавлен в «${country.name}»`);
    return existing?.name || name;
  };
  const setHotelArchived = (hotelId, archived) => {
    if (role !== 'admin') {
      pushToast('Только администратор может управлять каталогом');
      return false;
    }
    const hotel = hotels.find(item => item.id === hotelId);
    if (!hotel) {
      pushToast('Отель не найден');
      return false;
    }
    const updated = hotels.map(item => item.id === hotelId
      ? { ...item, status: archived ? 'archived' : 'published' }
      : item);
    syncHotels(updated);
    if (archived && activeHotel?.id === hotelId) closeHotel();
    logAction(archived ? 'Архивирование отеля' : 'Публикация отеля', `${hotel.name} ${archived ? 'перемещён в архив' : 'возвращён в каталог'}`, 'СИСТЕМА');
    pushToast(archived ? 'Отель скрыт из каталога, история сохранена' : 'Отель снова опубликован');
    return true;
  };

  const normalizePhone = phone => String(phone || '').replace(/\D/g, '');
  const phonesMatch = (firstPhone, secondPhone) => {
    const a = normalizePhone(firstPhone);
    const b = normalizePhone(secondPhone);
    if (!a || !b) return false;
    if (a === b) return true;
    const tailA = a.length >= 10 ? a.slice(-10) : a;
    const tailB = b.length >= 10 ? b.slice(-10) : b;
    return tailA.length === 10 && tailA === tailB;
  };

  const switchAccount = (userId) => {
    if (backendMode === 'backend') {
      pushToast('Переключение демо-профилей отключено: войдите по подтверждённому телефону');
      return false;
    }
    if (!userId) {
      setCurrentUserId('');
      localStorage.setItem('at_current_user_id', '');
      loadPersonalData('');
      pushToast('Вы вышли из аккаунта');
      return true;
    }

    const targetUser = touristUsers.find(user => user.id === userId);
    if (!targetUser) {
      pushToast('Аккаунт не найден');
      return false;
    }
    if (targetUser.isBanned) {
      pushToast('Этот аккаунт заблокирован модератором');
      return false;
    }

    setCurrentUserId(targetUser.id);
    localStorage.setItem('at_current_user_id', targetUser.id);
    loadPersonalData(targetUser.id);
    logAction('Вход в аккаунт', `Активный профиль: ${targetUser.name}`, 'СИСТЕМА', targetUser.id);
    pushToast(`Вы вошли как ${targetUser.name}`);
    return true;
  };

  const loginWithPhone = (phone) => {
    if (backendMode !== 'demo') {
      pushToast('Вход выполняется только через одноразовый код');
      return false;
    }
    const digits = normalizePhone(phone);
    if (digits.length < 10) {
      pushToast('Введите корректный номер телефона');
      return false;
    }

    const foundUser = touristUsers.find(user => phonesMatch(user.phone, phone));
    if (!foundUser) {
      pushToast('Аккаунт с таким номером не найден. Создайте новый профиль!');
      return false;
    }

    return switchAccount(foundUser.id);
  };

  const registerAccount = ({ name, phone, email = '' }) => {
    if (backendMode !== 'demo') {
      pushToast('Регистрация выполняется только после подтверждения телефона');
      return false;
    }
    const trimmedName = String(name || '').trim();
    const trimmedPhone = String(phone || '').trim();
    const trimmedEmail = String(email || '').trim();

    if (trimmedName.length < 2) {
      pushToast('Укажите имя (минимум 2 символа)');
      return false;
    }
    if (normalizePhone(trimmedPhone).length < 10) {
      pushToast('Введите корректный номер телефона');
      return false;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      pushToast('Введите корректный email');
      return false;
    }
    if (touristUsers.some(user => phonesMatch(user.phone, trimmedPhone))) {
      pushToast('Аккаунт с таким номером уже существует. Войдите по номеру!');
      return false;
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      ltv: 0,
      status: 'Standard',
      isBanned: false,
      createdAt: new Date().toLocaleDateString('ru-RU')
    };

    const updatedUsers = [...users, newUser];
    syncUsers(updatedUsers);
    setCurrentUserId(newUser.id);
    localStorage.setItem('at_current_user_id', newUser.id);
    loadPersonalData(newUser.id);
    logAction('Регистрация', `Создан аккаунт: ${newUser.name} (${newUser.phone})`, 'СИСТЕМА', newUser.id);
    pushToast(`Добро пожаловать, ${newUser.name}!`);
    return true;
  };

  const requestPhoneCode = async ({ phone, intent }) => {
    if (backendMode !== 'backend') {
      pushToast(backendError || 'Backend не настроен для входа по SMS');
      return null;
    }
    try {
      return await apiRequest('/api/auth/start', {
        method: 'POST',
        body: JSON.stringify({ phone, intent })
      });
    } catch (error) {
      pushToast(error.message);
      return null;
    }
  };

  const verifyPhoneCode = async details => {
    try {
      const data = await apiRequest('/api/auth/verify', {
        method: 'POST',
        body: JSON.stringify(details)
      });
      await Promise.all([
        refreshBackendBookings(),
        refreshBackendUsers(data.user)
      ]);
      setCurrentUserId('');
      setBackendUser(data.user);
      setBackendMode('backend');
      setBackendError('');
      pushToast(`Добро пожаловать, ${data.user.name}`);
      return true;
    } catch (error) {
      pushToast(error.message);
      return false;
    }
  };

  const logoutBackend = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      setBackendUser(null);
      setBookings([]);
      setBackendPendingInvitations([]);
      setUsers([]);
      setActiveTab('profile');
      setActiveHotel(null);
      router.replace('/account');
      pushToast('Вы вышли из аккаунта');
      return true;
    } catch (error) {
      pushToast(error.message);
      return false;
    }
  };

  const updateCurrentProfile = ({ name, phone, email = '' }) => {
    if (!currentUser) return false;

    const trimmedName = String(name || '').trim();
    const trimmedPhone = String(phone || '').trim();
    const trimmedEmail = String(email || '').trim();

    if (backendMode === 'backend') {
      if (trimmedPhone !== currentUser.phone) {
        pushToast('Номер привязан к SMS-подтверждению; самостоятельная смена телефона отключена');
        return false;
      }
      return (async () => {
        try {
          const data = await apiRequest('/api/account/profile', {
            method: 'PATCH',
            body: JSON.stringify({ name: trimmedName, email: trimmedEmail })
          });
          setBackendUser(data.user);
          await refreshBackendUsers(data.user);
          pushToast('Профиль обновлён');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }

    if (trimmedName.length < 2) {
      pushToast('Укажите имя (минимум 2 символа)');
      return false;
    }
    if (normalizePhone(trimmedPhone).length < 10) {
      pushToast('Введите корректный номер телефона');
      return false;
    }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      pushToast('Введите корректный email');
      return false;
    }
    if (touristUsers.some(user => user.id !== currentUser.id && phonesMatch(user.phone, trimmedPhone))) {
      pushToast('Этот номер телефона уже привязан к другому аккаунту');
      return false;
    }

    const updatedUsers = users.map(user => (
      user.id === currentUser.id
        ? { ...user, name: trimmedName, phone: trimmedPhone, email: trimmedEmail }
        : user
    ));
    syncUsers(updatedUsers);

    const updatedUser = updatedUsers.find(user => user.id === currentUser.id);
    logAction('Профиль', `Обновлён профиль ${trimmedName}`, 'СИСТЕМА', currentUser.id);
    pushToast('Профиль обновлён');
    return true;
  };

  const deleteCurrentAccount = () => {
    if (backendMode === 'backend') {
      if (!currentUser || currentUser.role !== 'user') {
        pushToast('Удалить можно только туристический аккаунт');
        return false;
      }
      return (async () => {
        try {
          await apiRequest('/api/account', { method: 'DELETE' });
          setBackendUser(null);
          setBookings([]);
          setBackendPendingInvitations([]);
          setUsers([]);
          router.replace('/account');
          pushToast('Аккаунт и связанные поездки удалены');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    if (role !== 'user' || !currentUser) {
      pushToast('Удалить можно только активный демо-профиль туриста');
      return false;
    }
    const userId = currentUser.id;
    const updatedBookings = bookings
      .filter(booking => booking.user?.id !== userId)
      .map(booking => {
        const revokedInviteIds = [];
        const shareInvites = (booking.shareInvites || []).map(invite => {
          const belongsToDeletedUser = invite.acceptedByUserId === userId
            || phonesMatch(invite.phone, currentUser.phone);
          if (!belongsToDeletedUser || !['pending', 'accepted'].includes(invite.status)) return invite;
          revokedInviteIds.push(invite.id);
          return { ...invite, status: 'revoked', acceptedByUserId: '', acceptedAt: '' };
        });
        return revokedInviteIds.length
          ? {
              ...booking,
              shareInvites,
              shareHistory: [
                ...(booking.shareHistory || []),
                ...revokedInviteIds.map(inviteId => ({
                  inviteId,
                  action: 'profile_deleted',
                  changedAt: new Date().toISOString(),
                  changedByUserId: userId
                }))
              ]
            }
          : booking;
      });
    const updatedHotels = hotels.map(hotel => {
      const reviews = (hotel.reviews || []).filter(review => review.userId !== userId);
      return reviews.length === (hotel.reviews || []).length
        ? hotel
        : { ...hotel, reviews, rating: getReviewAverage(reviews) };
    });
    const updatedLogs = logs.filter(log =>
      log.subjectUserId !== userId
      && !(currentUser.phone && String(log.details || '').includes(currentUser.phone))
      && !(currentUser.name && String(log.details || '').includes(currentUser.name))
    );
    const deletionLog = {
      id: Date.now(),
      time: new Date().toLocaleString('ru-RU'),
      action: 'Удаление демо-профиля',
      details: 'Пользователь удалил свой демо-профиль и связанные локальные данные',
      type: 'СИСТЕМА'
    };
    const finalLogs = [deletionLog, ...updatedLogs];
    syncUsers(users.filter(user => user.id !== userId));
    syncHotels(updatedHotels);
    setBookings(updatedBookings);
    localStorage.setItem('at_books', JSON.stringify(updatedBookings));
    setLogs(finalLogs);
    localStorage.setItem('at_logs', JSON.stringify(finalLogs));
    localStorage.removeItem(personalDataKey(userId));
    setCurrentUserId('');
    localStorage.setItem('at_current_user_id', '');
    loadPersonalData('');
    pushToast('Демо-профиль и связанные данные удалены из этого браузера');
    return true;
  };

  const respondToBookingInvite = (bookingId, inviteId, response) => {
    if (backendMode === 'backend') {
      if (!currentUser || !['accepted', 'declined'].includes(response)) return false;
      return (async () => {
        try {
          await apiRequest(`/api/bookings/${bookingId}/invites/${inviteId}`, {
            method: 'POST',
            body: JSON.stringify({ action: response === 'accepted' ? 'accept' : 'decline' })
          });
          await refreshBackendBookings();
          pushToast(response === 'accepted' ? 'Поездка появилась в разделе «Со мной поделились»' : 'Приглашение отклонено');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    if (role !== 'user' || !currentUser || !['accepted', 'declined'].includes(response)) {
      pushToast('Войти в туристический демо-профиль необходимо, чтобы ответить на приглашение');
      return false;
    }
    if (currentUser.isBanned) {
      pushToast('Аккаунт ограничен модератором и не может принимать приглашения');
      return false;
    }
    const booking = bookings.find(item => item.id === bookingId);
    const invite = booking?.shareInvites?.find(item => item.id === inviteId);
    if (!booking || !invite || invite.status !== 'pending') {
      pushToast('Приглашение больше недоступно');
      return false;
    }
    if (!phonesMatch(invite.phone, currentUser.phone)) {
      pushToast('Приглашение предназначено для другого номера телефона');
      return false;
    }
    if (['cancelled_demo', 'rejected_demo'].includes(booking.status)) {
      pushToast('Поездка отменена или отклонена; приглашение принять нельзя');
      return false;
    }
    const changedAt = new Date().toISOString();
    const updatedBookings = bookings.map(item => item.id !== bookingId ? item : {
      ...item,
      shareInvites: item.shareInvites.map(currentInvite => currentInvite.id === inviteId
        ? {
            ...currentInvite,
            status: response,
            acceptedByUserId: response === 'accepted' ? currentUser.id : '',
            acceptedAt: response === 'accepted' ? changedAt : ''
          }
        : currentInvite),
      shareHistory: [
        ...(item.shareHistory || []),
        {
          inviteId,
          action: response,
          changedAt,
          changedByUserId: currentUser.id
        }
      ]
    });
    setBookings(updatedBookings);
    localStorage.setItem('at_books', JSON.stringify(updatedBookings));
    logAction(
      response === 'accepted' ? 'Принято приглашение в поездку' : 'Отклонено приглашение в поездку',
      `${currentUser.name} ${response === 'accepted' ? 'принял(а)' : 'отклонил(а)'} приглашение к заявке ${bookingId}`,
      'СИСТЕМА',
      currentUser.id
    );
    pushToast(response === 'accepted' ? 'Поездка появилась в разделе «Со мной поделились»' : 'Приглашение отклонено');
    return true;
  };

  const manageBookingInvite = (bookingId, inviteId, action) => {
    if (backendMode === 'backend') {
      if (!currentUser || !['revoked', 'pending'].includes(action)) return false;
      return (async () => {
        try {
          await apiRequest(`/api/bookings/${bookingId}/invites/${inviteId}`, {
            method: 'POST',
            body: JSON.stringify({ action: action === 'pending' ? 'resend' : 'revoke' })
          });
          await refreshBackendBookings();
          pushToast(action === 'pending' ? 'Приглашение отправлено повторно' : 'Доступ к поездке отозван');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    if (role !== 'user' || !currentUser || !['revoked', 'pending'].includes(action)) {
      pushToast('Управлять приглашениями может только владелец демо-заявки');
      return false;
    }
    const booking = bookings.find(item => item.id === bookingId);
    const invite = booking?.shareInvites?.find(item => item.id === inviteId);
    if (booking?.user?.id !== currentUser.id || !invite) {
      pushToast('Управлять этим приглашением может только владелец заявки');
      return false;
    }
    const isResend = action === 'pending';
    const allowed = isResend
      ? ['declined', 'revoked'].includes(invite.status)
      : ['pending', 'accepted'].includes(invite.status);
    if (!allowed || ['cancelled_demo', 'rejected_demo'].includes(booking.status)) {
      pushToast('Это приглашение сейчас нельзя изменить');
      return false;
    }
    const changedAt = new Date().toISOString();
    const updatedBookings = bookings.map(item => item.id !== bookingId ? item : {
      ...item,
      shareInvites: item.shareInvites.map(currentInvite => currentInvite.id === inviteId
        ? {
            ...currentInvite,
            status: action,
            acceptedByUserId: '',
            acceptedAt: '',
            updatedAt: changedAt
          }
        : currentInvite),
      shareHistory: [
        ...(item.shareHistory || []),
        {
          inviteId,
          action: isResend ? 'resent' : 'revoked',
          changedAt,
          changedByUserId: currentUser.id
        }
      ]
    });
    setBookings(updatedBookings);
    localStorage.setItem('at_books', JSON.stringify(updatedBookings));
    logAction(
      isResend ? 'Повторное приглашение в поездку' : 'Отозвано приглашение в поездку',
      `Приглашение ${inviteId} для заявки ${bookingId} ${isResend ? 'отправлено повторно' : 'отозвано'}`,
      'СИСТЕМА',
      currentUser.id
    );
    pushToast(isResend ? 'Приглашение отправлено повторно' : 'Доступ к поездке отозван');
    return true;
  };

  const handleRoleSwitch = () => {
    const newRole = role === 'admin' ? 'user' : 'admin';
    navigateToTab(newRole === 'admin' ? 'admin-dash' : 'catalog');
    pushToast(`Смена роли: Вы вошли как ${newRole === 'admin' ? 'АДМИНИСТРАТОР' : 'ТУРИСТ'}`);
  };

  const toggleFav = (h) => {
    const isFav = favorites.includes(h.id);
    const newFavs = isFav ? favorites.filter(id => id !== h.id) : [...favorites, h.id];
    setFavorites(newFavs);
    savePersonalData('favorites', newFavs);
    pushToast(isFav ? 'Удалено из избранного' : 'Добавлено в избранное!');
  };

  const clearFavorites = () => {
    setFavorites([]);
    savePersonalData('favorites', []);
    pushToast('Избранное очищено');
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    savePersonalData('recentlyViewedIds', []);
    pushToast('История просмотров очищена');
  };

  const updateFavoriteNote = (hotelId, note) => {
    const updated = { ...favoriteNotes, [hotelId]: note };
    setFavoriteNotes(updated);
    savePersonalData('favoriteNotes', updated);
  };

  const toggleCompare = (hotel) => {
    if (compareIds.includes(hotel.id)) {
      const updated = compareIds.filter(id => id !== hotel.id);
      setCompareIds(updated);
      savePersonalData('compareIds', updated);
      pushToast('Убрано из сравнения');
      return;
    }

    if (compareIds.length >= 3) {
      pushToast('Можно сравнить не больше 3 отелей');
      return;
    }

    const updated = [...compareIds, hotel.id];
    setCompareIds(updated);
    savePersonalData('compareIds', updated);
    pushToast('Добавлено к сравнению');
  };

  const clearCompare = () => {
    setCompareIds([]);
    savePersonalData('compareIds', []);
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

  const confirmBooking = async () => {
    if (backendMode === 'unavailable') {
      pushToast(backendError || 'Backend не настроен: заявка не сохранена');
      return;
    }
    if (role !== 'user') {
      pushToast('Переключитесь в режим туриста, чтобы создать демо-заявку');
      return;
    }
    if (!currentUser) {
      pushToast('Войдите в аккаунт для оформления демо-бронирования');
      return;
    }
    if (currentUser.isBanned) {
      pushToast('Ваш аккаунт ограничен модератором');
      return;
    }
    const latestHotel = hotels.find(hotel => hotel.id === activeHotel?.id);
    if (!latestHotel) {
      pushToast('Этот отель больше недоступен. Выберите другой вариант.');
      closeHotel();
      return;
    }
    if (latestHotel.status === 'archived') {
      pushToast('Отель снят с публикации. Выберите другой вариант.');
      closeHotel();
      return;
    }
    if (Number(tourConfig.datePrice) !== Number(latestHotel.price)) {
      setActiveHotel(latestHotel);
      setTourConfig(config => ({ ...config, datePrice: latestHotel.price }));
      changeCheckoutStep(0);
      pushToast('Цена изменилась. Проверьте обновлённый демо-расчёт перед оформлением.');
      return;
    }
    const today = new Date().toLocaleDateString('sv-SE');
    const departureDate = tourConfig.departureDate || '';
    const checkOutDate = tourConfig.checkOutDate || '';
    const calculatedNights = departureDate && checkOutDate
      ? Math.round((new Date(`${checkOutDate}T00:00:00`) - new Date(`${departureDate}T00:00:00`)) / 86400000)
      : 0;
    if (!departureDate || !checkOutDate || departureDate < today || calculatedNights < 1
      || calculatedNights !== Number(tourConfig.nights)) {
      pushToast('Проверьте даты заезда, выезда и длительность поездки');
      changeCheckoutStep(0);
      return;
    }
    if (!Number.isInteger(tourConfig.nights) || tourConfig.nights < 1
      || !Number.isInteger(tourConfig.pax) || tourConfig.pax < 1 || tourConfig.pax > 5) {
      pushToast('Для демо-заявки выберите от 1 до 5 гостей');
      changeCheckoutStep(0);
      return;
    }
    const savedTravelers = travelerDetails.map(traveler => ({
      ...traveler,
      name: String(traveler.name || '').trim(),
      phone: String(traveler.phone || '').trim()
    }));
    if (savedTravelers.length !== tourConfig.pax || savedTravelers.some(traveler => !traveler.name)) {
      pushToast('Укажите имя каждого участника поездки');
      changeCheckoutStep(0);
      return;
    }
    if (savedTravelers.some(traveler => traveler.phone && normalizePhone(traveler.phone).length < 10)) {
      pushToast('Проверьте телефон участника: для приглашения нужно не менее 10 цифр');
      changeCheckoutStep(0);
      return;
    }
    if (tourConfig.forOther) {
      if (!String(tourConfig.recipientName || '').trim() || !String(tourConfig.recipientPhone || '').trim()) {
        pushToast('Укажите ФИО и телефон получателя билета');
        return;
      }
    }
    const smartPricing = calculateSmartTourPrice({
      basePrice: tourConfig.datePrice || activeHotel.price,
      nights: tourConfig.nights,
      adults: tourConfig.adults ?? tourConfig.pax,
      children: tourConfig.children ?? 0,
      flightClass: tourConfig.class,
      departureDate: tourConfig.departureDate || '',
      promoCode: tourConfig.promoCode || ''
    });
    const finalPrice = smartPricing.total;
    let bookingId;
    do {
      bookingId = `PNR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    } while (bookings.some(booking => booking.id === bookingId));
    const createdAt = new Date().toISOString();
    const inviteGroups = new Map();
    savedTravelers.forEach(traveler => {
      const phoneDigits = normalizePhone(traveler.phone);
      if (phoneDigits.length < 10 || phonesMatch(traveler.phone, currentUser.phone)) return;
      const phoneKey = phoneDigits.slice(-10);
      const group = inviteGroups.get(phoneKey) || { phone: traveler.phone, travelerIds: [] };
      group.travelerIds.push(traveler.id);
      inviteGroups.set(phoneKey, group);
    });
    const shareInvites = Array.from(inviteGroups.values(), (invite, index) => ({
      id: `${bookingId}-invite-${index + 1}`,
      phone: invite.phone,
      travelerIds: invite.travelerIds,
      status: 'pending',
      invitedByUserId: currentUser.id,
      createdAt
    }));
    const newBooking = {
      id: bookingId,
      recipient: tourConfig.forOther
        ? {
            forOther: true,
            fullName: String(tourConfig.recipientName || '').trim(),
            phone: String(tourConfig.recipientPhone || '').trim()
          }
        : null,
      pricingBreakdown: smartPricing,
      hotel: {
        id: latestHotel.id,
        name: latestHotel.name,
        country: latestHotel.country,
        city: latestHotel.city,
        image: latestHotel.image,
        meal: tourConfig.mealPlan || latestHotel.meal,
        stars: latestHotel.stars
      },
      price: finalPrice,
      date: new Date().toLocaleDateString('ru-RU'),
      createdAt,
      user: currentUser,
      status: 'pending_demo',
      statusHistory: [{
        status: 'pending_demo',
        changedAt: createdAt,
        changedBy: currentUser.name,
        note: 'Демо-заявка создана. Подтверждение отеля и оплата не выполнялись.'
      }],
      paymentMode: 'demo',
      trip: { ...tourConfig },
      travelers: savedTravelers,
      shareInvites,
      shareHistory: shareInvites.map(invite => ({
        inviteId: invite.id,
        action: 'created',
        changedAt: createdAt,
        changedByUserId: currentUser.id
      }))
    };
    if (backendMode === 'backend') {
      try {
        const result = await apiRequest('/api/bookings', {
          method: 'POST',
          body: JSON.stringify({
            hotel: {
              id: latestHotel.id,
              name: latestHotel.name,
              country: latestHotel.country,
              city: latestHotel.city,
              image: latestHotel.image || '',
              meal: tourConfig.mealPlan || latestHotel.meal || '',
              stars: Number(latestHotel.stars) || 0,
              price: Number(tourConfig.datePrice || latestHotel.price)
            },
            trip: {
              pax: Number(tourConfig.pax),
              adults: Number(tourConfig.adults),
              children: Number(tourConfig.children),
              nights: Number(tourConfig.nights),
              class: Number(tourConfig.class),
              departureDate,
              checkOutDate,
              mealPlan: tourConfig.mealPlan || '',
              roomType: tourConfig.roomType || ''
            },
            price: finalPrice,
            travelers: savedTravelers
          })
        });
        setCreatedBookingId(result.booking.id);
        await refreshBackendBookings();
        changeCheckoutStep(2);
        pushToast('Заявка сохранена на сервере. Оплата не производилась.');
      } catch (error) {
        pushToast(error.message);
      }
      return;
    }
    const newBooks = [newBooking, ...bookings];
    setBookings(newBooks);
    localStorage.setItem('at_books', JSON.stringify(newBooks));
    setCreatedBookingId(bookingId);

    logAction('Демо-бронирование', `Пользователь ${currentUser.name} оформил демо-тур в ${activeHotel.name} за ${formatMoney(finalPrice)} ₸`, 'ПОКУПКА', currentUser.id);
    
    changeCheckoutStep(2); // Show Voucher
    pushToast('Демо-бронирование оформлено. Оплата не производилась.');
  };

  const cancelBooking = (bookingId, cancellationDetails = {}) => {
    if (backendMode === 'backend') {
      return (async () => {
        try {
          await apiRequest(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              action: 'cancel',
              reason: cancellationDetails.reason || 'Причина не указана',
              note: cancellationDetails.note || ''
            })
          });
          await refreshBackendBookings();
          pushToast('Заявка отменена');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    const booking = bookings.find(item => item.id === bookingId);
    if (!booking) {
      pushToast('Заявка не найдена');
      return;
    }
    if (role !== 'admin' && booking.user?.id !== currentUser?.id) {
      pushToast('Вы можете отменить только свою заявку');
      return;
    }
    if (booking.status === 'cancelled_demo') {
      pushToast('Заявка уже отменена');
      return;
    }
    if (!['pending_demo', 'confirmed_demo'].includes(booking.status)) {
      pushToast('Заявку в этом статусе отменить нельзя');
      return;
    }
    const cancellation = {
      cancelledAt: new Date().toISOString(),
      cancelledBy: String(cancellationDetails.cancelledBy || (role === 'admin' ? 'Администратор' : currentUser?.name || 'Пользователь')),
      reason: String(cancellationDetails.reason || '').trim() || 'Причина не указана',
      note: String(cancellationDetails.note || '').trim()
    };
    const cancellationHistory = [...(booking.cancellationHistory || []), cancellation];
    const statusHistory = [...(booking.statusHistory || []), {
      status: 'cancelled_demo',
      changedAt: cancellation.cancelledAt,
      changedBy: cancellation.cancelledBy,
      note: cancellation.reason
    }];
    const revokedPendingInvites = (booking.shareInvites || [])
      .filter(invite => invite.status === 'pending')
      .map(invite => ({
        inviteId: invite.id,
        action: 'revoked',
        changedAt: cancellation.cancelledAt,
        changedByUserId: booking.user?.id || ''
      }));
    const updated = bookings.map(item => item.id === bookingId
      ? {
          ...item,
          statusBeforeCancellation: item.status,
          status: 'cancelled_demo',
          cancellation,
          cancellationHistory,
          statusHistory,
          shareInvites: (item.shareInvites || []).map(invite => invite.status === 'pending' ? { ...invite, status: 'revoked' } : invite),
          shareHistory: [...(item.shareHistory || []), ...revokedPendingInvites]
        }
      : item);
    setBookings(updated);
    localStorage.setItem('at_books', JSON.stringify(updated));
    logAction(
      'Отмена демо-брони',
      `Демо-бронирование ${bookingId} отменено. Причина: ${cancellation.reason}${cancellation.note ? `. Комментарий: ${cancellation.note}` : ''}`,
      'ПОКУПКА',
      booking.user?.id || ''
    );
    pushToast('Демо-бронирование отменено');
  };

  const restoreBooking = (bookingId) => {
    if (backendMode === 'backend') {
      return (async () => {
        try {
          await apiRequest(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'restore' })
          });
          await refreshBackendBookings();
          pushToast('Заявка восстановлена');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    if (role !== 'admin') {
      pushToast('Восстановить демо-заявку может только администратор');
      return;
    }
    const booking = bookings.find(item => item.id === bookingId);
    if (!booking) {
      pushToast('Заявка не найдена');
      return;
    }
    if (booking.status !== 'cancelled_demo') {
      pushToast('Заявка уже активна');
      return;
    }
    const restoredStatus = booking.statusBeforeCancellation === 'rejected_demo'
      ? 'pending_demo'
      : booking.statusBeforeCancellation || 'pending_demo';
    const updated = bookings.map(item => item.id === bookingId
      ? {
          ...item,
          status: restoredStatus,
          statusHistory: [...(item.statusHistory || []), {
            status: restoredStatus,
            changedAt: new Date().toISOString(),
            changedBy: 'Администратор',
            note: 'Демо-заявка восстановлена.'
          }]
        }
      : item);
    setBookings(updated);
    localStorage.setItem('at_books', JSON.stringify(updated));
    logAction('Восстановление демо-брони', `Демо-бронирование ${bookingId} восстановлено`, 'ПОКУПКА', booking.user?.id || '');
    pushToast('Демо-заявка восстановлена');
  };

  const setBookingStatus = (bookingId, nextStatus) => {
    if (backendMode === 'backend') {
      return (async () => {
        try {
          await apiRequest(`/api/bookings/${bookingId}`, {
            method: 'PATCH',
            body: JSON.stringify({ action: 'set_status', status: nextStatus })
          });
          await refreshBackendBookings();
          pushToast('Статус заявки обновлён');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    if (role !== 'admin') {
      pushToast('Изменять статус может только администратор');
      return false;
    }
    const booking = bookings.find(item => item.id === bookingId);
    if (!booking) {
      pushToast('Заявка не найдена');
      return false;
    }
    if (nextStatus === 'cancelled_demo') {
      cancelBooking(bookingId, { reason: 'Отменено администратором', cancelledBy: 'Администратор' });
      return true;
    }
    const transitions = {
      pending_demo: ['confirmed_demo', 'rejected_demo'],
      confirmed_demo: ['pending_demo', 'completed_demo', 'rejected_demo'],
      rejected_demo: ['pending_demo'],
      completed_demo: []
    };
    if (!transitions[booking.status]?.includes(nextStatus)) {
      pushToast('Нельзя изменить заявку в выбранный статус');
      return false;
    }
    if (nextStatus === 'completed_demo'
      && (!booking.trip?.checkOutDate || booking.trip.checkOutDate >= new Date().toLocaleDateString('sv-SE'))) {
      pushToast('Завершить поездку можно только после даты выезда');
      return false;
    }
    const changedAt = new Date().toISOString();
    const updated = bookings.map(item => item.id === bookingId ? {
      ...item,
      status: nextStatus,
      statusHistory: [...(item.statusHistory || []), {
        status: nextStatus,
        changedAt,
        changedBy: 'Администратор',
        note: 'Статус изменён в демо-панели.'
      }]
    } : item);
    setBookings(updated);
    localStorage.setItem('at_books', JSON.stringify(updated));
    logAction('Изменение статуса заявки', `Заявка ${bookingId}: ${nextStatus}`, 'ПОКУПКА', booking.user?.id || '');
    pushToast('Статус демо-заявки обновлён');
    return true;
  };
  // -- МАССОВОЕ УПРАВЛЕНИЕ ЦЕНАМИ --
  const applyBulkPrice = () => {
    if (role !== 'admin') {
      pushToast('Изменять цены может только администратор');
      return;
    }
    if (!Number.isFinite(bulkConfig.percent) || bulkConfig.percent < -90 || bulkConfig.percent > 500) {
      pushToast('Укажите изменение цены от -90% до 500%');
      return;
    }
    if (bulkConfig.percent === 0) {
      pushToast('Укажите изменение цены, отличное от 0%');
      return;
    }
    const affectedHotels = hotels.filter(h => bulkConfig.country === 'ALL' || h.country === bulkConfig.country);
    if (affectedHotels.length === 0) {
      pushToast('Для выбранной страны нет отелей в каталоге');
      return;
    }
    const multiplier = 1 + (bulkConfig.percent / 100);
    const priceChanges = affectedHotels.map(hotel => ({
      id: hotel.id,
      oldPrice: hotel.price,
      newPrice: Math.round(hotel.price * multiplier)
    }));
    const newHotels = hotels.map(h => {
      if (bulkConfig.country === 'ALL' || h.country === bulkConfig.country) {
        return { ...h, price: Math.round(h.price * multiplier) };
      }
      return h;
    });
    syncHotels(newHotels);
    const change = {
      changedAt: new Date().toISOString(),
      country: bulkConfig.country,
      percent: bulkConfig.percent,
      priceChanges
    };
    setLastBulkPriceChange(change);
    localStorage.setItem('at_last_bulk_price_change', JSON.stringify(change));
    const example = affectedHotels[0];
    logAction(
      'Изменение цен',
      `${affectedHotels.length} отелей (${bulkConfig.country}) · ${bulkConfig.percent}%. Пример: ${example.name}, ${formatMoney(example.price)} → ${formatMoney(Math.round(example.price * multiplier))} ₸`,
      'СИСТЕМА'
    );
    pushToast('Цены успешно обновлены!');
  };

  const undoBulkPrice = () => {
    if (role !== 'admin') {
      pushToast('Отменить изменение цен может только администратор');
      return;
    }
    if (!lastBulkPriceChange?.priceChanges?.length) {
      pushToast('Нет массового изменения для отмены');
      return;
    }
    const conflicts = lastBulkPriceChange.priceChanges.filter(change => {
      const hotel = hotels.find(item => item.id === change.id);
      return !hotel || Number(hotel.price) !== Number(change.newPrice);
    });
    if (conflicts.length) {
      pushToast('Отмена невозможна: часть цен уже изменена отдельно. История сохранена.');
      return;
    }
    const previousPrices = new Map(lastBulkPriceChange.priceChanges.map(change => [change.id, change.oldPrice]));
    const updated = hotels.map(hotel => previousPrices.has(hotel.id)
      ? { ...hotel, price: previousPrices.get(hotel.id) }
      : hotel);
    syncHotels(updated);
    setLastBulkPriceChange(null);
    localStorage.removeItem('at_last_bulk_price_change');
    logAction('Отмена массового изменения цен', `Восстановлены прежние цены для ${previousPrices.size} отелей`, 'СИСТЕМА');
    pushToast('Предыдущее массовое изменение цен отменено');
  };

  // -- СОХРАНЕНИЕ / РЕДАКТИРОВАНИЕ ОТЕЛЯ В АДМИНКЕ --
  const handleSaveHotel = () => {
    if (role !== 'admin') {
      pushToast('Управлять каталогом может только администратор');
      return;
    }
    const name = String(hotelForm.name || '').trim();
    const selectedCountry = findDestinationCountry(destinationDirectory, hotelForm.country);
    const selectedCity = selectedCountry
      ? findDestinationCity(destinationDirectory, selectedCountry.name, hotelForm.city)
      : null;
    const country = selectedCountry?.name || '';
    const city = selectedCity?.name || '';
    const price = Number(hotelForm.price);
    const stars = Number(hotelForm.stars);
    if (!name) return pushToast('Введите название отеля');
    if (!country || !city) return pushToast('Выберите страну и город из справочника');
    if (!Number.isFinite(price) || price <= 0) return pushToast('Цена должна быть больше нуля');
    if (!Number.isInteger(stars) || stars < 3 || stars > 5) return pushToast('Выберите категорию отеля от 3 до 5 звёзд');

    const normalizedForm = { ...hotelForm, name, country, city, price, stars };
    const gallery = String(hotelForm.gallery || '').split(/\r?\n/).map(url => url.trim()).filter(Boolean);
    const image = String(hotelForm.image || '').trim();
    const isValidImage = value =>
      /^https?:\/\/\S+$/i.test(value)
      || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
    if (!isValidImage(image)) {
      pushToast('Укажите основное фото по ссылке http(s) или в формате image Base64');
      return;
    }
    if (gallery.some(url => !isValidImage(url))) {
      pushToast('Проверьте ссылки дополнительных фото: поддерживаются http(s) и image Base64');
      return;
    }
    const photoUrls = [image, ...gallery].filter(Boolean);
    
    if (editingHotelId) {
      const updated = hotels.map(h => {
        if (h.id !== editingHotelId) return h;
        const photos = photoUrls.map(url => h.photos?.find(photo => photo.url === url) || { url, alt: name });
        return {
          ...h,
          ...normalizedForm,
          image,
          gallery,
          photos,
        };
      });
      const updatedHotel = updated.find(hotel => hotel.id === editingHotelId);
      if (!updatedHotel) {
        pushToast('Отель не найден, обновление отменено');
        return;
      }
      syncHotels(updated);
      pushToast('Информация об отеле успешно обновлена!');
      logAction('Редактирование', `Изменены данные отеля: ${name}`, 'СИСТЕМА');
      setEditingHotelId(null);
    } else {
      const newH = { 
        id: `h-custom-${Date.now()}`, 
        ...normalizedForm,
        status: 'published',
        image,
        gallery,
        photos: photoUrls.map(url => ({ url, alt: name })),
        rating: null,
        roomsLeft: null,
        viewers: null,
        reviews: [] 
      };
      syncHotels([newH, ...hotels]);
      pushToast('Новый отель добавлен в базу!'); 
      logAction('Создание', `Добавлен новый отель: ${name}`, 'СИСТЕМА');
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
    if (role !== 'admin') {
      pushToast('Управлять пользователями может только администратор');
      return;
    }
    const selectedUser = users.find(user => user.id === userId);
    if (!selectedUser || selectedUser.status === 'Staff') {
      pushToast('Служебную учётную запись нельзя блокировать');
      return;
    }
    const isBanned = !selectedUser.isBanned;
    if (backendMode === 'backend') {
      return (async () => {
        try {
          await apiRequest(`/api/admin/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ isBanned })
          });
          await refreshBackendUsers();
          pushToast(isBanned ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
          return true;
        } catch (error) {
          pushToast(error.message);
          return false;
        }
      })();
    }
    const updated = users.map(user => user.id === userId ? { ...user, isBanned } : user);
    syncUsers(updated);
    logAction('Модерация', `Пользователь ${selectedUser.name} ${isBanned ? 'ЗАБЛОКИРОВАН' : 'РАЗБЛОКИРОВАН'}`, 'МОДЕРАЦИЯ', selectedUser.id);
    if (isBanned && currentUserId === userId) {
      setCurrentUserId('');
      localStorage.setItem('at_current_user_id', '');
    }
    pushToast(isBanned ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
  };

  const submitReview = (hotelId, rating, text) => {
    const reviewText = text.trim();
    const reviewRating = Number(rating);
    if (role !== 'user') {
      pushToast('Переключитесь в режим туриста, чтобы оставить отзыв');
      return false;
    }
    if (!currentUser) {
      pushToast('Войдите в аккаунт, чтобы оставить отзыв');
      return false;
    }
    if (currentUser.isBanned) {
      pushToast('Ваш аккаунт ограничен модератором');
      return false;
    }
    if (!reviewText) {
      pushToast('Напишите текст отзыва');
      return false;
    }
    if (!Number.isInteger(reviewRating) || reviewRating < 1 || reviewRating > 5) {
      pushToast('Выберите оценку от 1 до 5');
      return false;
    }
    if (!hotels.some(hotel => hotel.id === hotelId)) {
      pushToast('Не удалось найти выбранный отель');
      return false;
    }
    if (hotels.find(hotel => hotel.id === hotelId)?.status === 'archived') {
      pushToast('Этот отель снят с публикации');
      return false;
    }
    if (hotels.find(hotel => hotel.id === hotelId)?.reviews?.some(review => review.userId === currentUser.id)) {
      pushToast('Вы уже отправили отзыв об этом отеле');
      return false;
    }

    const review = {
      id: `review-${Date.now()}`,
      userId: currentUser.id,
      author: currentUser.name,
      date: new Date().toLocaleDateString('ru-RU'),
      rating: reviewRating,
      text: reviewText,
      likes: 0,
      status: 'pending_review',
      verifiedStay: bookings.some(booking =>
        booking.user?.id === currentUser.id
        && booking.hotel?.id === hotelId
        && booking.status === 'completed_demo'
      )
    };
    const newHotels = hotels.map(hotel => {
      if (hotel.id !== hotelId) return hotel;
      const reviews = [...(hotel.reviews || []), review];
      return { ...hotel, reviews };
    });
    syncHotels(newHotels);
    if (activeHotel?.id === hotelId) setActiveHotel(newHotels.find(hotel => hotel.id === hotelId));
    logAction('Новый отзыв', `${currentUser.name} оставил отзыв об отеле ${activeHotel?.name || hotelId}`, 'СИСТЕМА', currentUser.id);
    pushToast('Отзыв отправлен на проверку модератору');
    return true;
  };

  const moderateReview = (hotelId, reviewId, status) => {
    if (role !== 'admin') {
      pushToast('Модерировать отзывы может только администратор');
      return false;
    }
    if (!['published', 'rejected'].includes(status)) {
      pushToast('Неизвестный статус отзыва');
      return false;
    }
    const hotel = hotels.find(item => item.id === hotelId);
    if (!hotel?.reviews?.some(review => review.id === reviewId)) {
      pushToast('Отзыв не найден');
      return false;
    }
    const newHotels = hotels.map(item => {
      if (item.id !== hotelId) return item;
      const reviews = item.reviews.map(review =>
        review.id === reviewId ? { ...review, status } : review
      );
      return { ...item, reviews, rating: getReviewAverage(reviews) };
    });
    syncHotels(newHotels);
    if (activeHotel?.id === hotelId) setActiveHotel(newHotels.find(item => item.id === hotelId));
    logAction(
      status === 'published' ? 'Публикация отзыва' : 'Отклонение отзыва',
      `Отзыв ${reviewId} ${status === 'published' ? 'опубликован' : 'отклонён'}`,
      'МОДЕРАЦИЯ'
    );
    pushToast(status === 'published' ? 'Отзыв опубликован' : 'Отзыв отклонён');
    return true;
  };

  const deleteReview = (hotelId, reviewId) => {
    if (role !== 'admin') {
      pushToast('Удалять отзывы может только администратор');
      return;
    }
    const hotel = hotels.find(item => item.id === hotelId);
    if (!hotel?.reviews?.some(review => review.id === reviewId)) {
      pushToast('Отзыв не найден');
      return;
    }
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) {
        const reviews = (h.reviews || []).filter(r => r.id !== reviewId);
        return { ...h, reviews, rating: getReviewAverage(reviews) };
      }
      return h;
    });
    syncHotels(newHotels);
    if (activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
    logAction('Удаление отзыва', `Отзыв удален модератором (Отель ID: ${hotelId})`, 'МОДЕРАЦИЯ');
    pushToast('Отзыв удален');
  };

  const replyToReview = (hotelId, reviewId) => {
    if (role !== 'admin') {
      pushToast('Отвечать на отзывы может только администратор');
      return;
    }
    const reply = String(adminReplyText[reviewId] || '').trim();
    if (!reply) {
      pushToast('Введите текст ответа');
      return;
    }
    const hotel = hotels.find(item => item.id === hotelId);
    if (!hotel?.reviews?.some(review => review.id === reviewId)) {
      pushToast('Отзыв не найден');
      return;
    }
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) {
        return {
          ...h, reviews: (h.reviews || []).map(r => r.id === reviewId ? { ...r, adminReply: reply } : r)
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
    const actorId = currentUser?.id || 'guest';
    let alreadyLiked = false;
    const newHotels = hotels.map(h => {
      if (h.id === hotelId) return {
        ...h,
        reviews: h.reviews.map(r => {
          if (r.id !== reviewId || !getPublishedReviews([r]).length) return r;
          const likedBy = r.likedBy || [];
          if (likedBy.includes(actorId)) {
            alreadyLiked = true;
            return r;
          }
          return { ...r, likes: (Number(r.likes) || 0) + 1, likedBy: [...likedBy, actorId] };
        })
      };
      return h;
    });
    if (alreadyLiked) {
      pushToast('Вы уже отметили этот отзыв');
      return;
    }
    syncHotels(newHotels);
    if(activeHotel?.id === hotelId) setActiveHotel(newHotels.find(h => h.id === hotelId));
  };


  if (!mounted || backendMode === 'checking') {
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
    const countryDestination = findDestinationCountry(destinationDirectory, h.country);
    const cityDestination = countryDestination
      ? findDestinationCity(destinationDirectory, countryDestination.name, h.city)
      : null;
    const destinationAliases = [
      ...(countryDestination?.aliases || []),
      ...(cityDestination?.aliases || [])
    ].join(' ');
    const searchableText = `${h.name} ${h.city} ${h.country} ${h.locationDescription || ''} ${destinationAliases}`.toLowerCase();
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
    return h.status !== 'archived' && matchesSearch && matchesDestination && matchesCountry && matchesCity && matchesMeal && matchesPrice && matchesQuickFilters;
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
  const allReviews = hotels.flatMap(h => (h.reviews || []).map(r => ({
    ...r,
    status: r.status || 'published',
    hotelName: h.name,
    hotelId: h.id
  })));
  const pendingBookingInvitations = backendMode === 'backend'
    ? backendPendingInvitations
    : backendMode === 'demo' && role === 'user' && currentUser
    ? bookings.flatMap(booking => (booking.shareInvites || [])
      .filter(invite => invite.status === 'pending'
        && !['cancelled_demo', 'rejected_demo'].includes(booking.status)
        && phonesMatch(invite.phone, currentUser.phone))
      .map(invite => ({ booking, invite })))
    : [];
  const sharedTrips = backendMode === 'backend' && role === 'user' && currentUser
    ? bookings.flatMap(booking => (booking.shareInvites || [])
      .filter(invite => invite.status === 'accepted' && invite.acceptedByUserId === currentUser.id)
      .map(invite => ({ booking, invite })))
    : backendMode === 'demo' && role === 'user' && currentUser
    ? bookings.flatMap(booking => (booking.shareInvites || [])
      .filter(invite => invite.status === 'accepted' && invite.acceptedByUserId === currentUser.id)
      .map(invite => ({ booking, invite })))
    : [];
  const app = {
    role, backendMode, backendError, activeTab, setActiveTab: navigateToTab, hotels, favorites, bookings, users, touristUsers, currentUser,
    travelerDetails, setTravelerDetails, pendingBookingInvitations, sharedTrips,
    respondToBookingInvite, manageBookingInvite,
    destinationDirectory, addDestinationCountry, addDestinationCity,
    switchAccount, loginWithPhone, registerAccount, updateCurrentProfile, deleteCurrentAccount,
    requestPhoneCode, verifyPhoneCode, logoutBackend,
    search, setSearch, filterCountry, setFilterCountry, filterCity, setFilterCity,
    filterMeal, setFilterMeal, maxPrice, setMaxPrice, sortOrder, setSortOrder,
    quickFilters, setQuickFilters,
    destinationQuery, setDestinationQuery, checkInDate, setCheckInDate,
    checkOutDate, setCheckOutDate, adults, children, updateGuestCounts,
    appliedDestination, setAppliedDestination, handleCatalogSearch,
    toast, activeHotel, setActiveHotel, createdBookingId, openHotel, closeHotel, pushToast,
    modalTab, setModalTab: changeModalTab, tinderIndex, setTinderIndex, adminReplyText, setAdminReplyText,
    logFilter, setLogFilter, tourConfig, setTourConfig, checkoutStep, setCheckoutStep: changeCheckoutStep,
    bulkConfig, setBulkConfig, lastBulkPriceChange, undoBulkPrice, editingHotelId, setEditingHotelId, hotelForm, setHotelForm,
    COUNTRIES, CITIES, MEAL_TYPES, formatMoney, filteredCatalog, favoriteHotels, favoriteNotes,
    recentlyViewedHotels, comparedHotels, compareIds, filteredLogs, allReviews,
    pushToast, toggleFav, clearFavorites, clearRecentlyViewed, updateFavoriteNote, toggleCompare, clearCompare,
    resetFilters, confirmBooking, cancelBooking, restoreBooking, setBookingStatus, applyBulkPrice, handleSaveHotel, handleEditHotel,
    syncHotels, setHotelArchived, logAction, toggleBlockUser, deleteReview, moderateReview, replyToReview, likeReview, submitReview
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
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
                  <option value="profile">{currentUser ? `Кабинет (${currentUser.name.split(' ')[0]})` : 'Войти'}</option>
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
                <button onClick={() => navigateToTab('profile')} className={`hidden xl:flex px-3 py-1.5 rounded-lg text-sm font-bold items-center gap-1.5 ${activeTab==='profile'?'bg-indigo-100 text-indigo-600':'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><User className="w-4 h-4"/> {currentUser ? currentUser.name.split(' ')[0] : 'Войти'}</button>
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
              {backendMode === 'demo' ? (
                <button onClick={handleRoleSwitch} aria-label={`Переключить демо-роль: сейчас ${role}`} className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-1 border transition-colors ${role === 'admin' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {role === 'admin' ? <ShieldAlert className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {role === 'admin' ? 'Админ · демо' : 'Турист · демо'}
                </button>
              ) : backendMode === 'backend' ? (
                <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {role === 'admin' ? 'Администратор' : currentUser ? 'Аккаунт подтверждён' : 'Вход'}
                </span>
              ) : (
                <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black uppercase text-amber-700">Backend не настроен</span>
              )}
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex="-1" className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6">
        <aside role="note" className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${backendMode === 'backend' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100'}`}>
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {backendMode === 'backend'
              ? 'Backend включён: аккаунты, заявки и приглашения хранятся в PostgreSQL, а доступ проверяется сервером. Каталог и отзывы пока остаются демонстрационными; реальная оплата и подтверждение отелей не подключены.'
              : backendMode === 'unavailable'
                ? `Backend недоступен: ${backendError || 'проверьте DATABASE_URL и миграции'}. В production демо-вход и переключение роли отключены.`
                : 'Демо-прототип: данные и вход остаются в этом браузере; переключение роли не является авторизацией. Цены, наличие, подтверждение отеля и оплата не подключены.'}
          </span>
        </aside>
        {/* === РЕЖИМ ТУРИСТА (B2C) === */}
        <div key={`${role}:${activeTab}`} className="page-transition">
          {role === 'user' && <UserWorkspace app={app} />}
          {role === 'admin' && <AdminWorkspace app={app} />}
        </div>

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