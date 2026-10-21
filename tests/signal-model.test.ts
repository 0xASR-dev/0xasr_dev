import { describe, expect, it } from 'vitest';
import { signalModel } from '../src/lib/signal-model';

describe('signalModel', () => {
  it('returns clean, raw and filtered arrays of constant length', () => {
    const result = signalModel(0.5, null);

    expect(result.clean).toHaveLength(320);
    expect(result.raw).toHaveLength(320);
    expect(result.filtered).toHaveLength(320);
    expect(result.clean.every(Number.isFinite)).toBe(true);
    expect(result.raw.every(Number.isFinite)).toBe(true);
    expect(result.filtered.every(Number.isFinite)).toBe(true);
  });

  it('matches the expected no-noise case when lambda is 0', () => {
    const { raw, filtered } = signalModel(0, null);
    expect(filtered).toEqual(raw);
  });
});
