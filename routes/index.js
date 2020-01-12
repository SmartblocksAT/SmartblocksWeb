let express = require('express');
let router = express.Router();

let db = require("../data/db");

// Data from a http request, debugging purposes only -> CloudFlare
router.get('/api/clientinfo', function (req, res) {
    let data = {};

    data.country = req.header('cf-ipcountry');
    data.ip = req.header('cf-connecting-ip');
    data.cfray = req.header('cf-ray');
    data.forwarded = req.header('x-forwarded-for');

    res.send(data);
});

// Status endpoint, used by the webinterface to retrieve information for displaying the data
router.get(['/api/status/all/status.json', '/api/status/all/'], function (req, res) {

    if(req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));

    db.all()
        .then(dat => {
            res.json(dat);
        })
        .catch(err => console.log("ERR => "+ err));
});

// Status endpoint for a specific smartblock
router.get(['/api/status/:mac/status.json', '/api/status/:mac/'], function (req, res) {
    while (req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");

    }

    let mac = req.params.mac;

    if (req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));
    db.get(mac)
        .then(dat => res.json(dat))
        .catch(err => console.log("ERR => "+ err));
});

// Update endpoint used by the webinterface to update every variable with one request
router.post('/api/update/:mac/', function (req, res) {

    while (req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }


    let mac = req.params.mac;

    if (req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));
    let data = JSON.stringify(req.body);
    let name = req.body.name;

    db.updateAll(mac, data, name)
        .then(dat => {
            res.json(dat);
        })
        .catch(err => console.log("ERR => "+ err));
});

// Update endpoint to update the Name of a smartblock. Primarily used by the webinterface
router.post('/api/update/:mac/name', function (req, res) {
    while (req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }


    let mac = req.params.mac;

    if (req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));
    let name = req.body.name;

    db.updateName(mac, name)
        .then(dat => {
            res.json(dat);
        })
        .catch(err => console.log("ERR => "+ err));
});

// Update endpoint to update a specific key of a specific smartblock
router.get('/api/update/:mac/entry/:key/:value', function (req, res) {

    while (req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    if(req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));

    db.updateSingle(req.params.mac, req.params.key, req.params.value)
        .then(dat => {
            res.json(dat);
        })
        .catch(err => {
            res.json(err);
        });
});

// Update endpoint to update a specific key of a specific smartblock
router.post('/api/update/:mac/entry/:key/', function (req, res) {
    while (req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    if(req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));

    db.updateSingle(req.params.mac, req.params.key, req.body.value)
        .then(dat => {
            res.json(dat);
        })
        .catch(err => {
            res.json(err);
        });
});

// Data for a specific key of a specific smartblock
router.get('/api/get/:mac/entry/:key/', function (req, res) {
    while (req.params.mac.indexOf(":") >= 1) {
        req.params.mac = req.params.mac.replace(":", "-");
    }

    if(req.header("x-arduino-id") !== undefined) db.activity(req.header("x-arduino-id")).catch(err => console.error(err));

    db.getSingle(req.params.mac, req.params.key)
        .then(dat => res.send(dat));
});


module.exports = router;