import { createClient } from 'redis';

let client = null;

async function getRedis() {
  if (client && client.isOpen) {
    return client;
  }
  const url = process.env.REDIS_URL || process.env.KV_URL;
  if (!url) return null;

  try {
    client = createClient({ url });
    client.on('error', (err) => console.error('Redis Client Error:', err));
    await client.connect();
    return client;
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    client = null;
    return null;
  }
}

let inMemoryOrders = [];

async function getOrders() {
  const redis = await getRedis();
  if (redis) {
    try {
      const data = await redis.get('amitea_orders');
      if (data) {
        return typeof data === 'string' ? JSON.parse(data) : data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching orders from Redis:', err);
    }
  }
  return inMemoryOrders;
}

async function saveOrders(orders) {
  inMemoryOrders = orders;
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set('amitea_orders', JSON.stringify(orders));
    } catch (err) {
      console.error('Error saving orders to Redis:', err);
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST,PUT,DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const orders = await getOrders();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const newOrder = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      let orders = await getOrders();
      if (newOrder && newOrder.id) {
        const index = orders.findIndex(o => o.id === newOrder.id);
        if (index >= 0) {
          orders[index] = newOrder;
        } else {
          orders.unshift(newOrder);
        }
        await saveOrders(orders);
      }
      return res.status(200).json(orders);
    }

    if (req.method === 'PATCH') {
      const patchData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, kitchenStatus, completedAt } = patchData || {};
      let orders = await getOrders();
      const order = orders.find(o => o.id === id);
      if (order) {
        if (kitchenStatus) order.kitchenStatus = kitchenStatus;
        if (completedAt) order.completedAt = completedAt;
        await saveOrders(orders);
      }
      return res.status(200).json(orders);
    }

    if (req.method === 'DELETE') {
      await saveOrders([]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
