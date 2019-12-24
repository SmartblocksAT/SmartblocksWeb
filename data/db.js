const mysql = require('mysql2');
const options = require('../options.js');

// Create the connection pool. The pool-specific settings are the defaults
// noinspection JSUnresolvedVariable
const pool = mysql.createPool({
    host: 'localhost',
    user: options.smartblocks.config.MySQL_USER || 'smartblocks',
    password: options.smartblocks.config.MySQL_PASS || '',
    database: 'smartblocks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


module.exports.init = () => {
    pool.query('CREATE TABLE IF NOT EXISTS blocks (`id` int(11) NOT NULL AUTO_INCREMENT,`mac` varchar(17) NOT NULL,`name` text NOT NULL,`json` varchar(255) NOT NULL,`lastactive` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`id`));', [], function (err) {
        if (err) throw err;

    });
};


/**
 * The database-magix happens here!
 */

/**
 * Records the activity of given mac
 * @param mac The mac to set
 * @returns {Promise<>} Retuns nothing
 */
module.exports.activity = (mac = undefined) => {

    return new Promise((resolve, reject) => {
        if (mac === undefined) reject("esp_mac undefined!");

        pool.query('UPDATE blocks SET `lastactive` = CURRENT_TIMESTAMP WHERE mac = ?;', mac, function (err) {
            if (err) reject(err);

            resolve();
        });
    });
};

/**
 * Get every single available entry in the database.
 *
 * @returns {Promise<Array>} All of the rows the database has
 */
module.exports.all = () => {
    return new Promise((resolve) => {

        pool.query('SELECT * FROM blocks', [], function (err, rows) {
            resolve(rows);
        });
    })
};

/**
 * Get a single smartblock with a given mac address
 *
 * @param mac The block to be requested
 * @returns {Promise<Object>} The block instance
 */
module.exports.get = (mac = undefined) => {
    return new Promise((resolve, reject) => {

        if (mac === undefined) reject("Mac is undefined!");

        pool.query("SELECT * FROM blocks WHERE mac = ? LIMIT 1", [mac], function (err, rows) {
            if (err) reject(err);

            if (rows.length === 0) {
                pool.query('INSERT INTO blocks (`id`, `mac`, `name`, `json`) VALUES (NULL, ?, ?, ?);', [mac, "UnnamedBlock" + Math.floor(Math.random() * 1000), "{}"], function (err) {
                    if (err !== undefined) reject(err);
                    pool.query('SELECT * FROM blocks WHERE mac = ?;', [mac], function (err, rows) {
                        if (err) reject(err);
                        resolve(rows[0]);
                    });
                });
            } else {
                pool.query('SELECT * FROM blocks WHERE mac = ?;', [mac], function (err, rows) {
                    if (err) reject(err);
                    resolve(rows[0]);
                });
            }
        });
    })
};

/**
 * Update everything about a single block
 * @param mac The mac address of the block
 * @param data The new data to be set
 * @param name The new name to be set.
 * @returns {Promise<Object>} Returns a new block if the mac address is not found or the data about it.
 */
module.exports.updateAll = (mac = undefined, data, name) => {
    return new Promise((resolve, reject) => {
        if (mac === undefined ||
            data === undefined ||
            name === undefined) {
            reject("MAC, data or name not defined!")
        }

        pool.query("SELECT * FROM blocks WHERE mac = ? LIMIT 1", [mac], function (err, rows) {
            if (err) reject(err);

            if (rows.length === 0) {
                pool.query('INSERT INTO blocks (`id`, `mac`, `name`, `json`) VALUES (NULL, ?, ?, ?);', [mac, "UnnamedBlock" + Math.floor(Math.random() * 1000), "{}"], function (err) {
                    if (err) reject(err);
                    pool.query('UPDATE blocks SET `name` = ?, `json` = ? WHERE mac = ? LIMIT 1;', [name, data, mac], function (err) {
                        if (err) reject(err);
                        module.exports.get(mac).then(dat => resolve(dat));
                    });
                });
            } else {
                pool.query('UPDATE blocks SET `name` = ?, `json` = ? WHERE mac = ? LIMIT 1;', [name, data, mac], function (err) {
                    if (err) reject(err);
                    module.exports.get(mac).then(dat => resolve(dat));
                });
            }
        });
    })
};

/**
 * Update the name of a single smartblock
 * @param mac The mac address
 * @param name The new name to be set
 * @returns {Promise<Object>} Returns a new block if the mac address is not found or the data about it.
 */
module.exports.updateName = (mac = undefined, name) => {
    return new Promise((resolve, reject) => {
        if (mac === undefined ||
            name === undefined) {
            reject("MAC or name not defined!")
        }

        pool.query("SELECT * FROM blocks WHERE mac = ? LIMIT 1", [mac], function (err, rows) {
            if (err) reject(err);

            if (rows.length === 0) {
                pool.query('INSERT INTO blocks (`id`, `mac`, `name`, `json`) VALUES (NULL, ?, ?, ?);', [mac, "UnnamedBlock" + Math.floor(Math.random() * 1000), "{}"], function (err) {
                    if (err) reject(err);
                    // return connection.query('UPDATE blocks SET `name` = ?, `json` = ? WHERE mac = ?;', [req.body.name, JSON.stringify(req.body), req.params.mac]);
                    pool.query('UPDATE `smartblocks`.`blocks` SET name = ? WHERE mac = ?;', [name, mac], function (err, rows) {
                        if (err) reject(err);
                        resolve(rows[0]);
                    });
                });
            } else {
                pool.query('UPDATE `smartblocks`.`blocks` SET name = ? WHERE mac = ?;', [name, mac], function (err, rows) {
                    if (err) reject(err);
                    resolve(rows[0]);
                });
            }
        });
    })
};
/**
 * Update a single entry in the data of a smartblock
 * @param mac The mac address of the corresponding block
 * @param key The key to update
 * @param value The value to be set
 * @returns {Promise<Object>} The full data in the block
 */
module.exports.updateSingle = (mac, key, value) => {
    return new Promise((resolve, reject) => {
        if (mac === undefined) {
            reject("MAC or name not defined!")
        }


        module.exports.get(mac)
            .then((dat) => {
                // noinspection JSValidateTypes,JSCheckFunctionSignatures
                let obj = (dat.constructor === "".constructor) ? JSON.parse(dat) : dat;

                if(obj.json.constructor === "".constructor) obj.json = JSON.parse(obj.json);
                obj.json[key] = value;

                if(obj.json.constructor === {}.constructor) obj.json = JSON.stringify(obj.json);

                module.exports.updateAll(mac, obj.json, obj.name)
                    .then(dat1 => resolve(dat1));
            });
    });
};

/**
 * Gets a single variable in the blocks data
 * @param mac The mac address of the block
 * @param key The key to get
 * @returns {Promise<String>} The value of the provided key or nothing if the key is not found
 */
module.exports.getSingle = (mac, key) => {

    return new Promise((resolve, reject) => {
        if (mac === undefined) {
            reject("MAC or name not defined!")
        }


        module.exports.get(mac)
            .then((dat) => {
                // noinspection JSValidateTypes,JSCheckFunctionSignatures
                let obj = (dat.constructor === "".constructor) ? JSON.parse(dat) : dat;

                if(obj.json.constructor === "".constructor) obj.json = JSON.parse(obj.json);

                resolve(obj.json[key]);
            });
    });
};