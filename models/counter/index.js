const mongoose = require("mongoose");

// schema structure
const Schema = mongoose.Schema

// create schema
const CounterSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    required: true
  }
})

// create model
const Counter = mongoose.model("Counter", CounterSchema);

// export model
module.exports = Counter;