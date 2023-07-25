const JWT = require("jsonwebtoken");

class Response {
  constructor(status, payload) {
    this.status = status;
    this.payload = payload;
  }
}

const Status = {
  SUCCESS: "success",
  ERROR: "error",
};

function successResponse(payload) {
  return new Response(Status.SUCCESS, payload);
}

function errorResponse(payload) {
  return new Response(Status.ERROR, payload);
}

function jwtResponse(payload) {
  const jwt = JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return successResponse(jwt);
}

module.exports = { successResponse, errorResponse, jwtResponse };
