const JWT = require("jsonwebtoken");
const LOGGER = require("../utils/logger");
const { convertToMilliseconds } = require("../utils");

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
  constructor(status, payload, code, hrtime) {
    this.status = status;
    this.payload = payload;
    this.code = code;
    if (hrtime)
      this._processTimeMs = convertToMilliseconds(process.hrtime(hrtime));
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

function successResponse(payload, hrtime, code = 200) {
  return new Response(Status.SUCCESS, payload, code, hrtime);
}

function createdResponse(payload, code = 201) {
  return new Response(Status.CREATED, payload, code);
}

function errorResponse(message, code = 400) {
  const response = new Response(Status.ERROR, message, code);
  LOGGER.error(response);
  return response;
}

function unauthorizedResponse(message = "Unauthorized") {
  const response = new Response(Status.UNAUTHORIZED, message, 401);
  LOGGER.error(response);
  return response;
}

function forbiddenResponse(message = "Forbidden") {
  const response = new Response(Status.FORBIDDEN, message, 403);
  LOGGER.error(response);
  return response;
}

function notFoundResponse(message = "Not Found") {
  const response = new Response(Status.ERROR, message, 404);
  // LOGGER.error(response);
  return response;
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
  Response
};
