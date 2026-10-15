require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('./src/middlewares/logger.middleware.js')
const cookieParser = require('cookie-parser')

const connectDB = require('./src/config/db.config'); //config db

const todoRoutes = require('./src/routes/todo.routes');
const userRoutes = require('./src/routes/user.routes');
const pageRoutes = require('./src/routes/page.routes');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- EJS setup ----
app.set('view engine', 'ejs');                           // res.render() ab .ejs files use karega
app.set('views', path.join(__dirname, 'views'));         // templates kis folder me hain
app.use(express.static(path.join(__dirname, 'public'))); // css/js direct serve honge

app.use(express.json());
app.use(cors());
app.use(logger)
app.use(cookieParser())

app.use('/', pageRoutes);      // HTML pages  (/login, /signup, /dashboard)
app.use('/todos', todoRoutes); // JSON API
app.use('/users', userRoutes); // JSON API
app.use('/auth', authRoutes)

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is listening on ${PORT} : http://localhost:${PORT}`);
});

// server.on('error', (error) => {
//   console.error('Server encountered an error:', error);
// });
