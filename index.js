const express = require('express');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const globalErrorHandler = require('./services/errorService')
var cookieParser = require('cookie-parser')

const expressApp = express();

expressApp.use(express.json());
expressApp.use(cookieParser());
expressApp.use('/static/resources', express.static(`${__dirname}/public`))
expressApp.use((req, resp, next) => {
    console.log(`Custom middleware`);
    next();
})

expressApp.use('/v1/users', userRouter);
expressApp.use('/v1/auth', authRouter);

expressApp.use(globalErrorHandler);

const port = process.env.PORT || 3000;
expressApp.listen(port, () => {
    console.log(`Express app listening at ${port}`);
});