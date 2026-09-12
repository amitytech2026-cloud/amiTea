let ordersStore = [];

async function redisCommand(command) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(command)
    });
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error('Redis connection error:', err);
    return null;
  }
}

async function getOrdersFromRedisOrMemory() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (url) {
    const result = await redisCommand(['GET', 'amitea_orders']);
    if (result) {
      try {
        return typeof result === 'string' ? JSON.parse(result) : result;
      } catch (e) {
        return [];
      }
    }
    return [];
  }
  return ordersStore;
}

async function saveOrdersToRedisOrMemory(orders) {
  ordersStore = orders;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  if (url) {
    await redisCommand(['SET', 'amitea_orders', JSON.stringify(orders)]);
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
      const orders = await getOrdersFromRedisOrMemory();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const newOrder = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      let orders = await getOrdersFromRedisOrMemory();
      if (newOrder && newOrder.id) {
        const index = orders.findIndex(o => o.id === newOrder.id);
        if (index >= 0) {
          orders[index] = newOrder;
        } else {
          orders.unshift(newOrder);
        }
        await saveOrdersToRedisOrMemory(orders);
      }
      return res.status(200).json(orders);
    }

    if (req.method === 'PATCH') {
      const patchData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, kitchenStatus, completedAt } = patchData || {};
      let orders = await getOrdersFromRedisOrMemory();
      const order = orders.find(o => o.id === id);
      if (order) {
        if (kitchenStatus) order.kitchenStatus = kitchenStatus;
        if (completedAt) order.completedAt = completedAt;
        await saveOrdersToRedisOrMemory(orders);
      }
      return res.status(200).json(orders);
    }

    if (req.method === 'DELETE') {
      await saveOrdersToRedisOrMemory([]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
