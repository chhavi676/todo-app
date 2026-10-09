const Todo = require('../models/todo.model')

const getTodo = async(userId) => {
    const todos = await Todo.find({userId})
    return todos
}

const createTodo = async(userId, payload) => {
    const todo = await Todo.create({
        userId,
        ...payload
    });
    return {
        id: todo._id
    }
}

const getTodoById = async(userId, todoId) => {
    const todo = await Todo.findOne({
        _id: todoId,
        userId: userId
    });
    return {
        id: todo._id,
        title: todo.title,
        description: todo.description
    }
}

// const updateTodo = async(id, payload) => {
//     const todo = await Todo.findById(id).select(['id']);
//     if(!todo){
//         throw new Error('Todo not Found!');
//     }
//     if(payload.title){
//         todo.tile = payload.title
//     }
//     if(payload.description){
//         todo.description = payload.description
//     }
//     await todo.save()
//     return{
//         id: todo._id
//     }
// }

const updateTodo = async(userId, todoId, payload) => {
    const todo = await Todo.findOneAndUpdate({
        _id: todoId,
        userId: userId,
    },payload,
    {new: true, runValidators: true}
    );
    if(!todo){
        throw new Error('Todo not Found!');
    }
    return {
        id: todo._id
    }
}

const deleteTodo = async(userId, todoId) => {
    const todo = await Todo.findOneAndDelete({
        _id: todoId,
        userId: userId
    });
    if(!todo){
        throw new Error('Todo not Found!');
    }
    return {
        message: 'Todo Deleted Successfully!'
    }
}

const getTodos = async(query) => {
    const skipRecords = query.limit - (query.page - 1)
    const todos = await Todo.find().skip(skipRecords).limit(query.limit);  
    const totalRecords = await Todo.countDocuments({}); 
    const totalPage = Math.ceil(totalRecords / parseInt(query.limit));
    return {
        todos,
        currentPage: query.page,
        limit: query.limit,
        totalRecords: totalRecords,
        totalPage: totalPage
    }
}

module.exports = { getTodo, createTodo, getTodoById, updateTodo, deleteTodo, getTodos }