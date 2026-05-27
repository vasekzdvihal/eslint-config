const GREETING = 'Hello';

export function greet(name: string): string {
  if (name.length === 0) {
    return `${GREETING}, stranger!`;
  }
  return `${GREETING}, ${name}!`;
}
