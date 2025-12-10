const { MongoClient, ObjectId } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Check admin key
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (req.headers['x-admin-key'] !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { wallet } = req.body;
    if (!wallet) return res.status(400).json({ success: false, error: 'Wallet required' });

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db("amlverify");
    const users = db.collection("users");

    const result = await users.deleteOne({ wallet: wallet });
    await client.close();

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log(`🗑️ User deleted: ${wallet}`);
    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
