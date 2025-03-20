import jwt, { SignOptions } from "jsonwebtoken";

type JwtPayload = jwt.JwtPayload & { userId: string };

export class JwtUtils {
  static sign(payload: object, expiresIn: number | string = "1d"): string {
    const options: SignOptions = { expiresIn: expiresIn as number | undefined };
    return jwt.sign(payload, process.env.JWT_SECRET || "", options);
  }

  static verify(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
    } catch (e) {
      return null;
    }
  }

  static decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
