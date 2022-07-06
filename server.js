// dependencies
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const routes = require("./routes");
const mongoose = require("mongoose");
const db = require("./models");

// express middleware
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// serving public folder
app.use(express.static("client"));

// session config
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }))

// connect routes
app.use(routes);

// database configs
// mongoose db
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/derpbothk";
const configs = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
mongoose.connect(MONGODB_URI, configs);

// start server
const PORT = process.env.PORT || 3377;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
  // start bot
  require("./bot")(db);
})