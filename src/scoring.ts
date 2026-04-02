import {
  Flow,
  MissingSystem,
  ScoringOutput,
  Trap,
  TrapScores,
  FlowScores,
  UserAnswers,
} from './types';
import { FLOW_QUESTION_IDS, QUESTIONS } from './questions';

// ── Constants ──────────────────────────────────────────────────────────────

/** Threshold (0–100 scale) above which a trap is considered "high". */
const HIGH_TRAP_THRESHOLD = 60;

/** Threshold above which key_person_reliance overrides the constraint. */
const KEY_PERSON_OVERRIDE_THRESHOLD = 75;

/** Threshold (0–100 scale) below which a flow is considered "weak". */
const WEAK_FLOW_THRESHOLD = 60;

/** Threshold above which a flow is considered "strong". */
const STRONG_FLOW_THRESHOLD = 70;

const TRAPS: Trap[] = [
  'growth_by_addition',
  'key_person_reliance',
  'acquisition_over_expansion',
  'activity_confusion',
];

const FLOWS: Flow[] = ['demand', 'sales', 'delivery', 'expansion'];

/** Maps each trap to the system that addresses it. */
const TRAP_TO_SYSTEM: Record<Trap, MissingSystem> = {
  growth_by_addition: 'repeatable_delivery',
  key_person_reliance: 'quality_framework',
  acquisition_over_expansion: 'expansion_mechanism',
  activity_confusion: 'flow_management',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Returns the effective score for a question given user answers.
 * If the question is reverse-scored, inverts it: effective = 6 - raw.
 */
function effectiveScore(questionId: number, answers: UserAnswers): number | null {
  const raw = answers[questionId];
  if (raw === undefined || raw < 1 || raw > 5) return null;

  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return null;

  return question.reverse ? 6 - raw : raw;
}

// ── Trap Scoring ───────────────────────────────────────────────────────────

/**
 * Computes trap scores (0–100 scale).
 *
 * Formula: avg(effective_scores_for_trap_questions) × 20
 *
 * Effective score uses `reverse` flag so that questions framed as positive
 * competency still contribute correctly (e.g. Q18 reversed → high raw answer
 * means low trap severity).
 *
 * Range in practice: 20–100 (since answers are 1–5).
 */
export function computeTrapScores(answers: UserAnswers): TrapScores {
  const scores = {} as TrapScores;

  for (const trap of TRAPS) {
    const trapQuestions = QUESTIONS.filter((q) => q.maps_to_trap === trap);
    const values: number[] = [];

    for (const q of trapQuestions) {
      const score = effectiveScore(q.id, answers);
      if (score !== null) {
        values.push(score * q.weight);
      }
    }

    scores[trap] = Math.round(average(values) * 20);
  }

  return scores;
}

// ── Flow Scoring ───────────────────────────────────────────────────────────

/**
 * Computes flow health scores (0–100 scale).
 *
 * Formula: avg(raw_answers_for_flow_questions) × 20
 *
 * Flow questions are all positively framed (agree = healthier flow),
 * so no reverse scoring is applied here.
 *
 * Range in practice: 20–100.
 */
export function computeFlowScores(answers: UserAnswers): FlowScores {
  const scores = {} as FlowScores;

  for (const flow of FLOWS) {
    const ids = FLOW_QUESTION_IDS[flow] ?? [];
    const values: number[] = [];

    for (const id of ids) {
      const raw = answers[id];
      if (raw !== undefined && raw >= 1 && raw <= 5) {
        values.push(raw);
      }
    }

    scores[flow] = Math.round(average(values) * 20);
  }

  return scores;
}

// ── Constraint Detection ───────────────────────────────────────────────────

/**
 * Deterministic constraint detection rules (evaluated in priority order).
 *
 * Rule 1 (override): key_person_reliance > 75 → constraint = "decision_quality_layer"
 * Rule 2: delivery is lowest flow AND growth_by_addition is high → constraint = "delivery"
 * Rule 3: expansion is lowest flow AND acquisition_over_expansion is high → constraint = "expansion_system"
 * Rule 4: demand > 70 AND delivery < 60 → constraint = "delivery" (over-fueling)
 * Rule 5 (default): constraint = weakest flow name
 */
export function detectConstraint(
  trapScores: TrapScores,
  flowScores: FlowScores,
): { constraint: string; warning?: string } {
  const weakestFlow = getWeakestFlow(flowScores);
  let warning: string | undefined;

  // Over-fueling warning (checked regardless of which constraint wins)
  if (
    flowScores.demand > STRONG_FLOW_THRESHOLD &&
    flowScores.delivery < WEAK_FLOW_THRESHOLD
  ) {
    warning =
      "Over-fueling warning: your demand engine is strong but delivery is weak. Adding more leads will increase strain, not revenue.";
  }

  // Rule 1: key person override
  if (trapScores.key_person_reliance > KEY_PERSON_OVERRIDE_THRESHOLD) {
    return { constraint: 'decision_quality_layer', warning };
  }

  // Rule 2: delivery is weakest AND growth_by_addition is high
  if (
    weakestFlow === 'delivery' &&
    trapScores.growth_by_addition > HIGH_TRAP_THRESHOLD
  ) {
    return { constraint: 'delivery', warning };
  }

  // Rule 3: expansion is weakest AND acquisition_over_expansion is high
  if (
    weakestFlow === 'expansion' &&
    trapScores.acquisition_over_expansion > HIGH_TRAP_THRESHOLD
  ) {
    return { constraint: 'expansion_system', warning };
  }

  // Rule 4: over-fueling delivery constraint
  if (
    flowScores.demand > STRONG_FLOW_THRESHOLD &&
    flowScores.delivery < WEAK_FLOW_THRESHOLD
  ) {
    return { constraint: 'delivery', warning };
  }

  // Rule 5: default to weakest flow
  return { constraint: weakestFlow, warning };
}

// ── Ranking Helpers ────────────────────────────────────────────────────────

function rankedTraps(trapScores: TrapScores): Trap[] {
  return [...TRAPS].sort((a, b) => trapScores[b] - trapScores[a]);
}

function getWeakestFlow(flowScores: FlowScores): Flow {
  return FLOWS.reduce((min, f) => (flowScores[f] < flowScores[min] ? f : min));
}

function getStrongestFlow(flowScores: FlowScores): Flow {
  return FLOWS.reduce((max, f) => (flowScores[f] > flowScores[max] ? f : max));
}

// ── Main Scoring Function ──────────────────────────────────────────────────

/**
 * Validates that all 24 question IDs have an answer in the 1–5 range.
 * Returns an array of missing/invalid question ids.
 */
export function validateAnswers(answers: UserAnswers): number[] {
  return QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return v === undefined || v < 1 || v > 5;
  }).map((q) => q.id);
}

/**
 * Runs the full scoring pipeline and returns the diagnostic output.
 *
 * Throws if any answer is missing or out of range.
 */
export function score(answers: UserAnswers): ScoringOutput {
  const invalid = validateAnswers(answers);
  if (invalid.length > 0) {
    throw new Error(`Missing or invalid answers for question IDs: ${invalid.join(', ')}`);
  }

  const trap_scores = computeTrapScores(answers);
  const flow_scores = computeFlowScores(answers);

  const [primary_trap, secondary_trap] = rankedTraps(trap_scores);
  const weakest_flow = getWeakestFlow(flow_scores);
  const strongest_flow = getStrongestFlow(flow_scores);

  const { constraint, warning } = detectConstraint(trap_scores, flow_scores);
  const recommended_system = TRAP_TO_SYSTEM[primary_trap];

  const output: ScoringOutput = {
    trap_scores,
    flow_scores,
    primary_trap,
    secondary_trap,
    weakest_flow,
    strongest_flow,
    constraint,
    recommended_system,
  };

  if (warning) {
    output.warning = warning;
  }

  return output;
}
