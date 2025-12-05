"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const jsonDb_1 = require("../db/jsonDb");
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function authRoutes(fastify) {
    fastify.post('/register', async (req, rep) => {
        const body = req.body;
        if (!body?.username || !body?.password)
            return rep.status(400).send({ error: 'missing fields' });
        const existing = jsonDb_1.db.findUserByUsername(body.username);
        if (existing)
            return rep.status(400).send({ error: 'username taken' });
        const hash = bcryptjs_1.default.hashSync(body.password, 8);
        const user = {
            id: (0, uuid_1.v4)(),
            username: body.username,
            passwordHash: hash,
            balance: 1000,
            positions: {},
            isAdmin: false
        };
        jsonDb_1.db.addUser(user);
        return { id: user.id, username: user.username, isAdmin: user.isAdmin };
    });
    fastify.post('/login', async (req, rep) => {
        const body = req.body;
        if (!body?.username || !body?.password)
            return rep.status(400).send({ error: 'missing fields' });
        const user = jsonDb_1.db.findUserByUsername(body.username);
        if (!user)
            return rep.status(401).send({ error: 'invalid' });
        const ok = bcryptjs_1.default.compareSync(body.password, user.passwordHash);
        if (!ok)
            return rep.status(401).send({ error: 'invalid' });
        // For simplicity return a token that's just the user id
        return { token: user.id, user: { id: user.id, username: user.username, balance: user.balance, isAdmin: user.isAdmin || false } };
    });
}
