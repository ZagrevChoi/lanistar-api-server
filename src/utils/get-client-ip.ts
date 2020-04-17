import { Request } from "express";

const getClientIp = (req: Request) => {
  let ip = "";
  const xForward = req.headers["x-forwarded-for"];
  if (xForward) {
    if (typeof xForward === "string") {
      ip = xForward.split(",")[0];
    }
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }
  return ip;
};

export default getClientIp;
