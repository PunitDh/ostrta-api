import JWT from "jsonwebtoken";
import LOGGER from "../utils/logger";
import { convertToMilliseconds } from "../utils/dateTimeUtils";

export enum Status {
  SUCCESS = "success",
  CREATED = "created",
  NO_CONTENT = "no content",
  ERROR = "error",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
}

class APIResponse {
  status: any;
  payload: any;
  code: any;
  _processTimeMs: any;

  constructor(
    status: Status,
    payload: any,
    code: number,
    hrtime?: [number, number]
  ) {
    this.status = status;
    this.payload = payload;
    this.code = code;
    if (hrtime)
      this._processTimeMs = convertToMilliseconds(process.hrtime(hrtime));
  }

  isError(): boolean {
    return this.status === Status.ERROR;
  }

  isSuccess(): boolean {
    return this.status === Status.SUCCESS;
  }

  isUnauthorized(): boolean {
    return this.status === Status.UNAUTHORIZED;
  }
}

export function successResponse(
  payload: any,
  hrtime?: [number, number],
  code = 200
): APIResponse {
  return new APIResponse(Status.SUCCESS, payload, code, hrtime);
}

export function createdResponse(payload: any, code = 201): APIResponse {
  return new APIResponse(Status.CREATED, payload, code);
}

export function noContentResponse(payload: any, code = 204): APIResponse {
  return new APIResponse(Status.SUCCESS, payload, code);
}

export function errorResponse(message: string, code = 400): APIResponse {
  const response = new APIResponse(Status.ERROR, message, code);
  LOGGER.error(response);
  return response;
}

export function unauthorizedResponse(
  message: string = "Unauthorized"
): APIResponse {
  const response = new APIResponse(Status.UNAUTHORIZED, message, 401);
  LOGGER.error(response);
  return response;
}

export function forbiddenResponse(message: string = "Forbidden"): APIResponse {
  const response = new APIResponse(Status.FORBIDDEN, message, 403);
  LOGGER.error(response);
  return response;
}

export function notFoundResponse(message: string = "Not Found"): APIResponse {
  const response = new APIResponse(Status.ERROR, message, 404);
  LOGGER.error(response);
  return response;
}

export function jwtResponse(payload: any): APIResponse {
  const jwt = JWT.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return createdResponse(jwt);
}
