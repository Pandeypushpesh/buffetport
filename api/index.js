/**
 * API root endpoint
 * GET /api
 */
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Welcome to Portfolio API',
      version: '1.0.0'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

