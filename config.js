var config = {};

config.redis = {};
config.web = {};

config.redis.host = process.env.REDIS_HOST || "";
config.redis.port = process.env.REDIS_PORT || "";
config.redis.password = process.env.REDIS_PASSWORD || "";
config.web.port = process.env.WEB_PORT || "3000";
config.web.cacheDay = process.env.WEB_CACHEDAY || 7;

module.exports = config;
