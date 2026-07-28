/**
 * Standardized API success response envelope.
 * All endpoints must return this shape.
 */
class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
  }
}

module.exports = ApiResponse;
