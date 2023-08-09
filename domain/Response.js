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
  return new Response(Status.ERROR, message, code);
}

function unauthorizedResponse(message = "Unauthorized", code = 401) {
  return new Response(Status.UNAUTHORIZED, message, code);
}

function forbiddenResponse(message = "Forbidden", code = 403) {
  return new Response(Status.FORBIDDEN, message, code);
}

function notFoundResponse(message = "Not Found", code = 404) {
  return new Response(Status.ERROR, message, code);
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
