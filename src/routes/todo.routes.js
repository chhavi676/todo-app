const Router = require("express").Router();
const validate = require("../middlewares/validation.middleware"); //middleware
const createTodoValidation = require("../validations/todo.validation"); //validation
const todoController = require("../controllers/todo.controller"); //controllers
const authMiddleware = require("../middlewares/auth.middleware");

Router.get("/hello", authMiddleware, todoController.getTodo);

Router.post(
  "/",
  authMiddleware,
  validate(createTodoValidation),
  todoController.createTodo,
);

Router.get("/:id", authMiddleware, todoController.getTodoById);

Router.patch("/:id", authMiddleware, todoController.updateTodo);

Router.delete("/:id", authMiddleware, todoController.deleteTodo);

Router.get("/", authMiddleware, todoController.getTodos);

module.exports = Router;
