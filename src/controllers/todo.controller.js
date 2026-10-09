const todoServices = require('../services/todo.services');

const z = require('zod');

const getTodo = async(req, res) => {
    try {
        const data = todoServices.getTodo(req.userId);
        console.log('==============', data);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

const createTodo = async(req, res) => {
    try {
        const data = await todoServices.createTodo(req.userId, req.body)
        return res.json(data)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const getTodoById = async(req, res) => {
    try {
        const data = await todoServices.getTodoById(req.userId, req.params.id);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const updateTodo = async(req, res) => {
    try {
        const data = await todoServices.updateTodo(req.userId, req.params.id, req.body);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const deleteTodo = async(req, res) => {
    try {
        const todo = await todoServices.deleteTodo(req.userId, req.params.id);
        return res.json(todo);
    } catch (error) {
       return res.status(500).json({
            success: false,
            message: error.message
        }) 
    }
}

const getTodos = async(req, res) => {
    try {
        const todos = await todoServices.getTodos(req.query);
        return res.json(todos);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = { getTodo , createTodo, getTodoById, updateTodo, deleteTodo, getTodos}