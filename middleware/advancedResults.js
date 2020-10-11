const advancedResults = (model, populate) => async (req, res, next) => {
   let query;

   // copy req.query to reqQuery
   let reqQuery = { ...req.query };

   // list of sellectors to be considerd
   const selectorsToRemove = ['select', 'sort', 'limit', 'page']

   // Reomve select form query
   selectorsToRemove.forEach(selector => {
      delete reqQuery[selector]
   })

   queryStr = JSON.stringify(reqQuery)
   queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${ match }`);

console.log(model)
   query = model.find(JSON.parse(queryStr));

   //Select
   if (req.query.select) {
      // extract list of selection parms
      let querySelect = req.query.select.split(',').join(' ');
      query = query.select(querySelect)
   }

   // Sort
   if (req.query.sort) {
      let querySort = req.query.sort.split(',').join(' ');
      query = query.sort(querySort)
   } else {
      query = query.sort('-createdAt')
   }

   //Pagination
   const page = parseInt(req.query.page, 10) || 1;
   const limit = parseInt(req.query.limit, 10) || 25;
   const startIndex = (page - 1) * limit;
   const endIndex = page * limit;
   const totalPages = await model.countDocuments();

   query = query.skip(startIndex).limit(limit);

   // Pagination result
   const pagination = {};

   if (endIndex < totalPages) {
      pagination.next = {
         page: page + 1,
         limit
      }
   }

   if (startIndex > 0) {
      pagination.prev = {
         page: page - 1,
         limit
      }
   }

   if (populate) {
      query = query.populate(populate);
   }

   //Excuting query
   const results = await query

   res.advancedResults = {
      sucsess: true,
      count: results.length,
      pagination,
      data:results
   }

   next();
}

module.exports = advancedResults;