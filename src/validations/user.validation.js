const z = require("zod");

const user = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(100),
  password: z.string().min(8),
});

module.exports = user;