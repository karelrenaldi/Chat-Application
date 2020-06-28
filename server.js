const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const messageFormat = require("./utils/messages");
const { 
  userJoin, 
  getCurrentUser, 
  userLeave,
  getRoomUsers 
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Define a bot name
const botName = "SupremoKr Bot 🤖";

// Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({username, room}) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", messageFormat(botName, "Hello welcome to SupremoKr Chatbot")); // message for single client
    
    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit("message", messageFormat(botName, `A ${user.username} has joined the chat`)); // message for all of the client except "THIS" client

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  // Runs when client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if(user){
      io.to(user.room).emit(
        "message",
        messageFormat(botName, `${user.username} has left the chat`) // message for all of the client
      )

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })

  // Listen from the "sendMessage" event from the client
  socket.on("sendMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io
      .to(user.room)
      .emit("message", messageFormat(user.username, message));
  })
})

const PORT = 3000 || process.env.PORT ;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})