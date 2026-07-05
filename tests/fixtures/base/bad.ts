export function broken(a: number) {
  if (a == 5) return "boom"
  console.log(a)
  return a
}

export function tooManyParams(first: number, second: number, third: number, fourth: number, fifth: number): number {
  debugger;
  const q = first + second;
  const loose: any = third;
  const unusedValue = fourth;
  let magic = 42;
  magic += fifth;
  return q + magic + loose;
}

export function deeplyBranched(flag: number): string {
  if (flag > 0) {
    if (flag > 1) {
      if (flag > 2) {
        if (flag > 3) {
          if (flag > 4) {
            return 'deep';
          }
        }
      }
    }
  }
  if (flag === 5) {
    return 'five';
  }
  if (flag === 6) {
    return 'six';
  }
  if (flag === 7) {
    return 'seven';
  }
  if (flag === 8) {
    return 'eight';
  }
  if (flag === 9) {
    return 'nine';
  }
  if (flag === 10) {
    return 'ten';
  }
  return 'shallow';
}
