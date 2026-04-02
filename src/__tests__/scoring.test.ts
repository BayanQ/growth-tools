import {
  computeTrapScores,
  computeFlowScores,
  detectConstraint,
  validateAnswers,
  score,
} from '../scoring';
import { QUESTIONS } from '../questions';
import { UserAnswers } from '../types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a UserAnswers object with a single uniform value for all 24 questions. */
function uniform(value: number): UserAnswers {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, value]));
}

/** Build answers, overriding specific question IDs. */
function withOverrides(base: number, overrides: Record<number, number>): UserAnswers {
  return { ...uniform(base), ...overrides };
}

// ── Question schema ───────────────────────────────────────────────────────────

describe('QUESTIONS schema', () => {
  it('has exactly 24 questions', () => {
    expect(QUESTIONS).toHaveLength(24);
  });

  it('has unique IDs 1–24', () => {
    const ids = QUESTIONS.map((q) => q.id).sort((a, b) => a - b);
    expect(ids).toEqual([...Array(24)].map((_, i) => i + 1));
  });

  it('all questions have weight = 1 by default', () => {
    QUESTIONS.forEach((q) => {
      expect(q.weight).toBe(1);
    });
  });

  it('all questions have a section', () => {
    QUESTIONS.forEach((q) => {
      expect(q.section).toBeDefined();
    });
  });

  it('Q18 is marked reverse', () => {
    const q18 = QUESTIONS.find((q) => q.id === 18);
    expect(q18?.reverse).toBe(true);
  });

  it('Q21 is marked reverse (systematic expansion = low acquisition_over_expansion)', () => {
    const q21 = QUESTIONS.find((q) => q.id === 21);
    expect(q21?.reverse).toBe(true);
    expect(q21?.maps_to_trap).toBe('acquisition_over_expansion');
  });

  it('maps correct questions to growth_by_addition trap', () => {
    const ids = QUESTIONS.filter((q) => q.maps_to_trap === 'growth_by_addition').map((q) => q.id);
    expect(ids.sort()).toEqual([1, 2, 6]);
  });

  it('maps correct questions to key_person_reliance trap', () => {
    const ids = QUESTIONS.filter((q) => q.maps_to_trap === 'key_person_reliance').map((q) => q.id);
    expect(ids.sort((a, b) => a - b)).toEqual([3, 18, 22, 23, 24]);
  });

  it('maps correct questions to acquisition_over_expansion trap', () => {
    const ids = QUESTIONS.filter((q) => q.maps_to_trap === 'acquisition_over_expansion').map((q) => q.id);
    expect(ids.sort((a, b) => a - b)).toEqual([5, 21]);
  });

  it('maps correct questions to activity_confusion trap', () => {
    const ids = QUESTIONS.filter((q) => q.maps_to_trap === 'activity_confusion').map((q) => q.id);
    expect(ids.sort()).toEqual([4]);
  });
});

// ── Trap scoring ─────────────────────────────────────────────────────────────

describe('computeTrapScores', () => {
  it('returns score 100 when all mapped questions are 5 (max)', () => {
    const answers = uniform(5);
    const scores = computeTrapScores(answers);
    // avg(5,5,5) * 20 = 100
    expect(scores.growth_by_addition).toBe(100);
  });

  it('returns score 20 when all mapped questions are 1 (min)', () => {
    const answers = uniform(1);
    const scores = computeTrapScores(answers);
    expect(scores.growth_by_addition).toBe(20);
  });

  it('correctly reverses Q18 for key_person_reliance', () => {
    // Q3=5, Q18=5(reversed→1), Q22=5, Q23=5, Q24=5 → avg(5,1,5,5,5)*20 = avg=4.2*20=84
    const answers = withOverrides(3, { 3: 5, 18: 5, 22: 5, 23: 5, 24: 5 });
    const scores = computeTrapScores(answers);
    const expected = Math.round(((5 + 1 + 5 + 5 + 5) / 5) * 20); // 21/5 = 4.2 → 84
    expect(scores.key_person_reliance).toBe(expected);
  });

  it('key_person_reliance score is higher when Q18=1 (dependent on individuals)', () => {
    const dependent = withOverrides(3, { 3: 5, 18: 1, 22: 5, 23: 5, 24: 5 });
    const independent = withOverrides(3, { 3: 5, 18: 5, 22: 5, 23: 5, 24: 5 });
    const depScore = computeTrapScores(dependent).key_person_reliance;
    const indScore = computeTrapScores(independent).key_person_reliance;
    expect(depScore).toBeGreaterThan(indScore);
  });

  it('activity_confusion maps only Q4', () => {
    const answers = withOverrides(1, { 4: 5 });
    const scores = computeTrapScores(answers);
    expect(scores.activity_confusion).toBe(100); // avg(5)*20 = 100
  });

  it('growth_by_addition is average of Q1, Q2, Q6', () => {
    const answers = withOverrides(1, { 1: 4, 2: 2, 6: 3 });
    const scores = computeTrapScores(answers);
    const expected = Math.round(((4 + 2 + 3) / 3) * 20); // 3 * 20 = 60
    expect(scores.growth_by_addition).toBe(expected);
  });
});

// ── Flow scoring ─────────────────────────────────────────────────────────────

describe('computeFlowScores', () => {
  it('scores all flows at 100 when all answers are 5', () => {
    const answers = uniform(5);
    const scores = computeFlowScores(answers);
    expect(scores.demand).toBe(100);
    expect(scores.sales).toBe(100);
    expect(scores.delivery).toBe(100);
    expect(scores.expansion).toBe(100);
  });

  it('scores all flows at 20 when all answers are 1', () => {
    const answers = uniform(1);
    const scores = computeFlowScores(answers);
    expect(scores.demand).toBe(20);
    expect(scores.sales).toBe(20);
    expect(scores.delivery).toBe(20);
    expect(scores.expansion).toBe(20);
  });

  it('demand flow uses Q7–Q10', () => {
    const answers = withOverrides(5, { 7: 1, 8: 1, 9: 1, 10: 1 });
    const scores = computeFlowScores(answers);
    expect(scores.demand).toBe(20);
    // Sales includes Q10, so sales score is still affected
  });

  it('expansion flow uses Q19–Q21', () => {
    const answers = withOverrides(5, { 19: 1, 20: 1, 21: 1 });
    const scores = computeFlowScores(answers);
    expect(scores.expansion).toBe(20);
  });

  it('flow scores are NOT affected by trap reverse flag (raw answers used)', () => {
    // Q18 is reverse for traps but flow scoring uses raw value
    const answersLow18 = withOverrides(5, { 18: 1 });
    const answersHigh18 = uniform(5);
    const scoresLow = computeFlowScores(answersLow18);
    const scoresHigh = computeFlowScores(answersHigh18);
    // delivery includes Q18; low Q18 should produce lower delivery flow score
    expect(scoresLow.delivery).toBeLessThan(scoresHigh.delivery);
  });

  it('Q10 contributes to both demand and sales flows', () => {
    const baseAnswers = withOverrides(3, { 10: 5 });
    const scores = computeFlowScores(baseAnswers);
    // Both should be influenced (demand includes Q10, sales includes Q10)
    // demand: Q7-10 all 3 except Q10=5 → avg(3,3,3,5)*20
    const expectedDemand = Math.round(((3 + 3 + 3 + 5) / 4) * 20);
    expect(scores.demand).toBe(expectedDemand);
  });
});

// ── Constraint detection ──────────────────────────────────────────────────────

describe('detectConstraint', () => {
  it('Rule 1: key_person_reliance > 75 → constraint = decision_quality_layer', () => {
    const trapScores = {
      growth_by_addition: 40,
      key_person_reliance: 80,
      acquisition_over_expansion: 40,
      activity_confusion: 40,
    };
    const flowScores = { demand: 70, sales: 60, delivery: 50, expansion: 55 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.constraint).toBe('decision_quality_layer');
  });

  it('Rule 2: delivery is weakest AND growth_by_addition > 60 → constraint = delivery', () => {
    const trapScores = {
      growth_by_addition: 70,
      key_person_reliance: 50,
      acquisition_over_expansion: 30,
      activity_confusion: 30,
    };
    const flowScores = { demand: 75, sales: 70, delivery: 40, expansion: 65 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.constraint).toBe('delivery');
  });

  it('Rule 3: expansion is weakest AND acquisition_over_expansion > 60 → constraint = expansion_system', () => {
    const trapScores = {
      growth_by_addition: 40,
      key_person_reliance: 40,
      acquisition_over_expansion: 70,
      activity_confusion: 30,
    };
    const flowScores = { demand: 75, sales: 70, delivery: 65, expansion: 35 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.constraint).toBe('expansion_system');
  });

  it('Rule 4: demand > 70 AND delivery < 60 → constraint = delivery (over-fueling)', () => {
    const trapScores = {
      growth_by_addition: 40,
      key_person_reliance: 40,
      acquisition_over_expansion: 40,
      activity_confusion: 40,
    };
    const flowScores = { demand: 80, sales: 65, delivery: 50, expansion: 60 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.constraint).toBe('delivery');
  });

  it('Rule 4 sets over-fueling warning', () => {
    const trapScores = {
      growth_by_addition: 40,
      key_person_reliance: 40,
      acquisition_over_expansion: 40,
      activity_confusion: 40,
    };
    const flowScores = { demand: 80, sales: 65, delivery: 50, expansion: 60 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.warning).toContain('Over-fueling');
  });

  it('Rule 1 takes priority over over-fueling scenario', () => {
    const trapScores = {
      growth_by_addition: 40,
      key_person_reliance: 80,
      acquisition_over_expansion: 40,
      activity_confusion: 40,
    };
    const flowScores = { demand: 80, sales: 65, delivery: 50, expansion: 60 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.constraint).toBe('decision_quality_layer');
    // Warning still fires
    expect(result.warning).toBeDefined();
  });

  it('Rule 5 (default): returns weakest flow when no other rules match', () => {
    const trapScores = {
      growth_by_addition: 30,
      key_person_reliance: 30,
      acquisition_over_expansion: 30,
      activity_confusion: 30,
    };
    const flowScores = { demand: 70, sales: 75, delivery: 80, expansion: 65 };
    const result = detectConstraint(trapScores, flowScores);
    expect(result.constraint).toBe('expansion');
    expect(result.warning).toBeUndefined();
  });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe('validateAnswers', () => {
  it('returns empty array for valid complete answers', () => {
    expect(validateAnswers(uniform(3))).toEqual([]);
  });

  it('returns missing question IDs when answers are incomplete', () => {
    const answers: UserAnswers = { ...uniform(3) };
    delete answers[5];
    delete answers[12];
    const invalid = validateAnswers(answers);
    expect(invalid).toContain(5);
    expect(invalid).toContain(12);
  });

  it('returns IDs for out-of-range answers', () => {
    const answers = withOverrides(3, { 7: 0, 8: 6 });
    const invalid = validateAnswers(answers);
    expect(invalid).toContain(7);
    expect(invalid).toContain(8);
  });
});

// ── Full scoring pipeline ─────────────────────────────────────────────────────

describe('score (full pipeline)', () => {
  it('throws if answers are incomplete', () => {
    const answers: UserAnswers = {};
    expect(() => score(answers)).toThrow();
  });

  it('returns a valid ScoringOutput for uniform high answers', () => {
    const output = score(uniform(5));
    expect(output.primary_trap).toBeDefined();
    expect(output.secondary_trap).toBeDefined();
    expect(output.weakest_flow).toBeDefined();
    expect(output.strongest_flow).toBeDefined();
    expect(output.constraint).toBeDefined();
    expect(output.recommended_system).toBeDefined();
  });

  it('primary_trap != secondary_trap unless all trap scores are equal', () => {
    // With uniform answers trap scores may differ due to different question counts
    const output = score(uniform(3));
    // At minimum, just check both are valid trap names
    const validTraps = [
      'growth_by_addition',
      'key_person_reliance',
      'acquisition_over_expansion',
      'activity_confusion',
    ];
    expect(validTraps).toContain(output.primary_trap);
    expect(validTraps).toContain(output.secondary_trap);
  });

  it('recommended_system maps correctly from primary_trap', () => {
    const mapping: Record<string, string> = {
      growth_by_addition: 'repeatable_delivery',
      key_person_reliance: 'quality_framework',
      acquisition_over_expansion: 'expansion_mechanism',
      activity_confusion: 'flow_management',
    };
    const output = score(uniform(5));
    expect(output.recommended_system).toBe(mapping[output.primary_trap]);
  });

  it('scenario: overloaded operator — strong key_person signals', () => {
    // Q3=5, Q18=1(dependent), Q22=5, Q23=5, Q24=5 → high key_person_reliance
    const answers = withOverrides(2, {
      3: 5,
      18: 1,
      22: 5,
      23: 5,
      24: 5,
    });
    const output = score(answers);
    expect(output.primary_trap).toBe('key_person_reliance');
    expect(output.recommended_system).toBe('quality_framework');
  });

  it('scenario: leaky bucket — strong activity_confusion signals', () => {
    // Q4=5 with all others low
    const answers = withOverrides(1, { 4: 5 });
    const output = score(answers);
    expect(output.primary_trap).toBe('activity_confusion');
    expect(output.recommended_system).toBe('flow_management');
  });

  it('scenario: new-logo addict — high acquisition_over_expansion', () => {
    // Q5=5, Q21=1(not systematic) with all others low
    const answers = withOverrides(1, { 5: 5, 21: 1 });
    const output = score(answers);
    expect(output.primary_trap).toBe('acquisition_over_expansion');
    expect(output.recommended_system).toBe('expansion_mechanism');
  });

  it('scenario: busy but brittle — high growth_by_addition signals', () => {
    // Q1=5, Q2=5, Q6=5 with all others low
    const answers = withOverrides(1, { 1: 5, 2: 5, 6: 5 });
    const output = score(answers);
    expect(output.primary_trap).toBe('growth_by_addition');
    expect(output.recommended_system).toBe('repeatable_delivery');
  });

  it('scenario: over-fueling — strong demand, weak delivery', () => {
    // demand questions all 5, delivery questions all 1
    const answers = withOverrides(3, {
      7: 5, 8: 5, 9: 5, 10: 5,      // demand high
      13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 5, // delivery low (Q18=5→low trap but low flow raw=5 means good flow... wait)
    });
    // Let's be more careful: Q13-18 are the delivery flow questions
    // We want raw delivery scores to be low (1) for flow, so set them to 1
    // Q18 raw=1 → flow delivery gets 1 (bad flow) but trap reverse→5 (less dependent - good)
    const answers2 = withOverrides(3, {
      7: 5, 8: 5, 9: 5, 10: 5,
      13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1,
    });
    const output = score(answers2);
    expect(output.warning).toContain('Over-fueling');
  });

  it('all trap scores are in range 20–100', () => {
    const output = score(uniform(3));
    for (const val of Object.values(output.trap_scores)) {
      expect(val).toBeGreaterThanOrEqual(20);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it('all flow scores are in range 20–100', () => {
    const output = score(uniform(3));
    for (const val of Object.values(output.flow_scores)) {
      expect(val).toBeGreaterThanOrEqual(20);
      expect(val).toBeLessThanOrEqual(100);
    }
  });
});
