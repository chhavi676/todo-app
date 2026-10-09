const z = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const createUser = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(100),
  password: z.string().min(8),
});

const loginUser = z.object({
  email: z.string().trim().email().max(100),
  password: z.string().min(1),
});

const updateUser = z
  .object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(100),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

const userId = z.object({
  id: objectId,
});

module.exports = { createUser, loginUser, updateUser, userId };
