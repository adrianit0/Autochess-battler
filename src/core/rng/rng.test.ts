import { createRng } from './rng';

describe('SeededRng', () => {
  it('produces the same sequence for the same seed', () => {
    const first = createRng('test-seed');
    const second = createRng('test-seed');

    expect([first.nextFloat(), first.nextFloat(), first.nextFloat()]).toEqual([
      second.nextFloat(),
      second.nextFloat(),
      second.nextFloat(),
    ]);
  });

  it('produces different sequences for different seeds', () => {
    const first = createRng('seed-a');
    const second = createRng('seed-b');

    expect([first.nextFloat(), first.nextFloat(), first.nextFloat()]).not.toEqual([
      second.nextFloat(),
      second.nextFloat(),
      second.nextFloat(),
    ]);
  });

  it('returns integers inside the requested range', () => {
    const rng = createRng('range-seed');

    for (let index = 0; index < 100; index += 1) {
      const value = rng.nextInt(2, 5);
      expect(value).toBeGreaterThanOrEqual(2);
      expect(value).toBeLessThan(5);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('picks deterministic elements from arrays', () => {
    const first = createRng('pick-seed');
    const second = createRng('pick-seed');
    const items = ['a', 'b', 'c', 'd'];

    expect([first.pickOne(items), first.pickOne(items)]).toEqual([
      second.pickOne(items),
      second.pickOne(items),
    ]);
  });

  it('shuffles without mutating the source array', () => {
    const rng = createRng('shuffle-seed');
    const items = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle(items);

    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect([...shuffled].sort()).toEqual(items);
  });

  it('rejects an empty seed', () => {
    expect(() => createRng('')).toThrow('RNG seed cannot be empty');
  });
});
