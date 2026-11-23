const { getCurrentUser } = require('../../../server/auth');
const { handleApiError, methodNotAllowed } = require('../../../server/http');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!process.env.DATABASE_URL) {
    return res.status(200).json({
      mode: process.env.NODE_ENV === 'production' ? 'unavailable' : 'demo',
      user: null
    });
  }
  try {
    const user = await getCurrentUser(req);
    return res.status(200).json({ mode: 'backend', user });
  } catch (error) {
    return handleApiError(res, error);
  }
}
