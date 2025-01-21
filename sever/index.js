const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const swaggerDocument = require('./swagger.json');
const app = express();

//cors

app.use(cors(
    origin = '*'
));


//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//errror handle middleware

function errorHandler(err, req, res, next) {

    if (err) {
        console.log(err.message);
        res.status(500).send('Something went wrong');
    }
    next();
}




//routes
const chatRoute = require('./routes/chat.route');

app.use('/api/v1/chat', chatRoute);



//use error handler
app.use(errorHandler);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
})