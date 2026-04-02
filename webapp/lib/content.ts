import { Trap, Flow, MissingSystem, ScoringOutput } from './types';

// ── Display Labels ────────────────────────────────────────────────────────

export const TRAP_LABELS: Record<Trap, string> = {
  growth_by_addition: 'Growth by Addition',
  key_person_reliance: 'Key Person Reliance',
  acquisition_over_expansion: 'Acquisition over Expansion',
  activity_confusion: 'Activity ≠ Throughput',
};

export const FLOW_LABELS: Record<Flow, string> = {
  demand: 'Demand',
  sales: 'Sales',
  delivery: 'Delivery',
  expansion: 'Expansion',
};

export const SYSTEM_LABELS: Record<MissingSystem, string> = {
  repeatable_delivery: 'Repeatable Delivery',
  quality_framework: 'Quality Framework',
  expansion_mechanism: 'Expansion Mechanism',
  flow_management: 'Flow Management',
};

// ── Archetype Copy ────────────────────────────────────────────────────────

export type Archetype =
  | 'overloaded_operator'
  | 'busy_but_brittle'
  | 'leaky_bucket'
  | 'new_logo_addict';

export const ARCHETYPE_BY_TRAP: Record<Trap, Archetype> = {
  key_person_reliance: 'overloaded_operator',
  growth_by_addition: 'busy_but_brittle',
  activity_confusion: 'leaky_bucket',
  acquisition_over_expansion: 'new_logo_addict',
};

export const ARCHETYPE_NAMES: Record<Archetype, string> = {
  overloaded_operator: 'The Overloaded Operator',
  busy_but_brittle: 'The Busy but Brittle Firm',
  leaky_bucket: 'The Leaky Bucket',
  new_logo_addict: 'The New-Logo Addict',
};

// ── Trap Descriptions ─────────────────────────────────────────────────────

export const TRAP_DESCRIPTIONS: Record<Trap, string> = {
  growth_by_addition:
    'Your business grows by adding — more people, more tools, more effort — but without a repeatable system underneath. Each new client or hire increases complexity faster than it increases capacity. The engine is scaling stress, not output.',
  key_person_reliance:
    'Critical decisions, quality, and knowledge live in a small number of people. When those people are pulled in too many directions, everything slows. The business is only as strong as its most stretched individual.',
  acquisition_over_expansion:
    'Energy and resources flow toward winning new clients rather than growing existing ones. The result is a leaky bucket — you fill it faster than it drains, but the holes stay open. Retention, upsell, and expansion are underdeveloped.',
  activity_confusion:
    'The team is busy, but throughput is unclear. Effort and output are disconnected. It is hard to tell which work moves the business forward and which is just motion. Flow bottlenecks go undetected until they become crises.',
};

// ── System Descriptions ───────────────────────────────────────────────────

export const SYSTEM_DESCRIPTIONS: Record<MissingSystem, string> = {
  repeatable_delivery:
    'A defined delivery process that produces consistent results without depending on heroics. Includes documented stages, SOPs, QA checkpoints, and scoped handoff rules.',
  quality_framework:
    'Clear decision rights, approval thresholds, a quality review framework, and a management cadence that distributes quality control instead of concentrating it.',
  expansion_mechanism:
    'A systematic approach to growing existing client relationships — account review rhythm, client success ownership, trigger-based expansion plays, and post-delivery value reviews.',
  flow_management:
    'Visibility into where work is, where it is stuck, and what is creating drag. Includes stage definitions, WIP limits, throughput metrics, and a bottleneck review cadence.',
};

// ── 30-Day Actions ────────────────────────────────────────────────────────

export const THIRTY_DAY_ACTIONS: Record<MissingSystem, string[]> = {
  repeatable_delivery: [
    'Map your current delivery stages — even a rough draft reveals gaps.',
    'Document the top three SOPs your team relies on most but has never written down.',
    'Define one QA checkpoint that happens before every client handoff.',
    'Identify the most common scoping problem and write a rule to prevent it.',
    'Run one retrospective with your delivery team focused on what slowed you down last month.',
  ],
  quality_framework: [
    'List the five decisions that most commonly wait on one person.',
    'Write one approval threshold: at what point does a decision escalate vs. get made by the team?',
    'Identify three pieces of knowledge that only one person holds — begin documenting them.',
    'Set a weekly review cadence for quality: who attends, what gets reviewed, what decisions get made.',
    'Define what "good" looks like for your most important deliverable or service.',
  ],
  expansion_mechanism: [
    'List every active client and flag which ones have not been reviewed for growth in 90+ days.',
    'Assign explicit ownership of client growth for each account.',
    'Define one expansion trigger — what event or signal prompts an upsell conversation?',
    'Build a simple account review template: health, current spend, growth potential, next action.',
    'Schedule one client check-in per week focused on their outcomes, not project status.',
  ],
  flow_management: [
    'Map your current workflow stages — where does work go in, where does it come out?',
    'Identify the one stage where work piles up most often.',
    'Set one WIP limit: no more than X items in progress at once for one critical stage.',
    'Create a weekly throughput review: how many items entered, how many exited, what is stuck?',
    'Define one leading metric that predicts delivery problems before they happen.',
  ],
};

// ── Executive Summary Builder ─────────────────────────────────────────────

export function buildExecutiveSummary(output: ScoringOutput): string {
  const { primary_trap, secondary_trap, constraint, weakest_flow } = output;
  const primaryLabel = TRAP_LABELS[primary_trap];
  const secondaryLabel = TRAP_LABELS[secondary_trap];
  const flowLabel = FLOW_LABELS[weakest_flow];

  const constraintDesc = CONSTRAINT_DESCRIPTIONS[constraint] ?? weakest_flow;

  return `Your business is primarily showing signs of **${primaryLabel}**, with a secondary pattern of **${secondaryLabel}**. The biggest constraint appears in your **${flowLabel}** engine, where ${constraintDesc}. Your highest-value next move is to build a stronger foundation here before adding more fuel.`;
}

const CONSTRAINT_DESCRIPTIONS: Record<string, string> = {
  delivery:
    'work depends too heavily on people and effort instead of a repeatable system',
  decision_quality_layer:
    'too many decisions and quality controls depend on a small number of individuals',
  expansion_system:
    'existing client relationships are not being systematically grown',
  demand:
    'lead generation is inconsistent or poorly qualified',
  sales:
    'the pipeline lacks consistent process and handoff structure',
  expansion:
    'expansion and upsell activity is ad hoc rather than systematic',
};

// ── Build-First Recommendations ────────────────────────────────────────────

export const BUILD_FIRST_RECOMMENDATIONS: Record<MissingSystem, {
  title: string;
  items: string[];
  stabilize: string;
  addFuel: string;
}> = {
  repeatable_delivery: {
    title: 'Repeatable Delivery System',
    items: [
      'Standard delivery stages with entry/exit criteria',
      'Documented SOPs for your most common service type',
      'QA checkpoints before client handoffs',
      'Scoped handoff rules between sales and delivery',
    ],
    stabilize: 'Once delivery is systematized, stabilize quality by distributing review and approval authority.',
    addFuel: 'When delivery runs without heroics, invest in demand generation and sales acceleration.',
  },
  quality_framework: {
    title: 'Quality & Decision Framework',
    items: [
      'Clear decision rights — who decides what, at what threshold',
      'Approval levels that empower the team without removing oversight',
      'Quality review framework for your most critical outputs',
      'Management cadence that surfaces problems early',
    ],
    stabilize: 'After distributing decision-making, stabilize delivery processes so the team can act on them consistently.',
    addFuel: 'Once the team operates independently, growth without founder bottleneck becomes possible.',
  },
  expansion_mechanism: {
    title: 'Expansion Mechanism',
    items: [
      'Account review rhythm (monthly or quarterly per client tier)',
      'Clear ownership of client growth for each account',
      'Trigger-based expansion plays linked to client milestones',
      'Post-delivery value review conversation',
    ],
    stabilize: 'After installing expansion motions, strengthen delivery capacity to support the growth from existing clients.',
    addFuel: 'Once retention and expansion are systematic, new client acquisition compounds instead of replacing lost revenue.',
  },
  flow_management: {
    title: 'Flow Management System',
    items: [
      'Stage definitions across your core workflow',
      'WIP limits to surface bottlenecks before they become crises',
      'Throughput metrics that show what is moving vs. stuck',
      'Weekly bottleneck review cadence',
    ],
    stabilize: 'After achieving flow visibility, stabilize delivery processes that are currently causing the most drag.',
    addFuel: 'Once throughput is visible and managed, adding volume does not add hidden chaos.',
  },
};
