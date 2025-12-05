"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = marketsRoutes;
const jsonDb_1 = require("../db/jsonDb");
const uuid_1 = require("uuid");
const lmsr_1 = require("../lmsr/lmsr");
async function marketsRoutes(fastify) {
    fastify.get('/markets', async () => {
        return jsonDb_1.db.getMarkets();
    });
    fastify.get('/markets/:id', async (req, rep) => {
        const id = req.params.id;
        const m = jsonDb_1.db.getMarket(id);
        if (!m)
            return rep.status(404).send({ error: 'not found' });
        return m;
    });
    fastify.post('/markets', async (req, rep) => {
        const body = req.body;
        if (!body?.title)
            return rep.status(400).send({ error: 'title required' });
        const market = {
            id: (0, uuid_1.v4)(),
            title: body.title,
            description: body.description || '',
            qYes: 0,
            qNo: 0,
            b: body.b || 10
        };
        jsonDb_1.db.upsertMarket(market);
        return market;
    });
    fastify.post('/markets/:id/buy', async (req, rep) => {
        const id = req.params.id;
        const body = req.body || {};
        const userId = body.userId;
        const market = jsonDb_1.db.getMarket(id);
        if (!market)
            return rep.status(404).send({ error: 'market not found' });
        // Block trades on resolved markets
        if (market.status === 'resolved') {
            return rep.status(400).send({ error: 'Market already resolved' });
        }
        let user = null;
        if (userId) {
            user = jsonDb_1.db.findUserById(userId);
            if (!user)
                return rep.status(404).send({ error: 'user not found' });
        }
        const b = market.b ?? 10;
        let delta = 0;
        let cost = 0;
        let tradeType = 'yes';
        const MAX_SHARES_PER_TRADE = 10;
        const MAX_COST_PER_MARKET = 100;
        if (typeof body.deltaYes === 'number') {
            if (body.deltaYes <= 0)
                return rep.status(400).send({ error: 'deltaYes must be positive' });
            if (body.deltaYes > MAX_SHARES_PER_TRADE)
                return rep.status(400).send({ error: `Maximum ${MAX_SHARES_PER_TRADE} shares per trade` });
            tradeType = 'yes';
            delta = body.deltaYes;
            cost = (0, lmsr_1.costToBuyDeltaYes)(market.qYes, market.qNo, delta, b);
        }
        else if (typeof body.deltaNo === 'number') {
            if (body.deltaNo <= 0)
                return rep.status(400).send({ error: 'deltaNo must be positive' });
            if (body.deltaNo > MAX_SHARES_PER_TRADE)
                return rep.status(400).send({ error: `Maximum ${MAX_SHARES_PER_TRADE} shares per trade` });
            tradeType = 'no';
            delta = body.deltaNo;
            cost = (0, lmsr_1.costToBuyDeltaNo)(market.qYes, market.qNo, delta, b);
        }
        else if (typeof body.cost === 'number') {
            if (body.cost <= 0)
                return rep.status(400).send({ error: 'cost must be positive' });
            if (body.cost > MAX_COST_PER_MARKET)
                return rep.status(400).send({ error: `Maximum $${MAX_COST_PER_MARKET} per market` });
            tradeType = body.tradeType || 'yes';
            cost = body.cost;
            delta = (0, lmsr_1.findQuantityForExactCost)(market.qYes, market.qNo, cost, b, tradeType);
            const costFn = tradeType === 'yes'
                ? (d) => (0, lmsr_1.costToBuyDeltaYes)(market.qYes, market.qNo, d, b)
                : (d) => (0, lmsr_1.costToBuyDeltaNo)(market.qYes, market.qNo, d, b);
            cost = costFn(delta);
        }
        else {
            return rep.status(400).send({ error: 'provide deltaYes, deltaNo, or cost' });
        }
        // Check total spent per user on this market (limit is per user per market)
        if (user) {
            const spentByUser = jsonDb_1.db.getTotalSpentByUserOnMarket(user.id, id);
            if (spentByUser + cost > MAX_COST_PER_MARKET) {
                return rep.status(400).send({ error: `Maximum $${MAX_COST_PER_MARKET} per market per user. Already spent $${spentByUser.toFixed(2)}` });
            }
        }
        // Check user balance if user is present
        if (user && user.balance < cost) {
            return rep.status(400).send({ error: 'insufficient balance' });
        }
        // Apply
        if (tradeType === 'yes') {
            market.qYes += delta;
        }
        else {
            market.qNo += delta;
        }
        jsonDb_1.db.upsertMarket(market);
        // Update user portfolio and balance
        if (user) {
            if (!user.positions)
                user.positions = {};
            if (!user.positions[id])
                user.positions[id] = { yesShares: 0, noShares: 0 };
            if (tradeType === 'yes') {
                user.positions[id].yesShares += delta;
            }
            else {
                user.positions[id].noShares += delta;
            }
            user.balance -= cost;
            jsonDb_1.db.upsertUser(user);
        }
        const trade = {
            id: (0, uuid_1.v4)(),
            marketId: market.id,
            userId: userId || null,
            deltaYes: tradeType === 'yes' ? delta : 0,
            deltaNo: tradeType === 'no' ? delta : 0,
            cost: Number(cost.toFixed(6)),
            timestamp: Date.now()
        };
        jsonDb_1.db.addTrade(trade);
        return { trade, market, user };
    });
    // Returns remaining allowance for the authenticated user on this market
    fastify.get('/markets/:id/allowance', async (req, rep) => {
        const id = req.params.id;
        const userId = req.headers['x-user-id'];
        const MAX_COST_PER_MARKET = 100;
        if (!userId)
            return rep.status(401).send({ error: 'unauthorized' });
        const user = jsonDb_1.db.findUserById(userId);
        if (!user)
            return rep.status(404).send({ error: 'user not found' });
        const market = jsonDb_1.db.getMarket(id);
        if (!market)
            return rep.status(404).send({ error: 'market not found' });
        const spent = jsonDb_1.db.getTotalSpentByUserOnMarket(userId, id);
        const remaining = Math.max(0, MAX_COST_PER_MARKET - spent);
        return { remainingAllowance: Number(remaining.toFixed(6)), spent: Number(spent.toFixed(6)), limit: MAX_COST_PER_MARKET };
    });
    fastify.get('/markets/:id/price', async (req, rep) => {
        const id = req.params.id;
        const m = jsonDb_1.db.getMarket(id);
        if (!m)
            return rep.status(404).send({ error: 'not found' });
        return { priceYes: (0, lmsr_1.priceYes)(m.qYes, m.qNo, m.b), priceNo: (0, lmsr_1.priceNo)(m.qYes, m.qNo, m.b) };
    });
}
