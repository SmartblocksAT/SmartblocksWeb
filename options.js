let fs = require('fs');

let configpath = "./config.json";
let smartblocksconf = JSON.parse(fs.readFileSync(configpath, 'UTF-8'));

exports.smartblocks = {config: smartblocksconf};