require("dotenv").config();
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");

const session = require("express-session");
const flash = require("connect-flash");

const mongoose = require("mongoose");
const passport = require("passport");

const http = require("http").createServer(app); // Create an HTTP server instance
const io = require("socket.io")(http); // Integrate Socket.IO with the server

// configure passport

//route definition
const homeRouter = require("./routes/home");
const openGamesRouter = require("./routes/opengames");
const authRouter = require("./routes/auth");
const transactionsRouter = require("./routes/transactions");
const gameRouter = require("./routes/game")(io); // Passing the io instance to gameRoutes

const Game = require("./models/Game");
const User = require("./models/User");
const Transaction = require("./models/Transaction");

// Game.deleteMany({}).then((done)=>{
//   console.log(done)
// })

// User.deleteMany({}).then((done)=>{
//   console.log(done)
// })

// Transaction.deleteMany({}).then((done)=>{
//   console.log(done)
// })

const { ensureAuthenticated } = require("./config/auth");

////////////database connection////////////

const localDB = "mongodb://localhost:27017/shoottoodb";
// process.env.MONGODBURL

mongoose.set("strictQuery", true);
mongoose
  .connect(localDB, { useNewUrlParser: true })
  .then(() => {
    console.log("database is connected");
  })
  .catch((err) => console.log("error connecting to database ", err));

////setting up the server///////
// Configure Passport

require("./config/passport")(passport);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views/");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//socket io
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("A user connected");

  // Emit initial messages to the newly connected client
  socket.emit("initialMessages", getLatestMessages());

  // Listen for messages from clients
  socket.on("message", (data) => {
    const message = {
      senderName: data.senderName,
      message: data.message,
      timeStamp: getCurrentTimestamp(),
      imageUrl: data.imageUrl,
      userId: data.userId,
    };
    addMessage(message);
    io.emit("message", message); // Broadcast the message to all connected clients
  });

 
 

});


const MAX_MESSAGES = 5;
let messages = [];

function addMessage(message) {
  messages.push(message);
  if (messages.length > MAX_MESSAGES) {
    messages.shift(); // Remove the oldest message if the limit is exceeded
  }
}

function getLatestMessages() {
  return messages;
}

function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000); // Convert to seconds
}



app.use("/auth", authRouter);
app.use("/", ensureAuthenticated, homeRouter);
app.use("/game", gameRouter);
app.use("/transaction", transactionsRouter);
app.use("/opengames", openGamesRouter);


http.listen(process.env.PORT || 3000, () => console.log(`Listening on port `));
