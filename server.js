require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./src/middlewares/logger.middleware.js')

const connectDB = require('./src/config/db.config'); //config db

const todoRoutes = require('./src/routes/todo.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(logger)

 
app.use('/todos', todoRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is listening on ${PORT} : http://localhost:${PORT}`);
});

// server.on('error', (error) => {
//   console.error('Server encountered an error:', error);
// });