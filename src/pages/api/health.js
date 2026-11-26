export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'astana-travel-api',
    timestamp: new Date().toISOString()
  });
}
