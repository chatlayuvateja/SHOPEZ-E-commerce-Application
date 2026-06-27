const corsMiddleware = (options = {}) => {
  const origin = options.origin || '*';
  const credentials = options.credentials || false;

  return (req, res, next) => {
    const requestOrigin = req.headers.origin;
    
    // In development, allow any localhost origin
    const isDev = process.env.NODE_ENV === 'development';
    const isLocalhost = requestOrigin && (
      requestOrigin.startsWith('http://localhost:') ||
      requestOrigin.startsWith('http://127.0.0.1:') ||
      requestOrigin.startsWith('http://0.0.0.0:')
    );

    if (isDev && isLocalhost) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    } else if (origin === '*' && !credentials) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin === requestOrigin ? origin : (requestOrigin || origin));
    } else if (Array.isArray(origin)) {
      if (origin.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      }
    }

    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  };
};

module.exports = { corsMiddleware };
