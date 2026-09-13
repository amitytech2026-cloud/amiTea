// Serverless API authentication handler for amiTEA staff users
// Keys/PINs can be stored in Vercel KV Database (`amitea_staff_pins`), environment variables, or local dev defaults.
import { createClient } from 'redis';

let redisClient = null;

async function getRedis() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }
  const url = process.env.REDIS_URL || process.env.KV_URL;
  if (!url) return null;

  try {
    redisClient = createClient({ url });
    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error('Failed to connect to Redis/KV:', err);
    redisClient = null;
    return null;
  }
}

function getDefaultStaffUsers() {
  return {
    manager: {
      pin: process.env.MANAGER_PIN || '2262',
      name: 'Manager',
      role: 'manager'
    },
    cashier1: {
      pin: process.env.CASHIER1_PIN || process.env.Nyjah || '1001',
      name: 'Nyjah',
      role: 'cashier'
    },
    cashier2: {
      pin: process.env.CASHIER2_PIN || process.env.Lucci || '1002',
      name: 'Lucci',
      role: 'cashier'
    },
    kitchen: {
      pin: process.env.KITCHEN_PIN || '2001',
      name: 'Kitchen Barista',
      role: 'kitchen'
    }
  };
}

async function getStaffUsers() {
  let configuredUsers = null;

  // Explicit Vercel environment configuration takes precedence over stale KV data.
  if (process.env.STAFF_USERS_JSON) {
    try {
      configuredUsers = JSON.parse(process.env.STAFF_USERS_JSON);
    } catch (e) {
      console.error('Failed to parse STAFF_USERS_JSON env var:', e);
    }
  }

  // 1. Try Vercel KV database key `amitea_staff_pins`
  const redis = await getRedis();
  if (!configuredUsers && redis) {
    try {
      const kvData = await redis.get('amitea_staff_pins');
      if (kvData) {
        configuredUsers = typeof kvData === 'string' ? JSON.parse(kvData) : kvData;
      }
    } catch (err) {
      console.error('Error fetching staff PINs from Vercel KV:', err);
    }
  }

  // Merge each account separately so stale KV records cannot remove a PIN or role.
  const defaultUsers = getDefaultStaffUsers();
  const users = Object.fromEntries(
    Object.entries(defaultUsers).map(([username, defaults]) => [
      username,
      { ...defaults, ...(configuredUsers?.[username] || {}) }
    ])
  );

  // Environment variables are the explicit deployment source of truth for PINs.
  if (process.env.MANAGER_PIN) users.manager.pin = process.env.MANAGER_PIN;
  if (process.env.CASHIER1_PIN || process.env.Nyjah) users.cashier1.pin = process.env.CASHIER1_PIN || process.env.Nyjah;
  if (process.env.CASHIER2_PIN || process.env.Lucci) users.cashier2.pin = process.env.CASHIER2_PIN || process.env.Lucci;
  if (process.env.KITCHEN_PIN) users.kitchen.pin = process.env.KITCHEN_PIN;

  users.cashier1.name = 'Nyjah';
  users.cashier2.name = 'Lucci';
  users.kitchen.name = 'Kitchen Barista';
  return users;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const staffUsers = await getStaffUsers();

  if (req.method === 'GET') {
    // Return list of available user accounts (public info only, NO pins/keys)
    const publicUsers = Object.keys(staffUsers).map(id => ({
      username: id,
      name: staffUsers[id].name,
      role: staffUsers[id].role
    }));
    return res.status(200).json(publicUsers);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { username, pin } = body || {};

      if (!username || !pin) {
        return res.status(400).json({ success: false, error: 'Username and PIN are required.' });
      }

      const userAcc = staffUsers[username];
      if (userAcc && String(userAcc.pin).trim() === String(pin).trim()) {
        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        return res.status(200).json({
          success: true,
          token,
          user: {
            username,
            name: userAcc.name,
            role: userAcc.role
          }
        });
      }

      return res.status(401).json({ success: false, error: 'Invalid user or PIN.' });
    } catch (err) {
      console.error('Auth handler error:', err);
      return res.status(500).json({ success: false, error: 'Server authentication error.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
