var fs = require('fs');

var configpath = "./config.json";
var smartblocksconf = JSON.parse(fs.readFileSync(configpath, 'UTF-8'));

exports.smartblocks = {config: smartblocksconf};