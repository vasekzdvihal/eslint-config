const MAX_RETRIES = 3;

export function greet(name: string): string {
  if (name.length === 0) {
    return 'Hello, stranger!';
  }
  return `Hello, ${name}!`;
}

export function retry(attempt: number): boolean {
  return attempt < MAX_RETRIES;
}
