// cache.js

const NodeCache = require('node-cache');
const cacheStorage = new NodeCache();

module.exports = cacheStorage;