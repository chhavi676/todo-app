/**
 * Sends a success JSON response (defaults to 201 Created).
 * @param {res} res - Express response object.
 * @param {*} data - Data to send back as `payload`.
 * @param {number} [statusCode=201] - HTTP status code.
 * @returns {res} The Express response.
 */
const handleSuccess = (
  res,
  data,
  statusCode = 201,
) => {
  return res.status(statusCode).json({
    success: true,
    message: 'Success',
    payload: data
  });
};

/**
 * Sends a 200 OK JSON response.
 * @param {res} res - Express response object.
 * @param {*} [payload=null] - Data to send back as `payload`.
 * @returns {res} The Express response.
 */
const handleOk = (res, payload = null) => {
  return res.status(200).json({
    success: true,
    message: "OK",
    payload,
  });
};

/**
 * Sends an error JSON response with `success: false` and a null payload.
 * @param {res} res - Express response object.
 * @param {Error|{message?: string}} [error] - Error whose `message` is returned;
 *   falls back to "Something went wrong" if missing.
 * @param {number} [statusCode=500] - HTTP status code.
 * @returns {res} The Express response.
 */
const handleError = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message: error?.message || "Something went wrong",
    payload: null
  });
};

module.exports = {
  handleSuccess,
  handleOk,
  handleError,
};