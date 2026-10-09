const z = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const createTodo = z.object({
  title: z.string().trim().min(3).max(50),
  description: z.string().trim().min(3).max(2000),
});

const updateTodo = createTodo
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

const todoId = z.object({
  id: objectId,
});

const getTodos = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { createTodo, updateTodo, todoId, getTodos };
