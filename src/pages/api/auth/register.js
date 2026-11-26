import {
  addLog, addUser, createSession, getUsers, hashPassword,
  normalizePhoneDigits, phonesMatch, sanitizeUser
} from '../../../server/store';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { name, phone, email = '', password = '' } = req.body || {};
  const trimmedName = String(name || '').trim();
  const trimmedPhone = String(phone || '').trim();
  const trimmedEmail = String(email || '').trim();

  if (trimmedName.length < 2) {
    return res.status(400).json({ error: 'Укажите имя (минимум 2 символа)' });
  }
  if (normalizePhoneDigits(trimmedPhone).length < 6) {
    return res.status(400).json({ error: 'Введите корректный номер телефона' });
  }
  if (trimmedEmail && !trimmedEmail.includes('@')) {
    return res.status(400).json({ error: 'Введите корректный email' });
  }

  const existing = getUsers().find(
    (u) => u.status !== 'Staff' && phonesMatch(u.phone, trimmedPhone)
  );
  if (existing) {
    return res.status(409).json({
      error: 'Аккаунт с таким номером уже существует. Войдите по номеру!'
    });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name: trimmedName,
    phone: trimmedPhone,
    email: trimmedEmail,
    ...(password ? { passwordHash: hashPassword(password) } : {}),
    ltv: 0,
    status: 'Standard',
    isBanned: false,
    createdAt: new Date().toLocaleDateString('ru-RU')
  };

  addUser(newUser);
  const token = createSession(newUser.id);
  addLog({
    id: Date.now(),
    time: new Date().toLocaleString('ru-RU'),
    action: 'Регистрация (API)',
    details: `Создан аккаунт: ${newUser.name} (${newUser.phone})`,
    type: 'СИСТЕМА'
  });

  res.setHeader(
    'Set-Cookie',
    `at_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );
  return res.status(201).json({ user: sanitizeUser(newUser), token });
}
