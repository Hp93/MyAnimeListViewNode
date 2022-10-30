const express = require('express');

const indexRouter = require('./api/routers/index');
const viewRouter = require('./api/routers/view');

const app = express();

// config routes
app.use('/', indexRouter);
app.use('/view', viewRouter);


// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     next(createError(404));
// });
app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
})


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
