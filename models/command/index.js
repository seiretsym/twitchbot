const mongoose = require("mongoose");

// schema structure
const Schema = mongoose.Schema

// create schema
const CommandSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  message: {
    type: String,
    required: true
  }
})

// create model
const Command = mongoose.model("Command", CommandSchema);

// export model
module.exports = Command;