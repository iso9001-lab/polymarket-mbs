import { FastifyInstance } from 'fastify';
import { db } from '../db/jsonDb';
import { priceYes, priceNo } from '../lmsr/lmsr';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/me/positions', async (req, rep) => {
    const userId = (req.headers as any)['x-user-id'];
    if (!userId) return rep.status(401).send({ error: 'unauthorized' });
    
    const user = db.findUserById(userId);
    if (!user) return rep.status(404).send({ error: 'user not found' });
    
    const markets = db.getMarkets();
    const positions = markets.map(market => {
      const position = user.positions?.[market.id] || { yesShares: 0, noShares: 0 };
      return {
        marketId: market.id,
        title: market.title,
        yesShares: position.yesShares,
        noShares: position.noShares,
        currentYesPrice: priceYes(market.qYes, market.qNo, market.b),
        currentNoPrice: priceNo(market.qYes, market.qNo, market.b)
      };
    });
    
    return { user: { id: user.id, username: user.username, balance: user.balance }, positions };
  });
}
