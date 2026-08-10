import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  cabinetId: string;
  role: "admin" | "collaborateur";
}

export interface RefreshTokenPayload {
  userId: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

// Tokens de la console plateforme (super-admin) : secret et payload distincts des tokens cabinet
// ci-dessus, pour qu'un JWT cabinet ne puisse jamais être accepté sur les routes /platform.
export interface PlatformAccessTokenPayload {
  platformAdminId: string;
  scope: "platform";
}

export function generatePlatformAccessToken(platformAdminId: string): string {
  const payload: PlatformAccessTokenPayload = { platformAdminId, scope: "platform" };
  const options: SignOptions = {
    expiresIn: env.PLATFORM_JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.PLATFORM_JWT_SECRET, options);
}

export function verifyPlatformAccessToken(token: string): PlatformAccessTokenPayload {
  return jwt.verify(token, env.PLATFORM_JWT_SECRET) as PlatformAccessTokenPayload;
}
