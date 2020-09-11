const express = require('express')
const dotenv=require('dotenv').config({ path: './config/config.env' })
const bootcamps = require('./routes/bootcamps')
const morgan = require('morgan')
const connectDb = require("./config/db");
const colors = require('colors')
const errorHandeler = require("./middleware/error");

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

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

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
process.on('unhandledRejection',rejections)