"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const websocket_1 = require("../websocket");
const router = (0, express_1.Router)();
// Middleware to check for internal secret
const verifyInternalSecret = (req, res, next) => {
    const secret = req.headers['x-internal-secret'];
    const expectedSecret = process.env.INTERNAL_SECRET;
    if (!expectedSecret) {
        console.error('INTERNAL_SECRET not set in environment variables');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }
    if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized: Invalid internal secret' });
    }
    next();
};
router.post('/card-update', verifyInternalSecret, (req, res) => {
    const { card } = req.body;
    if (!card) {
        return res.status(400).json({ error: 'Missing card data' });
    }
    try {
        (0, websocket_1.broadcast)('cardUpdated', card);
        return res.json({ success: true, message: 'Broadcast triggered' });
    }
    catch (error) {
        console.error('Broadcast error:', error);
        return res.status(500).json({ error: 'Failed to broadcast' });
    }
});
exports.default = router;
