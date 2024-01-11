

module.exports = (err, req, res, next) => {
    console.log(`${err.statusCode}: ${err.message} \n${err.stack}`)
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
}