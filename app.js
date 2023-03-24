const express = require('express');
const session = require('express-session');
const cookies = require('cookie-parser');
const AppError = require('./utils/appError');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users');

const userRouter = require('./routes/userRoutes');
const loginRouter = require('./routes/loginRoutes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Yolo Bot';

// Run when client connects
io.on('connection', (socket) => {
  console.log(io.of('/').adapter);
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to Yolo!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// 1) MIDDLEWARES
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookies());
// app.use((req, res, next) => {
//   next();
// });

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// 3) ROUTES
app.use('/users', userRouter);
app.use('/login', loginRouter);

module.exports = server;
