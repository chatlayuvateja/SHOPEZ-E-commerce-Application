const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'shopez-jwt-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'shopez-jwt-refresh-secret-change-in-production';

const base64UrlEncode = (data) => {
  return Buffer.from(data)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (str) => {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
};

const createSignature = (data, secret) => {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
};

const sign = (payload, secret, expiresIn) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = createSignature(data, secret);

  return `${data}.${signature}`;
};

const verify = (token, secret) => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerEncoded, payloadEncoded, signature] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expectedSignature = createSignature(data, secret);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(base64UrlDecode(payloadEncoded));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && now > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
};

const generateAccessToken = (userId, role) => {
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN) || 900; // 15 minutes
  return sign({ id: userId, role }, JWT_SECRET, expiresIn);
};

const generateRefreshToken = (userId) => {
  const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 604800; // 7 days
  return sign({ id: userId }, JWT_REFRESH_SECRET, expiresIn);
};

const sendTokenResponse = async (user, statusCode, res, db) => {
  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  await db.collection('users').updateOne(
    { _id: user._id },
    { $set: { refreshToken } }
  );

  const isProduction = process.env.NODE_ENV === 'production';

  res.setHeader('Set-Cookie', [
    `accessToken=${accessToken}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=900`,
    `refreshToken=${refreshToken}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=604800`,
  ]);

  res.status(statusCode).json({
    status: 'success',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse,
  sign,
  verify,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
};
