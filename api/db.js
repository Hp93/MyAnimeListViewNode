const config = require('../config');
const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: config.redis.host,
        port: config.redis.port,
    },
    password: config.redis.password,
});

client.on('error', err => {
    console.log('Error ' + err);
});


const exportModule = {
    setAsync: setAsync,
    getAsync: getAsync,
    getTimestampAsync: getTimestampAsync,
};


async function setAsync(key, value) {
    if (!client.isReady) {
        await client.connect();
    }

    await client.set(key, value);
    await client.set(getTimestampKey(key), new Date().getTime());
}

async function getTimestampAsync(key) {
    if (!client.isReady) {
        await client.connect();
    }
    return await getAsync(getTimestampKey(key));
}

async function getAsync(key) {
    if (!client.isReady) {
        await client.connect();
    }
    return client.get(key);
}

function getTimestampKey(key) {
    return `${key}:time`;
}


module.exports = exportModule;
