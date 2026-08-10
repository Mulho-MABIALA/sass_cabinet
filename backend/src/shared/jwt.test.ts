import { describe, expect, it } from "vitest";
import {
  generateAccessToken,
  generatePlatformAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyPlatformAccessToken,
  verifyRefreshToken,
} from "./jwt";

describe("jwt (auth cabinet)", () => {
  it("génère puis vérifie un access token avec le bon payload", () => {
    const token = generateAccessToken({ userId: "u1", cabinetId: "c1", role: "admin" });
    const payload = verifyAccessToken(token);

    expect(payload.userId).toBe("u1");
    expect(payload.cabinetId).toBe("c1");
    expect(payload.role).toBe("admin");
  });

  it("génère puis vérifie un refresh token", () => {
    const token = generateRefreshToken({ userId: "u1" });
    const payload = verifyRefreshToken(token);

    expect(payload.userId).toBe("u1");
  });

  it("rejette un access token altéré", () => {
    const token = generateAccessToken({ userId: "u1", cabinetId: "c1", role: "admin" });
    const altere = `${token}x`;

    expect(() => verifyAccessToken(altere)).toThrow();
  });
});

describe("jwt (console plateforme)", () => {
  it("génère un token plateforme avec scope=platform, distinct du secret cabinet", () => {
    const token = generatePlatformAccessToken("admin1");
    const payload = verifyPlatformAccessToken(token);

    expect(payload.platformAdminId).toBe("admin1");
    expect(payload.scope).toBe("platform");
  });

  it("un token cabinet ne doit jamais être accepté comme token plateforme (secrets distincts)", () => {
    const tokenCabinet = generateAccessToken({ userId: "u1", cabinetId: "c1", role: "admin" });

    expect(() => verifyPlatformAccessToken(tokenCabinet)).toThrow();
  });

  it("un token plateforme ne doit jamais être accepté comme token cabinet (secrets distincts)", () => {
    const tokenPlateforme = generatePlatformAccessToken("admin1");

    expect(() => verifyAccessToken(tokenPlateforme)).toThrow();
  });
});
