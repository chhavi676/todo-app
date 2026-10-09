const z = require("zod");
const todo = z.object({
  title: z.string().min(3).max(50),
  description: z.string().min(3).max(2000),
});

module.exports = todo;
