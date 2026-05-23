export interface RngService {
  readonly seed: string;
  nextFloat(): number;
  nextInt(minInclusive: number, maxExclusive: number): number;
  pickOne<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
  fork(label: string): RngService;
}

const UINT_32_MAX_EXCLUSIVE = 0x100000000;

export class SeededRng implements RngService {
  readonly seed: string;

  private state: number;

  constructor(seed: string) {
    this.seed = seed;
    this.state = hashSeed(seed);
  }

  nextFloat(): number {
    this.state = mulberry32(this.state);
    return this.state / UINT_32_MAX_EXCLUSIVE;
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive)) {
      throw new Error('RNG integer bounds must be integers');
    }

    if (maxExclusive <= minInclusive) {
      throw new Error('RNG maxExclusive must be greater than minInclusive');
    }

    const range = maxExclusive - minInclusive;
    return minInclusive + Math.floor(this.nextFloat() * range);
  }

  pickOne<T>(items: readonly T[]): T {
    if (items.length === 0) {
      throw new Error('Cannot pick from an empty collection');
    }

    return items[this.nextInt(0, items.length)];
  }

  shuffle<T>(items: readonly T[]): T[] {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = this.nextInt(0, index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }

    return shuffled;
  }

  fork(label: string): RngService {
    return new SeededRng(`${this.seed}:${label}:${this.state}`);
  }
}

export function createRng(seed: string): RngService {
  if (seed.trim().length === 0) {
    throw new Error('RNG seed cannot be empty');
  }

  return new SeededRng(seed);
}

function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(value: number): number {
  let next = (value + 0x6d2b79f5) >>> 0;
  let mixed = Math.imul(next ^ (next >>> 15), next | 1);
  mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
  next = (mixed ^ (mixed >>> 14)) >>> 0;
  return next;
}
