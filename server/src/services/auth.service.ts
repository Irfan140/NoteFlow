import { SignJWT, jwtVerify } from "jose";
import { hash, verify } from "argon2";
import { prisma } from "../libs/prisma";
import { env } from "../config/env";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema";
import type { JwtPayload } from "../middlewares/auth";

function getSecret(secret: string) {
  return new TextEncoder().encode(secret);
}

async function generateTokens(userId: string, email: string) {
  const payload: JwtPayload = { userId, email };

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRY)
    .sign(getSecret(env.JWT_SECRET));

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRY)
    .sign(getSecret(env.JWT_REFRESH_SECRET));

  // Store refresh token in DB for rotation
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
}

export const registerUser = async (input: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hash(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  });

  const tokens = await generateTokens(user.id, user.email);
  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const valid = await verify(user.passwordHash, input.password);
  if (!valid) {
    throw new Error("Invalid email or password");
  }

  const tokens = await generateTokens(user.id, user.email);
  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
};

export const refreshTokens = async (refreshToken: string) => {
  let payload: JwtPayload;

  try {
    const { payload: verified } = await jwtVerify<JwtPayload>(
      refreshToken,
      getSecret(env.JWT_REFRESH_SECRET),
    );
    payload = verified;
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== refreshToken) {
    // Token reused or user not found — revoke
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
    }
    throw new Error("Refresh token revoked");
  }

  const tokens = await generateTokens(user.id, user.email);
  return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
};

export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
};
