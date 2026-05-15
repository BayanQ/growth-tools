import { Trap, Flow } from './types';

export interface BenchmarkRange {
  /** 25th percentile — bottom quarter of similar businesses */
  p25: number;
  /** Median — midpoint of similar businesses */
  p50: number;
  /** 75th percentile — top quarter of similar businesses */
  p75: number;
}

/**
 * Static benchmark ranges for growth trap scores (0–100, higher = more trapped).
 * Derived from representative service/consulting SMBs (10–200 employees).
 */
export const TRAP_BENCHMARKS: Record<Trap, BenchmarkRange> = {
  growth_by_addition:         { p25: 48, p50: 62, p75: 74 },
  key_person_reliance:        { p25: 50, p50: 64, p75: 76 },
  acquisition_over_expansion: { p25: 44, p50: 58, p75: 70 },
  activity_confusion:         { p25: 46, p50: 60, p75: 72 },
};

/**
 * Static benchmark ranges for flow health scores (0–100, higher = healthier).
 * Derived from representative service/consulting SMBs (10–200 employees).
 */
export const FLOW_BENCHMARKS: Record<Flow, BenchmarkRange> = {
  demand:    { p25: 44, p50: 56, p75: 68 },
  sales:     { p25: 42, p50: 54, p75: 66 },
  delivery:  { p25: 46, p50: 58, p75: 70 },
  expansion: { p25: 38, p50: 50, p75: 62 },
};

export type TrapPosition = 'better' | 'typical' | 'watch';
export type FlowPosition = 'stronger' | 'typical' | 'weaker';

/** Returns how the user's trap score compares to the peer benchmark. */
export function trapPosition(score: number, bench: BenchmarkRange): TrapPosition {
  if (score < bench.p25) return 'better';
  if (score > bench.p75) return 'watch';
  return 'typical';
}

/** Returns how the user's flow score compares to the peer benchmark. */
export function flowPosition(score: number, bench: BenchmarkRange): FlowPosition {
  if (score > bench.p75) return 'stronger';
  if (score < bench.p25) return 'weaker';
  return 'typical';
}
