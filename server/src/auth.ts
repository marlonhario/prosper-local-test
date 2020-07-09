import { User } from "./entity/User";
import { sign, verify, decode } from "jsonwebtoken";

export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m"
  });
};

export const createVerificationToken = (email: string, password: string) => {
  return sign({email: email, password: password}, process.env.VERIFICATION_TOKEN!, {
    expiresIn: "15m"
  });
};

export const verifyToken = (token: string) => {
  return verify(token, process.env.VERIFICATION_TOKEN!, (err) => {
    return err ? false : true;
  });
};

export const decodeToken = (token: string) => {
  return decode(token);
};

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d"
    }
  );
};
