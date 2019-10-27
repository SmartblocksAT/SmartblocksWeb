let express = require('express');
let router = express.Router();
let mysql = require('promise-mysql');
let options = require('../options.js');

let mysqlConfig = {
    host: 'localhost',
    user: options.smartblocks.config.MySQL_USER || 'smartblocks',
    password: options.smartblocks.config.MySQL_PASS || ''
};

// Data from a http request, debugging purposes only -> CloudFlare
router.get('/api/clientinfo', function (req, res) {
    let data = {request: {}};

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
    let data = [];
    let connection;
    // noinspection JSUnresolvedFunction

    createSQL(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
    .then(function () {

        if (req.header("x-arduino-id") !== undefined) {
            console.log(req.header("x-arduino-id"));
            connection.query('UPDATE `smartblocks`.`blocks` SET `lastactive` = CURRENT_TIMESTAMP WHERE mac = ?;', req.header("x-arduino-id"));
        }

    }).then(function () {
        return connection.query('SELECT * FROM `smartblocks`.`blocks`');
    }).then(function (d) {


        for (let i in d) {
            let idata = d[i];

            let tmp = {
                id: 0,
                mac: null,
                json: "",
                lastactive: undefined,
            };

            tmp.id = idata.id;
            tmp.mac = idata.mac;
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
router.get(['/api/status/:mac/status.json', '/api/status/:mac/'], function (req, res) {
    let data = {};
    let connection;
    while(req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");

    }
    createSQLandCheckBlock(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
    .then(function (d) {
        for (let i in d) {
            let idata = d[i];


            if (req.header("x-arduino-id") !== undefined) {
                console.log(req.header("x-arduino-id"));
                connection.query('UPDATE `smartblocks`.`blocks` SET lastactive = CURRENT_TIMESTAMP WHERE mac = ?;', [req.params.mac]);
                data["metadata"] = {
                    "id": req.header("X-Arduino-ID"),
                    "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                };
            }

            data["id"] = idata.id;
            data["mac"] = idata.mac;
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
router.post('/api/update/:mac/', function (req, res) {
    let data = {};
    let connection;

    while(req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    createSQLandCheckBlock(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
        .then(function () {
        return connection.query('UPDATE `smartblocks`.`blocks` SET `name` = ?, `json` = ? WHERE mac = ?;', [req.body.name, JSON.stringify(req.body.json), req.params.mac]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        res.json(data);
    });
});

// Update endpoint to update the Name of a smartblock. Primarily used by the webinterface
router.post('/api/update/:mac/name', function (req, res) {
    let data = {};
    let connection;

    while(req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    createSQLandCheckBlock(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
    .then(function () {

        return connection.query('UPDATE `smartblocks`.`blocks` SET name = ? WHERE mac = ?;', [req.body.name, req.params.mac]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        res.json(data);
    });
});

// Update endpoint to update a specific key of a specific smartblock
router.get('/api/update/:mac/entry/:key/:value', function (req, res) {
    let data = {};
    let connection;

    while(req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    createSQLandCheckBlock(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
    .then(function (d) {
        for (let i in d) {
            let idata = d[i];

            data["id"] = idata.id;
            data["mac"] = idata.mac;
            data["name"] = idata.name;


            if (req.header("x-arduino-id") !== undefined) {
                connection.query('UPDATE `smartblocks`.`blocks` SET lastactive = CURRENT_TIMESTAMP WHERE mac = ?;', [req.params.mac]);
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

    })/*.then(function () {
        return connection.query('UPDATE `smartblocks`.`blocks` SET lastactive = CURRENT_TIMESTAMP WHERE mac = ?;', [req.params.mac]);
    })*/.then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        // res.json(data);
        res.send(req.params.value);
    });
});

// Update endpoint to update a specific key of a specific smartblock
router.post('/api/update/:mac/entry/:key/', function (req, res) {
    let data = {};
    let connection;

    while(req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    // noinspection JSUnresolvedFunction

    createSQLandCheckBlock(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
    .then(function (d) {
        for (let i in d) {
            let idata = d[i];


            if (req.header("x-arduino-id") !== undefined) {
                connection.query('UPDATE `smartblocks`.`blocks` SET lastactive = CURRENT_TIMESTAMP WHERE mac = ?;', [req.params.mac]);
                data["x-arduino-id"] = {
                    "id": req.header("X-Arduino-ID"),
                    "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                };
            }

            data["id"] = idata.id;
            data["mac"] = idata.mac;
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
        return connection.query('UPDATE `smartblocks`.`blocks` SET lastactive = CURRENT_TIMESTAMP WHERE mac = ?;', [req.params.mac]);
    }).then(function (d) {
        connection.end();
        data.affectedRows = d.affectedRows;
        res.json(data);
    });
});

// Data for a specific key of a specific smartblock
router.get('/api/get/:mac/entry/:key/', function (req, res) {
    let data = {};
    let connection;

    while(req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    // noinspection JSUnresolvedFunction
    createSQLandCheckBlock(mysqlConfig, req.params.mac)
        .then(data => {
            connection = data[0];
            return data[1];
        })
        .then(function (d) {
            for (let i in d) {
                let idata = d[i];


                if (req.header("x-arduino-id") !== undefined) {
                    connection.query('UPDATE `smartblocks`.`blocks` SET lastactive = CURRENT_TIMESTAMP WHERE mac = ?;', [req.params.mac]);
                    data["x-arduino-id"] = {
                        "id": req.header("X-Arduino-ID"),
                        "lastActive": new Date().toLocaleString("de-DE", {timeZone: "Europe/Vienna"}),
                    };
                }

                data["id"] = idata.id;
                data["mac"] = idata.mac;
                data["name"] = idata.name;

                try {
                    data["json"] = JSON.parse(idata.json);
                } catch (SyntacError) {
                    data["json"] = idata.json;
                }
            }
        }).then(function () {
            connection.end();

            let tmp = data["json"][req.params.key];

            if (!isNaN(Number(tmp))) tmp = Number(tmp);

            res.json(tmp);
        });
});

module.exports = router;



function createSQLandCheckBlock(cfg, mac) {


    let conn = null;

    return new Promise((resolve, reject) => {

         mysql.createConnection(cfg)
            .then(c => {
                 conn = c;
                return conn.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks` (`id` int(11) NOT NULL AUTO_INCREMENT,`mac` varchar(17) NOT NULL,`name` text NOT NULL,`json` varchar(255) NOT NULL,`lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`));')
            })
            .then(() => {
                return conn.query('SELECT * FROM `smartblocks`.`blocks` WHERE mac = ?;', [mac]);
            })
            .then(d => {

                if (d === undefined || !(d.length > 0)) {
                    conn.query('INSERT INTO `smartblocks`.`blocks` (`id`, `mac`, `name`, `json`) VALUES (NULL, ?, ?, ?);', [mac, "UnnamedBlock" + Math.floor(Math.random() * 1000), "{}"]);
                    d = conn.query('SELECT * FROM `smartblocks`.`blocks` WHERE mac = ?;', [mac]);
                }
                resolve([conn, d]);
            })
             .catch(error => reject(error));
    })
}

function createSQL(cfg) {


    let conn = null;

    return new Promise((resolve, reject) => {

         mysql.createConnection(cfg)
             .then(c => {
                conn = c;
                conn.query('CREATE TABLE IF NOT EXISTS `smartblocks`.`blocks` (`id` int(11) NOT NULL AUTO_INCREMENT,`mac` varchar(17) NOT NULL,`name` text NOT NULL,`json` varchar(255) NOT NULL,`lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`));');
                resolve([conn])
             })
             .catch(error => reject(error));
    })
}