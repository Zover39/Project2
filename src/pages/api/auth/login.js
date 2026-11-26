import {
  addLog, createSession, getUsers, normalizePhoneDigits,
  phonesMatch, sanitizeUser, verifyPassword
} from '../../../server/store';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { phone, userId, password = '' } = req.body || {};
  const users = getUsers().filter((u) => u.status !== 'Staff');

  let user = null;
  if (userId) {
    user = users.find((u) => u.id === userId) || null;
  } else {
    if (normalizePhoneDigits(phone).length < 6) {
      return res.status(400).json({ error: 'Введите корректный номер телефона' });
    }
    user = users.find((u) => phonesMatch(u.phone, phone)) || null;
  }

  if (!user) {
    return res.status(404).json({ error: 'Аккаунт не найден. Создайте новый профиль!' });
  }
  if (user.isBanned) {
    return res.status(403).json({ error: 'Этот аккаунт заблокирован модератором' });
  }
  if (user.passwordHash && password && !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  const token = createSession(user.id);
  addLog({
    id: Date.now(),
    time: new Date().toLocaleString('ru-RU'),
    action: 'Вход в аккаунт (API)',
    details: `Активный профиль: ${user.name}`,
    type: 'СИСТЕМА'
  });

  res.setHeader(
    'Set-Cookie',
    `at_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );
  return res.status(200).json({ user: sanitizeUser(user), token });
}
