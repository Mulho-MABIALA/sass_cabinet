import { AccessTokenPayload, PlatformAccessTokenPayload } from "../shared/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      platformAdmin?: PlatformAccessTokenPayload;
    }
  }
}

export {};
