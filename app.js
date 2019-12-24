const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const indexRouter = require('./routes/index');
const app = express();
const compression = require('compression');


require("./data/db").init();

app.use(
    sassMiddleware({
        src: __dirname + '/scss',
        dest: __dirname + '/public',
        debug: process.env.NODE_ENV === "development",
    })
);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();

});
app.use(compression());
// app.use(logger('dev'));
// app.use(logger('":method :url HTTP/:http-version" :status ":user-agent" :req[X-Forwarded-For]'));
app.use( process.env.NODE_ENV === "development" ? logger('dev') : logger('":method :url HTTP/:http-version" :status ":user-agent" :req[X-Forwarded-For]'));
app.use(function(req,res,next){
    res.header('X-Pirate' , "Ahoy!");
    res.header('X-Powered-By' , "Monkeys with lots of coffee and express");
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html', 'htm'],
}));


app.use('/', indexRouter);

app.use(function(req, res){
    res.redirect("/errors/404")
});

module.exports = app;
