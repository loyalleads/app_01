// @dssc Logs request to console

const mw = (req, res, next) => {
  req.mat = "hello world";
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    
  next();
};

module.exports = mw