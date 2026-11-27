const { randomUUID } = require('node:crypto');

async function recordAudit(client, { actorId = null, action, subjectType, subjectId, details = {} }) {
  await client.query(
    `INSERT INTO audit_events (id, actor_user_id, action, subject_type, subject_id, details)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [randomUUID(), actorId, action, subjectType, String(subjectId), JSON.stringify(details)]
  );
}

module.exports = { recordAudit };
