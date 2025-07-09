import { execSync } from 'child_process';

export function json_safe_parse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function runtime_info_get(): string {
  // Check if running in Bun
  if (process.versions.bun) {
    const bunVersion = process.versions.bun;
    return `Bun v.${bunVersion}`;
  } 
  else if (process.argv[0] && process.argv[0].includes('node')) {
    let tsxVersion;
    try {
      tsxVersion = execSync('npx tsx --version', { encoding: 'utf8' })
        .trim()
        .replace(/\r?\n/g, " ");
    } catch (error) {
      tsxVersion = 'unknown';
    }
    return `${tsxVersion}`;
  } 
  // Fallback for unknown environment
  else {
    return 'an unknown environment';
  }
}

