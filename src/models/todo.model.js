const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: [3, "title must be atleast 3 characters"],
      maxLength: [50, "title cannot exceed more than 50 character"],
      trim: true,
    },
    description: {
      type: String,
      minLength: [3, "description must be atleast 3 characters"],
      maxLength: [2000, "description cannot exceed more than 2000 character"],
      trim: true,
    },
  },
  {
    versionKey: false,
  },
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
