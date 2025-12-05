"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = adminRoutes;
const jsonDb_1 = require("../db/jsonDb");
// Helper to check admin status
function requireAdmin(user) {
    if (!user || !user.isAdmin) {
        throw new Error('Unauthorized: admin access required');
    }
}
async function adminRoutes(fastify) {
    fastify.post('/admin/markets/:id/resolveYes', async (req, rep) => {
        const id = req.params.id;
        const userId = req.headers['x-user-id'];
        if (!userId)
            return rep.status(401).send({ error: 'unauthorized' });
        const user = jsonDb_1.db.findUserById(userId);
        if (!user)
            return rep.status(404).send({ error: 'user not found' });
        try {
            requireAdmin(user);
        }
        catch (err) {
            return rep.status(403).send({ error: err.message });
        }
        const market = jsonDb_1.db.getMarket(id);
        if (!market)
            return rep.status(404).send({ error: 'market not found' });
        if (market.status === 'resolved') {
            return rep.status(400).send({ error: 'Market already resolved' });
        }
        // Resolve as YES and compute payouts
        market.status = 'resolved';
        market.result = 'YES';
        jsonDb_1.db.upsertMarket(market);
        // Distribute payouts to all users
        const allUsers = jsonDb_1.db.getAllUsers();
        for (const u of allUsers) {
            const position = u.positions?.[id];
            if (position) {
                const payout = position.yesShares * 1; // 1:1 payout for YES shares
                u.balance += payout;
                jsonDb_1.db.upsertUser(u);
            }
        }
        return { market, message: 'Market resolved as YES' };
    });
    fastify.post('/admin/markets/:id/resolveNo', async (req, rep) => {
        const id = req.params.id;
        const userId = req.headers['x-user-id'];
        if (!userId)
            return rep.status(401).send({ error: 'unauthorized' });
        const user = jsonDb_1.db.findUserById(userId);
        if (!user)
            return rep.status(404).send({ error: 'user not found' });
        try {
            requireAdmin(user);
        }
        catch (err) {
            return rep.status(403).send({ error: err.message });
        }
        const market = jsonDb_1.db.getMarket(id);
        if (!market)
            return rep.status(404).send({ error: 'market not found' });
        if (market.status === 'resolved') {
            return rep.status(400).send({ error: 'Market already resolved' });
        }
        // Resolve as NO and compute payouts
        market.status = 'resolved';
        market.result = 'NO';
        jsonDb_1.db.upsertMarket(market);
        // Distribute payouts to all users
        const allUsers = jsonDb_1.db.getAllUsers();
        for (const u of allUsers) {
            const position = u.positions?.[id];
            if (position) {
                const payout = position.noShares * 1; // 1:1 payout for NO shares
                u.balance += payout;
                jsonDb_1.db.upsertUser(u);
            }
        }
        return { market, message: 'Market resolved as NO' };
    });
    // Scoreboard endpoint
    fastify.get('/scoreboard', async (req, rep) => {
        const allUsers = jsonDb_1.db.getAllUsers();
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
