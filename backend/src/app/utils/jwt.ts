import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export const generateToken = (payload: { id: string; role: string; status: string }) => {
  return jwt.sign(payload, env.jwtSecret!, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtSecret!);
};
