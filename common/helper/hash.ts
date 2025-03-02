import bcrypt from "bcrypt";

import { createHash } from 'crypto';

export function encrypt(plainText: string, saltRounds: number = 10) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
}

export function compare(plainText: string, hash: string) {
  return bcrypt.compareSync(plainText, hash);
}

export function md5Hash(password: string): string {
    return createHash('md5').update(password).digest('hex');
}
export function compareMd5(inputPassword: string, storedHash: string): boolean {
  return md5Hash(inputPassword) === storedHash;
}