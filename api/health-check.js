export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ isHealthy: false, statusCode: 405, responseTime: 0, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const url = body.url;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return res.status(400).json({
        isHealthy: false,
        statusCode: 0,
        responseTime: 0,
        error: 'Invalid or missing HTTP/HTTPS URL',
      });
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'ProjectVault-HealthMonitor/1.0',
          Accept: '*/*',
        },
      });
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      const isHealthy = statusCode >= 200 && statusCode < 400;

      return res.status(200).json({
        isHealthy,
        statusCode,
        responseTime,
        error: isHealthy ? undefined : `HTTP Status ${statusCode}`,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      const isTimeout = err.name === 'AbortError';

      return res.status(200).json({
        isHealthy: false,
        statusCode: isTimeout ? 408 : 503,
        responseTime,
        error: isTimeout ? 'Request timed out after 8s' : (err.message || 'Connection unreachable'),
      });
    }
  } catch (err) {
    return res.status(500).json({
      isHealthy: false,
      statusCode: 500,
      responseTime: 0,
      error: err.message || 'Internal health check error',
    });
  }
}
