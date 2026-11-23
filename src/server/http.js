class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

function ensureSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) {
    throw new ApiError(403, 'Запрос должен быть отправлен с этого сайта');
  }

  let originHost;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    throw new ApiError(403, 'Недопустимый источник запроса');
  }

  if (originHost !== host.toLowerCase()) {
    throw new ApiError(403, 'Запрос с другого сайта запрещён');
  }
}

function requireJsonBody(req) {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    throw new ApiError(415, 'Ожидается JSON-запрос');
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new ApiError(400, 'Некорректное тело запроса');
  }
  return req.body;
}

function methodNotAllowed(res, methods) {
  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ error: 'Метод не поддерживается' });
}

function handleApiError(res, error) {
  if (error instanceof ApiError || Number.isInteger(error?.statusCode)) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'Запись с такими данными уже существует' });
  }

  console.error('[api] request failed', error?.code || error?.name || 'UnknownError');
  return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

module.exports = {
  ApiError,
  ensureSameOrigin,
  requireJsonBody,
  methodNotAllowed,
  handleApiError
};
