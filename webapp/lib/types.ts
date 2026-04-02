export type Trap =
  | 'growth_by_addition'
  | 'key_person_reliance'
  | 'acquisition_over_expansion'
  | 'activity_confusion';

export type Flow = 'demand' | 'sales' | 'delivery' | 'expansion';

export type Section =
  | 'symptoms'
  | 'demand'
  | 'sales'
  | 'delivery'
  | 'expansion'
  | 'leadership';

export type MissingSystem =
  | 'repeatable_delivery'
  | 'quality_framework'
  | 'expansion_mechanism'
  | 'flow_management';

export interface Question {
  id: number;
  text: string;
  section: Section;
  maps_to_trap?: Trap;
  maps_to_flow?: Flow;
  maps_to_system?: MissingSystem;
  weight: number;
  /**
   * If true, the raw answer is inverted (6 - answer) before trap aggregation.
   * Use when the question is worded positively but a high score indicates LOW trap severity.
   */
  reverse?: boolean;
}

export interface UserAnswers {
  /** question id → score (1–5) */
  [questionId: number]: number;
}

export type TrapScores = Record<Trap, number>;
export type FlowScores = Record<Flow, number>;

export interface ScoringOutput {
  trap_scores: TrapScores;
  flow_scores: FlowScores;
  primary_trap: Trap;
  secondary_trap: Trap;
  weakest_flow: Flow;
  strongest_flow: Flow;
  constraint: string;
  recommended_system: MissingSystem;
  /** Present when demand is strong but delivery is weak ("over-fueling" condition). */
  warning?: string;
}
