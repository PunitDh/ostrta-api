const JWT = require("jsonwebtoken");

const Status = {
  SUCCESS: "success",
  CREATED: "created",
  ERROR: "error",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
};

class Response {
  /**
   *
   * @param {Status} status
   * @param {any} payload
   * @param {Number} code
   */
  constructor(status, payload, code) {
    this.status = status;
    this.payload = payload;
    this.code = code;
  }

  isError() {
    return this.status === Status.ERROR;
  }

  isSuccess() {
    return this.status === Status.SUCCESS;
  }

  isUnauthorized() {
    return this.status === Status.UNAUTHORIZED;
  }
}

function successResponse(payload, code = 200) {
  return new Response(Status.SUCCESS, payload, code);
}

function createdResponse(payload, code = 201) {
  return new Response(Status.CREATED, payload, code);
}

function errorResponse(message, code = 400) {
  const response = new Response(Status.ERROR, message, code);
  console.log(response);
  return response;
}

function unauthorizedResponse(message = "Unauthorized") {
  return new Response(Status.UNAUTHORIZED, message, 401);
}

function forbiddenResponse(message = "Forbidden") {
  return new Response(Status.FORBIDDEN, message, 401);
}

function notFoundResponse(message = "Not Found") {
  return new Response(Status.ERROR, message, 404);
}

function jwtResponse(payload) {
  const jwt = JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return successResponse(jwt);
}

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  jwtResponse,
  Status,
};
