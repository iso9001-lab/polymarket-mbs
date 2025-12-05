"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
const health_1 = __importDefault(require("./health"));
const auth_1 = __importDefault(require("./auth"));
const markets_1 = __importDefault(require("./markets"));
const user_1 = __importDefault(require("./user"));
const admin_1 = __importDefault(require("./admin"));
async function routes(fastify) {
    await (0, health_1.default)(fastify);
    await (0, auth_1.default)(fastify);
    await (0, markets_1.default)(fastify);
    await (0, user_1.default)(fastify);
    await (0, admin_1.default)(fastify);
}
