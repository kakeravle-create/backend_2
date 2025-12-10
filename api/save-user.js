const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { wallet, timestamp } = req.body;
    if (!wallet) return res.status(400).json({ success: false, error: 'Wallet required' });

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("amlverify");
    const users = db.collection("users");

    const userData = {
      wallet,
      timestamp: timestamp || new Date().toISOString()
    };

    await users.insertOne(userData);
    await client.close();

    console.log(`✅ User saved: ${wallet}`);
    return res.status(200).json({ success: true, message: 'User saved', user: userData });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
