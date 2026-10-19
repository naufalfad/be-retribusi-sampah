// Map to track requests: IP -> { count, resetTime }
const requestCounts = new Map();

// Periodic cleanup every 10 minutes to avoid memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(ip);
        }
    }
}, 10 * 60 * 1000);

/**
 * In-memory sliding window rate limiter
 * @param {Object} options
 * @param {number} options.windowMs - Window time in ms (default: 60s)
 * @param {number} options.max - Max requests per window (default: 15)
 * @param {string} options.message - Friendly rate limit message
 */
const rateLimiter = ({ windowMs = 60 * 1000, max = 15, message = 'Terlalu banyak permintaan pengecekan. Silakan tunggu 1 menit sebelum mencoba kembali demi keamanan data.' } = {}) => {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const record = requestCounts.get(ip);

        if (!record || now > record.resetTime) {
            requestCounts.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', max - 1);
            return next();
        }

        if (record.count >= max) {
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfterSec);
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', 0);
            return res.status(429).json({
                status: 'error',
                message: message,
                retryAfterSeconds: retryAfterSec
            });
        }

        record.count += 1;
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - record.count);
        next();
    };
};

module.exports = { rateLimiter };
