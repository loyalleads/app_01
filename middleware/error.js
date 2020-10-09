
const c = require("config");
const ErrorResponse = require("../utils/errorResponse");

errorHandeler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
//   console.log(err);

//   console.log(err.stack.red);
  //Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Recorce not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //Mongose dublicate key
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }
  //Mongoose Validation error
    if (err.name === 'ValidationError') {
        
        //const message = Object.values(err.errors).map(val => val.message);
        const message = err.errors[Object.keys(err.errors)[0]].message;
        error = new ErrorResponse(message, 400);
    }
  
  console.log(err)
  res.status(error.statusCode || 500).json({
    sucsuess: false,
      error: error.message || "Server Error",
    
  });
};

module.exports = errorHandeler