"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const jsonDb_1 = require("../db/jsonDb");
const lmsr_1 = require("../lmsr/lmsr");
async function userRoutes(fastify) {
    fastify.get('/me/positions', async (req, rep) => {
        const userId = req.headers['x-user-id'];
        if (!userId)
            return rep.status(401).send({ error: 'unauthorized' });
        const user = jsonDb_1.db.findUserById(userId);
        if (!user)
            return rep.status(404).send({ error: 'user not found' });
        const markets = jsonDb_1.db.getMarkets();
        const positions = markets.map(market => {
            const position = user.positions?.[market.id] || { yesShares: 0, noShares: 0 };
            return {
                marketId: market.id,
                title: market.title,
                yesShares: position.yesShares,
                noShares: position.noShares,
                currentYesPrice: (0, lmsr_1.priceYes)(market.qYes, market.qNo, market.b),
                currentNoPrice: (0, lmsr_1.priceNo)(market.qYes, market.qNo, market.b)
            };
        });
        return { user: { id: user.id, username: user.username, balance: user.balance }, positions };
    });
}
