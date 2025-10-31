import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { AuthTokenPayload } from "./interfaces";
import bcrypt from "bcrypt";
import { PASSWORD_SALT_ROUNDS } from "./constants";

const JWT_SECRET = ENV.JWT.SECRET;
const JWT_EXPIRES_IN = "7d";

export function generateJwt(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): AuthTokenPayload {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
