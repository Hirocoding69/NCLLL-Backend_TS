export function sleep(ms = 0) {
  return new Promise((res) => setTimeout(res, ms));
}

export function shuffle(array: any[]) {
  var currentIndex = array.length,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function camelToSnake(str: string) {
  return str.replace(/[A-Z]/g, (x) => `_${x.toLowerCase()}`);
}

export function randomString(length = Math.floor(Math.random() * 10)) {
  var randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getAppEnv() {
  return process.env.APP_ENV || "local";
}

export function isLocal() {
  return getAppEnv() === "local";
}

export function isStaging() {
  return getAppEnv() === "staging";
}

export function isDev() {
  return getAppEnv() === "dev";
}

export function isProduction() {
  return getAppEnv() === "production";
}
