var express = require('express');
var router = express.Router();
var mysql = require('promise-mysql');
// var ipRangeCheck =  require('ip-range-check');
var www = require('../options.js');

var mysqlConfig = {
    host: 'localhost',
    user: www.smartblocks.config.MySQL_USER || 'smartblocks',
    password: www.smartblocks.config.MySQL_PASS || ''
};

var cloudFlareData = {
    ipv4: [
        "173.245.48.0/20",
        "103.21.244.0/22",
        "103.22.200.0/22",
        "103.31.4.0/22",
        "141.101.64.0/18",
        "108.162.192.0/18",
        "190.93.240.0/20",
        "188.114.96.0/20",
        "197.234.240.0/22",
        "198.41.128.0/17",
        "162.158.0.0/15",
        "104.16.0.0/12",
        "172.64.0.0/13",
        "131.0.72.0/22"
    ],
    ipv6: [
        "2400:cb00::/32",
        "2606:4700::/32",
        "2803:f800::/32",
        "2405:b500::/32",
        "2405:8100::/32",
        "2a06:98c0::/29",
        "2c0f:f248::/32"
    ]
};

// Data from a http request, debugging purposes only -> CloudFlare
router.get('/api/clientinfo', function (req, res) {
    var data = {request: {}};

    data.request.baseUrl = req.baseUrl;
    data.request.cookies = req.cookies;
    data.request.headers = req.headers;
    data.request.hostname = req.header('x-forwarded-host');
    data.request.ip = req.header('cf-connecting-ip');
    data.request.method = req.method;
    data.request.originalUrl = req.originalUrl;
    data.request.params = req.params;
    data.request.path = req.path;
    data.request.protocol = req.protocol;
    data.request.query = req.query;

    res.end(JSON.stringify(data));
});

// Status endpoint, used by the webinterface to retrieve information for displaying the data
router.get(['/api/status/all/status.json', '/api/status/all/'], function (req, res) {
    var data = [];
    var connection;
    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig).then(function (c) {
        connection = c;
        return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
    }).then(function () {

        if (req.header("x-arduino-id") !== undefined) {
            connection.query('UPDATE `smartblocks`.`blocks` SET `lastactive` = CURRENT_TIMESTAMP WHERE `blocks`.`uuid` = ?;', req.params.uuid);
        }
    }).then(function () {
        return connection.query('SELECT * FROM `smartblocks`.`blocks`');
    }).then(function (d) {


        for (var i in d) {
            var idata = d[i];

            var tmp = {
                id: 0,
                uuid: null,
                json: "",
                lastactive: undefined,
            };

            tmp.id = idata.id;
            tmp.uuid = idata.uuid;
            tmp.name = idata.name;
            tmp.lastactive = idata.lastactive;
            try {
                tmp.json = JSON.parse(idata.json);
            } catch (SyntacError) {
                tmp.json = idata.json;
            }
            data.push(tmp);

        }
        connection.end();
        res.json(data);
    });
});

// Status endpoint for a specific smartblock
router.get(['/api/status/:uuid/status.json', '/api/status/:uuid/'], function (req, res) {
    var data = {};
    var connection;

    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig)
        .then(function (c) {
            connection = c;
            return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
        }).then(function () {

        if (req.header("x-arduino-id") !== undefined) {
            connection.query('UPDATE `smartblocks`.`blocks` SET `lastactive` = CURRENT_TIMESTAMP WHERE `blocks`.`uuid` = ?;', req.params.uuid);
        }
    }).then(function () {
        return connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
    }).then(function (d) {


        if (!(d.length > 0)) {
            connection.query('INSERT INTO `smartblocks`.`blocks` (`id`, `uuid`, `name`, `json`) VALUES (NULL, ?, ?, \'{}\');', [req.params.uuid, "Unnamed" + Math.floor(Math.random() * 100)]);
            d = connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
        }

        for (var i in d) {
            var idata = d[i];


            if (req.header("x-arduino-id") !== undefined) {
                data["metadata"] = {
                    "id": req.header("X-Arduino-ID"),
                    "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                };
            }

            data["id"] = idata.id;
            data["uuid"] = idata.uuid;
            data["name"] = idata.name;
            data["lastactive"] = idata.lastactive;

            try {
                data["json"] = JSON.parse(idata.json);
            } catch (SyntacError) {
                data["json"] = idata.json;
            }
        }
        connection.end();
        res.json(data);
    });
});

// Update endpoint used by the webinterface to update every variable with one request
router.post('/api/update/:uuid/', function (req, res) {
    var data = {};
    var connection;
    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig).then(function (c) {
        connection = c;
        return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
    }).then(function () {
        return connection.query('UPDATE `smartblocks`.`blocks` SET `name` = ?, `json` = ? WHERE `blocks`.`uuid` = ?;', [req.body.name, JSON.stringify(req.body.json), req.params.uuid]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        res.json(data);
    });
});

// Update endpoint to update the Name of a smartblock. Primarily used by the webinterface
router.post('/api/update/:uuid/name', function (req, res) {
    var data = {};
    var connection;
    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig).then(function (c) {
        connection = c;
        return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
    }).then(function () {
        console.log("body:", req.body);
        console.log("parans", req.params);
        return connection.query('UPDATE `smartblocks`.`blocks` SET name = ? WHERE uuid = ?;', [req.body.name, req.params.uuid]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        res.json(data);
    });
});

// Update endpoint to update a specific key of a specific smartblock
router.get('/api/update/:uuid/entry/:key/:value', function (req, res) {
    var data = {};
    var connection;

    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig).then(function (c) {
        connection = c;
        return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
    }).then(function () {
        return connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
    }).then(function (d) {

        if (!(d.length > 0)) {
            connection.query('INSERT INTO `smartblocks`.`blocks` (`id`, `uuid`, `name`, `json`) VALUES (NULL, ?, ?, \'{}\');', [req.params.uuid, "UnnamedBlock" + Math.floor(Math.random() * 1000)]);
            d = connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
        }

        for (var i in d) {
            var idata = d[i];

            data["id"] = idata.id;
            data["uuid"] = idata.uuid;
            data["name"] = idata.name;


            if (req.header("x-arduino-id") !== undefined) {
                data["metadata"] = {
                    "id": req.header("X-Arduino-ID"),
                    "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                };
            }


            try {
                data["json"] = JSON.parse(idata.json);
            } catch (SyntacError) {
                data["json"] = idata.json;
            }
        }

        data["json"][req.params.key] = req.params.value;

    }).then(function () {
        return connection.query('UPDATE `smartblocks`.`blocks` SET json = ?, lastactive = CURRENT_TIMESTAMP WHERE uuid = ?;', [JSON.stringify(data.json), req.params.uuid]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        // res.json(data);
        res.send(req.params.value);
    });
});

// Update endpoint to update a specific key of a specific smartblock
router.post('/api/update/:uuid/entry/:key/', function (req, res) {
    var data = {};
    var connection;

    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig).then(function (c) {
        connection = c;
        return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
    }).then(function () {
        return connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
    }).then(function (d) {

        if (!(d.length > 0)) {
            connection.query('INSERT INTO `smartblocks`.`blocks` (`id`, `uuid`, `name`, `json`) VALUES (NULL, ?, ?, \'{}\');', [req.params.uuid, "UnnamedBlock" + Math.floor(Math.random() * 1000)]);
            d = connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
        }

        for (var i in d) {
            var idata = d[i];


            if (req.header("x-arduino-id") !== undefined) {
                data["x-arduino-id"] = {
                    "id": req.header("X-Arduino-ID"),
                    "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                };
            }

            data["id"] = idata.id;
            data["uuid"] = idata.uuid;
            data["name"] = idata.name;
            try {
                data["json"] = JSON.parse(idata.json);
            } catch (SyntacError) {
                data["json"] = idata.json;
            }
        }

        console.log(req.body);
        console.log(req.params);

        data["json"][req.body.key] = JSON.parse(req.body.value);


    }).then(function () {
        return connection.query('UPDATE `smartblocks`.`blocks` SET json = ?, lastactive = CURRENT_TIMESTAMP WHERE uuid = ?;', [JSON.stringify(data.json), req.params.uuid]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        res.json(data);
    });
});

// Data for a specific key of a specific smartblock
router.get('/api/get/:uuid/entry/:key/', function (req, res) {
    var data = {};
    var connection;

    // noinspection JSUnresolvedFunction
    mysql.createConnection(mysqlConfig).then(function (c) {
        connection = c;
        return connection.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks`(`id` INT NOT NULL AUTO_INCREMENT, `uuid` VARCHAR(36) NOT NULL, `name` TEXT NOT NULL, `json` VARCHAR(255) NOT NULL, `lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(`id`)) ENGINE = InnoDB;');
    }).then(function () {
        return connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
    }).then(function (d) {
        if (!(d.length > 0)) {
            connection.query('INSERT INTO `smartblocks`.`blocks` (`id`, `uuid`, `name`, `json`) VALUES (NULL, ?, ?, \'{}\');', [req.params.uuid, "UnnamedBlock" + Math.floor(Math.random() * 1000)]);
            d = connection.query('SELECT * FROM `smartblocks`.`blocks` WHERE `uuid` = ?;', [req.params.uuid]);
        }

        for (var i in d) {
            var idata = d[i];


            if (req.header("x-arduino-id") !== undefined) {
                data["x-arduino-id"] = {
                    "id": req.header("X-Arduino-ID"),
                    "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                };
            }

            data["id"] = idata.id;
            data["uuid"] = idata.uuid;
            data["name"] = idata.name;
            try {
                data["json"] = JSON.parse(idata.json);
            } catch (SyntacError) {
                data["json"] = idata.json;
            }
        }
    }).then(function () {
        connection.end();
        var tmp = data["json"][req.params.key];
        if (!isNaN(Number(tmp))) tmp = Number(tmp);
        res.json(tmp);
    });
});

module.exports = router;
