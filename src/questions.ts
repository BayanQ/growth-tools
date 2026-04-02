import { Question } from './types';

/**
 * Full 24-question diagnostic schema.
 *
 * Response scale: 1 (Strongly disagree) – 5 (Strongly agree)
 *
 * Trap questions are phrased so that agreeing indicates the trap UNLESS
 * `reverse: true`, in which case agreeing indicates the ABSENCE of the trap
 * (the score is inverted before trap aggregation).
 *
 * Flow questions (Q7–Q21) are positively framed: higher score = healthier flow.
 *
 * Trap → question mapping (from spec):
 *   growth_by_addition          → Q1, Q2, Q6
 *   key_person_reliance         → Q3, Q18(reversed), Q22, Q23, Q24
 *   acquisition_over_expansion  → Q5
 *   activity_confusion          → Q4
 *
 * Flow scoring ranges (questions may appear in multiple flows):
 *   demand   → Q7–Q10
 *   sales    → Q10–Q14
 *   delivery → Q13–Q18
 *   expansion → Q19–Q21
 */
export const QUESTIONS: Question[] = [
  // ── Section 1: Symptoms (Q1–Q6) ───────────────────────────────────────────
  {
    id: 1,
    text: 'Revenue growth has made our operations feel more complex than controlled.',
    section: 'symptoms',
    maps_to_trap: 'growth_by_addition',
    maps_to_flow: 'delivery',
    maps_to_system: 'repeatable_delivery',
    weight: 1,
  },
  {
    id: 2,
    text: 'Adding new clients increases stress more than confidence.',
    section: 'symptoms',
    maps_to_trap: 'growth_by_addition',
    maps_to_flow: 'delivery',
    maps_to_system: 'repeatable_delivery',
    weight: 1,
  },
  {
    id: 3,
    text: 'A small number of people are involved in too many decisions or fixes.',
    section: 'symptoms',
    maps_to_trap: 'key_person_reliance',
    maps_to_flow: 'delivery',
    maps_to_system: 'quality_framework',
    weight: 1,
  },
  {
    id: 4,
    text: "Our teams are busy, but it's unclear what work is actually moving the business forward.",
    section: 'symptoms',
    maps_to_trap: 'activity_confusion',
    maps_to_flow: 'delivery',
    maps_to_system: 'flow_management',
    weight: 1,
  },
  {
    id: 5,
    text: 'We focus more on winning new clients than growing existing ones.',
    section: 'symptoms',
    maps_to_trap: 'acquisition_over_expansion',
    maps_to_flow: 'expansion',
    maps_to_system: 'expansion_mechanism',
    weight: 1,
  },
  {
    id: 6,
    text: 'Hiring increases coordination overhead more than output.',
    section: 'symptoms',
    maps_to_trap: 'growth_by_addition',
    maps_to_flow: 'delivery',
    maps_to_system: 'repeatable_delivery',
    weight: 1,
  },

  // ── Section 2: Demand (Q7–Q10) ────────────────────────────────────────────
  {
    id: 7,
    text: 'We have a clearly defined ideal customer profile.',
    section: 'demand',
    maps_to_flow: 'demand',
    weight: 1,
  },
  {
    id: 8,
    text: 'Our lead sources are predictable and repeatable.',
    section: 'demand',
    maps_to_flow: 'demand',
    weight: 1,
  },
  {
    id: 9,
    text: 'Our lead quality is consistently high (not just volume).',
    section: 'demand',
    maps_to_flow: 'demand',
    weight: 1,
  },
  {
    id: 10,
    text: 'Sales receives well-qualified opportunities.',
    section: 'demand',
    maps_to_flow: 'demand',
    weight: 1,
  },

  // ── Section 3: Sales (Q11–Q14) ────────────────────────────────────────────
  {
    id: 11,
    text: 'Our pipeline stages are clearly defined and consistently used.',
    section: 'sales',
    maps_to_flow: 'sales',
    weight: 1,
  },
  {
    id: 12,
    text: 'Our proposals are consistent in scope, pricing, and expectations.',
    section: 'sales',
    maps_to_flow: 'sales',
    weight: 1,
  },
  {
    id: 13,
    text: 'Our sales-to-delivery handoff is structured and reliable.',
    section: 'sales',
    maps_to_flow: 'sales',
    weight: 1,
  },
  {
    id: 14,
    text: 'Closed deals rarely create unexpected delivery issues.',
    section: 'sales',
    maps_to_flow: 'sales',
    weight: 1,
  },

  // ── Section 4: Delivery (Q15–Q18) ─────────────────────────────────────────
  {
    id: 15,
    text: 'Core delivery work follows a defined and documented process.',
    section: 'delivery',
    maps_to_flow: 'delivery',
    maps_to_system: 'repeatable_delivery',
    weight: 1,
  },
  {
    id: 16,
    text: 'Quality standards are clearly defined and consistently applied.',
    section: 'delivery',
    maps_to_flow: 'delivery',
    maps_to_system: 'quality_framework',
    weight: 1,
  },
  {
    id: 17,
    text: 'We can clearly see capacity, workload, and margin risk early.',
    section: 'delivery',
    maps_to_flow: 'delivery',
    maps_to_system: 'flow_management',
    weight: 1,
  },
  {
    id: 18,
    // Positively framed: agreement = LOW key_person_reliance → reversed for trap scoring
    text: 'Delivery performance is not dependent on specific individuals.',
    section: 'delivery',
    maps_to_trap: 'key_person_reliance',
    maps_to_flow: 'delivery',
    maps_to_system: 'quality_framework',
    weight: 1,
    reverse: true,
  },

  // ── Section 5: Expansion (Q19–Q21) ────────────────────────────────────────
  {
    id: 19,
    text: 'We regularly review existing clients for growth opportunities.',
    section: 'expansion',
    maps_to_flow: 'expansion',
    maps_to_system: 'expansion_mechanism',
    weight: 1,
  },
  {
    id: 20,
    text: 'Ownership of client growth is clearly defined.',
    section: 'expansion',
    maps_to_flow: 'expansion',
    maps_to_system: 'expansion_mechanism',
    weight: 1,
  },
  {
    id: 21,
    text: 'Expansion (upsell/cross-sell) is systematic rather than ad hoc.',
    section: 'expansion',
    maps_to_trap: 'acquisition_over_expansion',
    maps_to_flow: 'expansion',
    maps_to_system: 'expansion_mechanism',
    weight: 1,
    // Q21: agree = systematic expansion = LESS of the acquisition_over_expansion trap → reversed
    reverse: true,
  },

  // ── Section 6: Leadership Dependency (Q22–Q24) ────────────────────────────
  {
    id: 22,
    text: 'Key decisions frequently wait on one person.',
    section: 'leadership',
    maps_to_trap: 'key_person_reliance',
    maps_to_system: 'quality_framework',
    weight: 1,
  },
  {
    id: 23,
    text: "Important knowledge or quality control lives primarily in people's heads.",
    section: 'leadership',
    maps_to_trap: 'key_person_reliance',
    maps_to_system: 'quality_framework',
    weight: 1,
  },
  {
    id: 24,
    text: 'The business would slow materially if one leader stepped away.',
    section: 'leadership',
    maps_to_trap: 'key_person_reliance',
    maps_to_system: 'quality_framework',
    weight: 1,
  },
];

/**
 * Flow scoring question ranges (per spec).
 * Questions may appear in multiple flows.
 * Flow scores reflect HEALTH (higher = better).
 */
export const FLOW_QUESTION_IDS: Record<string, number[]> = {
  demand: [7, 8, 9, 10],
  sales: [10, 11, 12, 13, 14],
  delivery: [13, 14, 15, 16, 17, 18],
  expansion: [19, 20, 21],
};
