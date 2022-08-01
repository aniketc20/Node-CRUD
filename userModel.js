import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
})

module.exports = mongoose.model('user', UserSchema)