const { getPool } = require('../../../../server/db');
const { requireAdmin } = require('../../../../server/auth');
const { handleApiError, methodNotAllowed } = require('../../../../server/http');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    await requireAdmin(req);
    const result = await getPool().query(
      `SELECT id, name, phone_e164, email, role, is_banned, created_at
         FROM users ORDER BY created_at DESC`
    );
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      phone: user.phone_e164,
      email: user.email || '',
      role: user.role,
      status: user.role === 'admin' ? 'Staff' : 'Standard',
      isBanned: user.is_banned,
      createdAt: user.created_at
    }));
    return res.status(200).json({ users });
  } catch (error) {
    return handleApiError(res, error);
  }
}
