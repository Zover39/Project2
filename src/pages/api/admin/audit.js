const { getPool } = require('../../../server/db');
const { requireAdmin } = require('../../../server/auth');
const { handleApiError, methodNotAllowed } = require('../../../server/http');

const auditLabels = {
  booking_created: ['Новая заявка', 'ПОКУПКА'],
  booking_cancel: ['Заявка отменена', 'ПОКУПКА'],
  booking_restore: ['Заявка восстановлена', 'СИСТЕМА'],
  booking_set_status: ['Изменён статус заявки', 'ПОКУПКА'],
  user_blocked: ['Пользователь ограничен', 'МОДЕРАЦИЯ'],
  user_unblocked: ['Пользователь разблокирован', 'МОДЕРАЦИЯ'],
  hotel_created: ['Отель добавлен', 'СИСТЕМА'],
  hotel_updated: ['Данные отеля изменены', 'СИСТЕМА'],
  hotel_archived: ['Отель архивирован', 'СИСТЕМА'],
  hotel_published: ['Отель опубликован', 'СИСТЕМА'],
  catalog_bulk_price: ['Массовое изменение цен', 'СИСТЕМА'],
  catalog_bulk_price_undone: ['Изменение цен отменено', 'СИСТЕМА'],
  destination_directory_updated: ['Справочник направлений обновлён', 'СИСТЕМА'],
  review_submitted: ['Новый отзыв', 'СИСТЕМА'],
  review_published: ['Отзыв опубликован', 'МОДЕРАЦИЯ'],
  review_rejected: ['Отзыв отклонён', 'МОДЕРАЦИЯ'],
  review_deleted: ['Отзыв удалён', 'МОДЕРАЦИЯ'],
  review_replied: ['Ответ на отзыв', 'МОДЕРАЦИЯ'],
  profile_updated: ['Профиль обновлён', 'СИСТЕМА'],
  account_registered: ['Аккаунт создан', 'СИСТЕМА']
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    await requireAdmin(req);
    const result = await getPool().query(
      `SELECT a.id, a.action, a.subject_type, a.subject_id, a.details, a.created_at, u.name AS actor_name
         FROM audit_events a LEFT JOIN users u ON u.id = a.actor_user_id
        ORDER BY a.created_at DESC LIMIT 500`
    );
    const logs = result.rows.map(row => {
      const [action, type] = auditLabels[row.action] || [row.action, 'СИСТЕМА'];
      const details = row.details || {};
      return {
        id: row.id,
        action,
        type,
        time: new Date(row.created_at).toLocaleString('ru-RU'),
        details: [
          row.actor_name,
          details.name,
          details.hotelId,
          details.country,
          details.percent != null ? `${details.percent}%` : '',
          row.subject_type !== 'hotel_review' && row.subject_type !== 'user' ? row.subject_id : ''
        ].filter(Boolean).join(' · ')
      };
    });
    return res.status(200).json({ logs });
  } catch (error) {
    return handleApiError(res, error);
  }
}
