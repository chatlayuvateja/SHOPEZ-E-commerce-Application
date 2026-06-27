const parseCookies = (req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const name = parts[0]?.trim();
      const value = parts.slice(1).join('=').trim();
      if (name) {
        req.cookies[name] = decodeURIComponent(value);
      }
    });
  }
  next();
};

module.exports = { parseCookies };
