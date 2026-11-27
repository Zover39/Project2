import { generateHotels } from '../../../data/appData';
import { buildDefaultDestinationDirectory } from '../../../utils/destinations';

const { getPool } = require('../../../server/db');
const { getCurrentUser } = require('../../../server/auth');
const { getCatalog, seedCatalog } = require('../../../server/catalog');
const { handleApiError, methodNotAllowed } = require('../../../server/http');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const pool = getPool();
    const user = await getCurrentUser(req);
    await seedCatalog(pool, generateHotels(), buildDefaultDestinationDirectory());
    const catalog = await getCatalog(pool, user);
    return res.status(200).json(catalog);
  } catch (error) {
    return handleApiError(res, error);
  }
}
