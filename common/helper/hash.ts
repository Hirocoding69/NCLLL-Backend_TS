import bcrypt from "bcrypt";

export function encrypt(plainText: string, saltRounds: number = 10) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(plainText, salt);
  return hash;
}

export function compare(plainText: string, hash: string) {
  return bcrypt.compareSync(plainText, hash);
}
