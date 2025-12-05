import { FastifyInstance } from 'fastify';
import { db } from '../db/jsonDb';

// Helper to check admin status
function requireAdmin(user: any) {
  if (!user || !user.isAdmin) {
    throw new Error('Unauthorized: admin access required');
  }
}

export default async function adminRoutes(fastify: FastifyInstance) {
  fastify.post('/admin/markets/:id/resolveYes', async (req, rep) => {
    const id = (req.params as any).id;
    const userId = (req.headers as any)['x-user-id'];

    if (!userId) return rep.status(401).send({ error: 'unauthorized' });
    const user = db.findUserById(userId);
    if (!user) return rep.status(404).send({ error: 'user not found' });

    try {
      requireAdmin(user);
    } catch (err: any) {
      return rep.status(403).send({ error: err.message });
    }

    const market = db.getMarket(id);
    if (!market) return rep.status(404).send({ error: 'market not found' });

    if (market.status === 'resolved') {
      return rep.status(400).send({ error: 'Market already resolved' });
    }

    // Resolve as YES and compute payouts
    market.status = 'resolved';
    market.result = 'YES';
    db.upsertMarket(market);

    // Distribute payouts to all users
    const allUsers = db.getAllUsers();
    for (const u of allUsers) {
      const position = u.positions?.[id];
      if (position) {
        const payout = position.yesShares * 1; // 1:1 payout for YES shares
        u.balance += payout;
        db.upsertUser(u);
      }
    }

    return { market, message: 'Market resolved as YES' };
  });

  fastify.post('/admin/markets/:id/resolveNo', async (req, rep) => {
    const id = (req.params as any).id;
    const userId = (req.headers as any)['x-user-id'];

    if (!userId) return rep.status(401).send({ error: 'unauthorized' });
    const user = db.findUserById(userId);
    if (!user) return rep.status(404).send({ error: 'user not found' });

    try {
      requireAdmin(user);
    } catch (err: any) {
      return rep.status(403).send({ error: err.message });
    }

    const market = db.getMarket(id);
    if (!market) return rep.status(404).send({ error: 'market not found' });

    if (market.status === 'resolved') {
      return rep.status(400).send({ error: 'Market already resolved' });
    }

    // Resolve as NO and compute payouts
    market.status = 'resolved';
    market.result = 'NO';
    db.upsertMarket(market);

    // Distribute payouts to all users
    const allUsers = db.getAllUsers();
    for (const u of allUsers) {
      const position = u.positions?.[id];
      if (position) {
        const payout = position.noShares * 1; // 1:1 payout for NO shares
        u.balance += payout;
        db.upsertUser(u);
      }
    }

    return { market, message: 'Market resolved as NO' };
  });

  // Scoreboard endpoint
  fastify.get('/scoreboard', async (req, rep) => {
    const allUsers = db.getAllUsers();
    const scoreboard = allUsers.map(u => ({
      username: u.username,
      balance: u.balance,
      id: u.id
    }));
    // Sort by balance descending
    scoreboard.sort((a, b) => b.balance - a.balance);
    return { scoreboard };
  });
}
