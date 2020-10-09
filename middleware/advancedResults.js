const advancedResults = (model, populate) => async (req, res, next) => {
   const path = req.params
   console.log(path)

   next();
}

module.exports = advancedResults;