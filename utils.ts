export function json_safe_parse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
