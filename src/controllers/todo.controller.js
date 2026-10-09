const todoServices = require("../services/todo.services");
const { handleSuccess, handleError, handleOk } = require("../helpers/response.helper");

/**
 * Gets every todo item for the authenticated user.
 * @param {req} req Express request object with the authenticated user id.
 * @param {res} res Express response object used to send the result.
 * @returns {Promise<res>} Response with the user's todo list or an error response.
 */
const getTodo = async (req, res) => {
    try {
      const data = await todoServices.getTodo(req.userId);
      return handleSuccess(res, data);
  } catch (error) {
      return handleError(res, error);
  }
};

/**
 * Creates a new todo item for the authenticated user.
 * @param {req} req Express request object with the authenticated user id and todo payload.
 * @param {res} res Express response object used to send the result.
 * @returns {Promise<res>} Response with the created todo item or an error response.
 */
const createTodo = async (req, res) => {
    try {
      const data = await todoServices.createTodo(req.userId, req.body);
      return handleSuccess(res, data);
  } catch (error) {
      return handleError(res, error);
  }
};

/**
 * Gets one todo item for the authenticated user by id.
 * @param {req} req Express request object with the user id and todo id in the route params.
 * @param {res} res Express response object used to send the result.
 * @returns {Promise<res>} Response with the matching todo item or an error response.
 */
const getTodoById = async (req, res) => {
    try {
        const data = await todoServices.getTodoById(req.userId, req.params.id);
      return handleSuccess(res, data);
  } catch (error) {
      return handleError(res, error);
  }
};

/**
 * Updates a todo item for the authenticated user.
 * @param {req} req Express request object with the user id, todo id, and updated fields.
 * @param {res} res Express response object used to send the result.
 * @returns {Promise<res>} Response with the updated todo item or an error response.
 */
const updateTodo = async (req, res) => {
    try {
      const data = await todoServices.updateTodo(
          req.userId,
          req.params.id,
          req.body,
      );
      return handleSuccess(res, data);
  } catch (error) {
      return handleError(res, error);
  }
};

/**
 * Deletes a todo item for the authenticated user.
 * @param {req} req Express request object with the user id and todo id in the route params.
 * @param {res} res Express response object used to send the result.
 * @returns {Promise<res>} Response confirming the delete action or an error response.
 */
const deleteTodo = async (req, res) => {
    try {
        const todo = await todoServices.deleteTodo(req.userId, req.params.id);
      return handleOk(res, todo);
  } catch (error) {
      return handleError(res, error);
  }
};

/**
 * Gets todo items for the authenticated user using query filters.
 *
 * @param {req} req Express request object with the authenticated user id and query values.
 * @param {res} res Express response object used to send the result.
 * @returns {Promise<res>} Response with the filtered todo list or an error response.
 */
const getTodos = async (req, res) => {
    try {
      const todos = await todoServices.getTodos(req.userId, req.query);
      return handleSuccess(res, todos);
  } catch (error) {
      return handleError(res, error);
  }
};

module.exports = {
    getTodo,
    createTodo,
    getTodoById,
    updateTodo,
    deleteTodo,
    getTodos,
};