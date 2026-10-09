const z = require("zod");
/**
 * Creates a middleware that validates `req.body`, `req.params` or `req.query` against a Zod schema.
 * If validation fails it responds with 400 and the Zod error tree; otherwise it replaces the
 * validated part with the parsed data (unknown fields stripped, defaults applied) and calls `next()`.
 *
 * @param {import('zod').ZodType} schema - Zod schema to validate with.
 * @param {'body'|'params'|'query'} [source='body'] - Which part of the request to validate.
 * @returns {import('express').RequestHandler} Express middleware.
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: z.treeifyError(result.error),
      });
    }
    // req.query is a getter in Express 5, so it can't be assigned directly
    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    next();
  };
};

module.exports = validate;