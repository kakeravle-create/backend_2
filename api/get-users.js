const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Step 1: Check admin key
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (req.headers['x-admin-key'] !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("amlverify");
    const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();
    await client.close();

    return res.status(200).json({ success: true, users, count: users.length });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: 'Server error', users: [] });
  }
};
