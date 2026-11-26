import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'server-db.json');

let memoryStore = {
  bookings: [],
  hotels: [],
  users: [],
  logs: [],
  sessions: {},
  userStates: {},
  destinations: []
};

const readDb = () => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return memoryStore;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      memoryStore = {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        hotels: Array.isArray(parsed.hotels) ? parsed.hotels : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
        sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
        userStates: parsed.userStates && typeof parsed.userStates === 'object' ? parsed.userStates : {},
        destinations: Array.isArray(parsed.destinations) ? parsed.destinations : []
      };
      return memoryStore;
    }
  } catch {
    // Fallback to in-memory store
  }
  return memoryStore;
};

const writeDb = (data) => {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore write errors in read-only environments
  }
};

export const normalizePhoneDigits = (phone) => String(phone || '').replace(/\D/g, '');

export const phonesMatch = (firstPhone, secondPhone) => {
  const a = normalizePhoneDigits(firstPhone);
  const b = normalizePhoneDigits(secondPhone);
  if (!a || !b) return false;
  if (a === b) return true;
  const tailA = a.length >= 10 ? a.slice(-10) : a;
  const tailB = b.length >= 10 ? b.slice(-10) : b;
  return tailA.length === 10 && tailA === tailB;
};

export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derived = crypto.scryptSync(String(password), salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  return keyBuf.length === derived.length && crypto.timingSafeEqual(keyBuf, derived);
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const createSession = (userId) => {
  const db = readDb();
  const token = crypto.randomBytes(24).toString('hex');
  const sessions = {
    ...db.sessions,
    [token]: { userId, createdAt: new Date().toISOString() }
  };
  writeDb({ ...db, sessions });
  return token;
};

export const getUserBySessionToken = (token) => {
  if (!token) return null;
  const db = readDb();
  const session = db.sessions[token];
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) || null;
};

export const deleteSession = (token) => {
  if (!token) return;
  const db = readDb();
  const sessions = { ...db.sessions };
  delete sessions[token];
  writeDb({ ...db, sessions });
};

export const getBookings = () => readDb().bookings;

export const addBooking = (booking) => {
  const db = readDb();
  writeDb({ ...db, bookings: [booking, ...db.bookings] });
  return booking;
};

export const updateBookingById = (id, updater) => {
  const db = readDb();
  let updated = null;
  const bookings = db.bookings.map((item) => {
    if (item.id !== id) return item;
    updated = typeof updater === 'function' ? updater(item) : { ...item, ...updater };
    return updated;
  });
  if (updated) {
    writeDb({ ...db, bookings });
  }
  return updated;
};

export const getHotels = () => readDb().hotels;

export const setHotels = (hotels) => {
  const db = readDb();
  writeDb({ ...db, hotels });
  return hotels;
};

export const upsertHotel = (hotel) => {
  const db = readDb();
  const exists = db.hotels.some((h) => h.id === hotel.id);
  const hotels = exists
    ? db.hotels.map((h) => (h.id === hotel.id ? { ...h, ...hotel } : h))
    : [hotel, ...db.hotels];
  writeDb({ ...db, hotels });
  return hotel;
};

export const deleteHotelById = (id) => {
  const db = readDb();
  const hotels = db.hotels.filter((h) => h.id !== id);
  writeDb({ ...db, hotels });
  return hotels.length !== db.hotels.length;
};

export const getUsers = () => readDb().users;

export const addUser = (user) => {
  const db = readDb();
  writeDb({ ...db, users: [...db.users, user] });
  return user;
};

export const updateUserById = (id, patch) => {
  const db = readDb();
  let updated = null;
  const users = db.users.map((u) => {
    if (u.id !== id) return u;
    updated = { ...u, ...patch };
    return updated;
  });
  if (!updated && patch?.id) {
    updated = patch;
    users.push(updated);
  }
  writeDb({ ...db, users });
  return updated;
};

export const getLogs = () => readDb().logs;

export const addLog = (entry) => {
  const db = readDb();
  const logs = [entry, ...db.logs].slice(0, 500);
  writeDb({ ...db, logs });
  return entry;
};

export const getUserState = (userId) => {
  const db = readDb();
  return db.userStates[userId] || {
    favorites: [],
    favoriteNotes: {},
    recentlyViewedIds: [],
    compareIds: []
  };
};

export const setUserState = (userId, patch) => {
  const db = readDb();
  const current = db.userStates[userId] || {
    favorites: [],
    favoriteNotes: {},
    recentlyViewedIds: [],
    compareIds: []
  };
  const nextState = { ...current, ...patch };
  writeDb({
    ...db,
    userStates: { ...db.userStates, [userId]: nextState }
  });
  return nextState;
};

export const getDestinations = () => readDb().destinations;

export const setDestinations = (destinations) => {
  const db = readDb();
  writeDb({ ...db, destinations });
  return destinations;
};

export const bootstrapStore = ({ hotels = [], users = [], bookings = [], logs = [], destinations = [] } = {}) => {
  const db = readDb();
  const next = {
    ...db,
    hotels: db.hotels.length ? db.hotels : hotels,
    users: db.users.length ? db.users : users,
    bookings: db.bookings.length ? db.bookings : bookings,
    logs: db.logs.length ? db.logs : logs,
    destinations: db.destinations.length ? db.destinations : destinations
  };
  writeDb(next);
  return {
    hotels: next.hotels,
    users: next.users.map(sanitizeUser),
    bookings: next.bookings,
    logs: next.logs,
    destinations: next.destinations
  };
};
