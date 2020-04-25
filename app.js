const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const compression = require('compression');

const indexRouter = require('./routes/index');


const app = express();

require("./data/db").init();

app.use(
    sassMiddleware({
        src: __dirname + '/scss',
        dest: __dirname + '/public',
        debug: process.env.NODE_ENV === "development",
    })
);


app.use(compression());
// app.use(logger('dev'));
// app.use(logger('":method :url HTTP/:http-version" :status ":user-agent" :req[X-Forwarded-For]'));
app.use( process.env.NODE_ENV === "development" ? logger('dev') : logger('":method :url HTTP/:http-version" :status ":user-agent" :req[X-Forwarded-For] :response-time ms'));
app.use(function(req,res,next){
    res.header('X-Pirate' , "Arrr!");
    res.header('X-Powered-By' , "Monkeys with lots of coffee and express");
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html', 'htm'],
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use('/', indexRouter);


// error handler
// noinspection JSUnusedLocalSymbols Express wont use this error handler if the next parameter is missing.
app.use(function (err, req, res, next) {
    err.statusCode = err.statusCode === undefined ? 500 : err.statusCode;
    if (req.xhr) {
        res.status(err.statusCode).send({error: err.status, message: err.message});
    } else {
        if(process.env.NODE_ENV === "development"){
            res.status(err.statusCode).send("<h1>" + err.status + " - " + err.message + "</h1><br><pre>" + err.stackTrace + "</pre>");
        } else {
            res.status(err.statusCode).send("<h1>" + err.status + " - " + err.message + "</h1>");
        }
    }
});

module.exports = app;
