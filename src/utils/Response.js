export default class Response {
  constructor(statusCode, success, message, data) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success(statusCode = 200, message, data = null) {
    return new Response(statusCode, true, message, data);
  }

  static error(statusCode = 500, message, data = null) {
    return new Response(statusCode, false, message, data);
  }
}
