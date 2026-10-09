const Router = require("express").Router();
const validate = require("../middlewares/validation.middleware"); //middleware
const todoValidation = require("../validations/todo.validation"); //validation
const todoController = require("../controllers/todo.controller"); //controllers
const authMiddleware = require("../middlewares/auth.middleware");

Router.get("/hello", authMiddleware, todoController.getTodo);

Router.post(
  "/",
  authMiddleware,
  validate(todoValidation.createTodo),
  todoController.createTodo,
);

Router.get(
  "/:id",
  authMiddleware,
  validate(todoValidation.todoId, "params"),
  todoController.getTodoById,
);

Router.patch(
  "/:id",
  authMiddleware,
  validate(todoValidation.todoId, "params"),
  validate(todoValidation.updateTodo),
  todoController.updateTodo,
);

Router.delete(
  "/:id",
  authMiddleware,
  validate(todoValidation.todoId, "params"),
  todoController.deleteTodo,
);

Router.get(
  "/",
  authMiddleware,
  validate(todoValidation.getTodos, "query"),
  todoController.getTodos,
);

module.exports = Router;
