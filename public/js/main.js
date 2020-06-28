const chatForm = document.querySelector("#chat-form");
const chatBox = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const userActive = document.querySelector("#users");

const socket = io();

// User and Location
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

// Join chatroom
socket.emit("joinRoom", { username, room })

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
})

// function for add message to chatbox and render messsage every user send a message
const addMessage = (message) => {
  const { username, text, time } = message;
  chatBox.insertAdjacentHTML("beforeend", `
  <div class="message">
    <p class="meta">${username} <span>${time}</span></p>
      <p class="text">
        ${text}
      </p>
  </div>
  `)

  // scroll to bottom every send message
  chatBox.scrollTop = chatBox.offsetHeight;
}

socket.on("message", (message) => {
  console.log(message);
  addMessage(message);
})

// function outputRoomName
function outputRoomName(name){
  roomName.textContent = name;
}
// function outputUsers
function outputUsers(users){
  const html = users.map(({ username }) => `<li>${username}</li>`).join("\n");
  userActive.innerHTML = html;
}

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get the message value from the input
  const message = e.target.message.value;

  // Emit message to the server
  socket.emit("sendMessage", message);

  // Reload input message
  e.target.message.value = "";
})