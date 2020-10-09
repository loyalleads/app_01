const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config({ path: './config/config.env' });
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const morgan = require('morgan');
const connectDb = require("./config/db");
const colors = require('colors');
const fileUpload = require('express-fileupload')
const errorHandeler = require("./middleware/error");
const advancedResults = require("./middleware/advancedResults")

const app = express();

// Body Parser
app.use(express.json())

// Connect to database
connectDb();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
    console.log('Morgan is running..')
}


// Set a static folder
app.use(express.static(path.join(__dirname, 'public')))

// File upolading
app.use(fileUpload())

app.use(advancedResults);
// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandeler);


app.get('/',(req,res)=>{
    res.send('<h1>Hello</h1>')
})

const PORT = process.env.PORT || 5000

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

// Handle unhandeled promises rejections
const rejections = (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server and exit
    server.close(()=> process.exit(1));
}
process.on('unhandledRejection', rejections);

