const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const indexRouter = require('./routes/index');
const app = express();
const compression = require('compression');

app.use(
    sassMiddleware({
        src: __dirname + '/scss',
        dest: __dirname + '/public',
        debug: true,
    })
);


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();

});
app.use(compression());
// app.use(logger('dev'));
app.use(logger('":method :url HTTP/:http-version" :status ":user-agent" :req[X-Forwarded-For]'));
app.use(function(req,res,next){
    res.header('X-lol1' , "Hey! Don't touch me!");
    res.header('X-lol2' , "If you really want to learn stuff about HTTP,");
    res.header('X-lol3' , "talk to you teacher and mention this header.");
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
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'public', 'errors', '404.html'));
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

module.exports = app;
