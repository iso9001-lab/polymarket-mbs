import { FastifyInstance } from 'fastify';
import { db } from '../db/jsonDb';
import { v4 as uuidv4 } from 'uuid';
import { costToBuyDeltaYes, findQuantityForExactCost, priceYes } from '../lmsr/lmsr';

export default async function marketsRoutes(fastify: FastifyInstance) {
  fastify.get('/markets', async () => {
    return db.getMarkets();
  });

  fastify.get('/markets/:id', async (req, rep) => {
    const id = (req.params as any).id;
    const m = db.getMarket(id);
    if (!m) return rep.status(404).send({ error: 'not found' });
    return m;
  });

  fastify.post('/markets', async (req, rep) => {
    const body = req.body as any;
    if (!body?.title) return rep.status(400).send({ error: 'title required' });
    const market = {
      id: uuidv4(),
      title: body.title,
      description: body.description || '',
      qYes: 0,
      qNo: 0,
      b: body.b || 10
    };
    db.upsertMarket(market);
    return market;
  });

  fastify.post('/markets/:id/buy', async (req, rep) => {
    const id = (req.params as any).id;
    const body = req.body as any || {};
    const market = db.getMarket(id);
    if (!market) return rep.status(404).send({ error: 'market not found' });
    const b = market.b ?? 10;
    let delta = 0;
    let cost = 0;
    if (typeof body.deltaYes === 'number') {
      delta = body.deltaYes;
      cost = costToBuyDeltaYes(market.qYes, market.qNo, delta, b);
    } else if (typeof body.cost === 'number') {
      cost = body.cost;
      delta = findQuantityForExactCost(market.qYes, market.qNo, cost, b);
      cost = costToBuyDeltaYes(market.qYes, market.qNo, delta, b);
    } else {
      return rep.status(400).send({ error: 'provide deltaYes or cost' });
    }
    // Apply
    market.qYes += delta;
    db.upsertMarket(market);
    const trade = {
      id: uuidv4(),
      marketId: market.id,
      userId: body.userId || null,
      deltaYes: delta,
      cost: Number(cost.toFixed(6)),
      timestamp: Date.now()
    };
    db.addTrade(trade as any);
    return { trade, market };
  });

  fastify.get('/markets/:id/price', async (req, rep) => {
    const id = (req.params as any).id;
    const m = db.getMarket(id);
    if (!m) return rep.status(404).send({ error: 'not found' });
    return { priceYes: priceYes(m.qYes, m.qNo, m.b) };
  });
}
