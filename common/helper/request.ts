export function getClientIp(req: any): string {
  return req.headers['cf-connecting-ip'] || req.ip || '';
}
