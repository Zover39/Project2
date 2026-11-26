import { getUserState, setUserState } from '../../server/store';

export default function handler(req, res) {
  const userId = req.query.userId || req.body?.userId;
  if (!userId) {
    return res.status(400).json({ error: 'Требуется userId' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ state: getUserState(userId) });
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { favorites, favoriteNotes, recentlyViewedIds, compareIds } = req.body || {};
    const patch = {};
    if (Array.isArray(favorites)) patch.favorites = favorites;
    if (favoriteNotes && typeof favoriteNotes === 'object') patch.favoriteNotes = favoriteNotes;
    if (Array.isArray(recentlyViewedIds)) patch.recentlyViewedIds = recentlyViewedIds;
    if (Array.isArray(compareIds)) patch.compareIds = compareIds;
    const state = setUserState(userId, patch);
    return res.status(200).json({ state });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'PATCH']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
