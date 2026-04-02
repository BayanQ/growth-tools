'use client';

import { useState, useEffect, useRef } from 'react';
import { QUESTIONS } from '@/lib/questions';
import { score } from '@/lib/scoring';
import { ScoringOutput, UserAnswers } from '@/lib/types';
import {
  TRAP_LABELS,
  FLOW_LABELS,
  SYSTEM_LABELS,
  TRAP_DESCRIPTIONS,
  SYSTEM_DESCRIPTIONS,
  THIRTY_DAY_ACTIONS,
  BUILD_FIRST_RECOMMENDATIONS,
  ARCHETYPE_BY_TRAP,
  ARCHETYPE_NAMES,
  buildExecutiveSummary,
} from '@/lib/content';
import { TrapBarChart } from '@/components/TrapBarChart';
import { FlowRadarChart } from '@/components/FlowRadarChart';

// ── Types ─────────────────────────────────────────────────────────────────

type AppState =
  | 'landing'
  | 'intake'
  | 'questions'
  | 'loading'
  | 'results'
  | 'lead_capture';

interface IntakeData {
  revenueRange: string;
  employeeRange: string;
  businessModel: string;
  growthGoal: string;
  leadershipStructure: string;
}

interface LeadData {
  name: string;
  email: string;
  company: string;
  role: string;
}

const SECTION_NAMES: Record<string, string> = {
  symptoms: 'Symptoms',
  demand: 'Demand',
  sales: 'Sales',
  delivery: 'Delivery',
  expansion: 'Expansion',
  leadership: 'Leadership',
};

const SECTIONS_ORDER = ['symptoms', 'demand', 'sales', 'delivery', 'expansion', 'leadership'];

// ── ProgressBar ───────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-brand-muted mb-2">
        <span>Question {current} of {total}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-brand-border">
        <div
          className="h-1.5 rounded-full bg-brand-accent transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Landing ───────────────────────────────────────────────────────────────

function Landing({ onStart, onSampleReport }: { onStart: () => void; onSampleReport: () => void }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col">
      <nav className="px-6 py-5 max-w-5xl mx-auto w-full flex items-center justify-between">
        <span className="text-brand-accent font-bold text-lg tracking-tight">GrowthSpan</span>
        <button
          onClick={onStart}
          className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors"
        >
          Start Diagnostic →
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center rounded-full border border-brand-accent/30 bg-brand-accent/10 px-4 py-1.5 text-sm font-medium text-brand-accent mb-8">
          Free Operator Diagnostic
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
          Growth Engine
          <br />
          <span className="text-brand-accent">Diagnostic</span>
        </h1>

        <p className="text-lg sm:text-xl text-brand-muted mb-4 max-w-xl">
          Find the growth traps slowing your business — and the systems you need to build first.
        </p>

        <p className="text-sm text-brand-subtle mb-12 max-w-lg leading-relaxed">
          Growth problems are usually system problems. More leads, hires, or spend don't fix a weak engine.
          This tool helps you find the constraint before you add more fuel.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs sm:max-w-sm mx-auto">
          <button
            onClick={onStart}
            className="btn-primary text-base w-full sm:w-auto"
          >
            Start Diagnostic
          </button>
          <button
            onClick={onSampleReport}
            className="btn-secondary text-base w-full sm:w-auto"
          >
            See Sample Report
          </button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto text-center border-t border-brand-border pt-10">
          <div>
            <div className="text-2xl font-bold text-brand-text">24</div>
            <div className="text-xs text-brand-subtle mt-1">Questions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-text">6–8 min</div>
            <div className="text-xs text-brand-subtle mt-1">Completion time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-text">Free</div>
            <div className="text-xs text-brand-subtle mt-1">No signup needed</div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-brand-subtle max-w-5xl mx-auto w-full">
        No personal information required to complete the diagnostic. Lead capture is optional, for your PDF report only.
      </footer>
    </div>
  );
}

// ── Intake ────────────────────────────────────────────────────────────────

function IntakeForm({ onSubmit }: { onSubmit: (data: IntakeData) => void }) {
  const [form, setForm] = useState<IntakeData>({
    revenueRange: '',
    employeeRange: '',
    businessModel: '',
    growthGoal: '',
    leadershipStructure: '',
  });

  const isValid = form.revenueRange && form.employeeRange && form.businessModel;

  function set(key: keyof IntakeData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="bg-brand-surface border-b border-brand-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-brand-accent font-bold">GrowthSpan</span>
          <span className="text-brand-subtle">›</span>
          <span className="text-brand-muted text-sm">Context</span>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 max-w-2xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-brand-text mb-2">A bit of context first</h2>
        <p className="text-brand-muted mb-8 text-sm">
          No personal information. These inputs calibrate your results — the more accurate, the more useful.
        </p>

        <div className="space-y-8">
          {/* Revenue Range */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-3">
              Annual revenue range <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Under $1M', '$1M – $3M', '$3M – $10M', '$10M – $25M', '$25M – $50M', '$50M – $100M', '$100M+'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => set('revenueRange', opt)}
                  className={`option-btn ${form.revenueRange === opt ? 'option-btn-active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Employee Range */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-3">
              Team size <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {['1–5', '6–10', '11–25', '26–50', '51–100', '101–200', '201–300', '300+'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => set('employeeRange', opt)}
                  className={`option-btn text-center ${form.employeeRange === opt ? 'option-btn-active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Business Model */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-3">
              Business model <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Services (agency, consulting, professional services)',
                'SaaS / software',
                'Tech-enabled services',
                'Marketplace / platform',
                'E-commerce / DTC',
                'Manufacturing / CPG',
                'Industrial / hardware',
                'Healthcare / clinics / providers',
                'Other',
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => set('businessModel', opt)}
                  className={`option-btn ${form.businessModel === opt ? 'option-btn-active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Growth Goal (optional) */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1">
              Primary growth goal <span className="text-brand-subtle font-normal">(optional)</span>
            </label>
            <p className="text-xs text-brand-subtle mb-3">Skip if none apply strongly right now.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Increase new customer acquisition',
                'Improve conversion (sales effectiveness)',
                'Improve delivery capacity / margins',
                'Increase expansion (upsell, retention)',
                'Reduce founder dependency',
                'Prepare for exit / scale',
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => set('growthGoal', form.growthGoal === opt ? '' : opt)}
                  className={`option-btn ${form.growthGoal === opt ? 'option-btn-active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Leadership Structure (optional) */}
          <div>
            <label className="block text-sm font-semibold text-brand-text mb-1">
              Leadership structure <span className="text-brand-subtle font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Founder-led (founder in day-to-day decisions)',
                'Operator-led (team runs day-to-day)',
                'Mixed',
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => set('leadershipStructure', form.leadershipStructure === opt ? '' : opt)}
                  className={`option-btn ${form.leadershipStructure === opt ? 'option-btn-active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button
            onClick={() => isValid && onSubmit(form)}
            disabled={!isValid}
            className="btn-primary w-full sm:w-auto"
          >
            Start Diagnostic →
          </button>
          {!isValid && (
            <p className="text-xs text-brand-subtle mt-2">
              Please select revenue range, team size, and business model to continue.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Question Flow ─────────────────────────────────────────────────────────

function QuestionFlow({
  answers,
  onAnswer,
  onComplete,
}: {
  answers: UserAnswers;
  onAnswer: (id: number, value: number) => void;
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [advancing, setAdvancing] = useState(false);
  const question = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const currentAnswer = answers[question.id];
  const isLast = currentIndex === total - 1;

  const currentSection = question.section;
  const sectionLabel = SECTION_NAMES[currentSection] ?? currentSection;

  function handleSelect(value: number) {
    if (advancing) return;
    onAnswer(question.id, value);
    setAdvancing(true);
    setTimeout(() => {
      setAdvancing(false);
      if (currentIndex < total - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onComplete();
      }
    }, 400);
  }

  function handlePrev() {
    if (currentIndex > 0) {
      setAdvancing(false);
      setCurrentIndex((i) => i - 1);
    }
  }

  const scaleLabels = ['Strongly disagree', 'Disagree', 'Neutral / mixed', 'Agree', 'Strongly agree'];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <header className="bg-brand-surface border-b border-brand-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-accent font-bold">GrowthSpan</span>
            <span className="text-brand-subtle">›</span>
            <span className="text-brand-muted text-sm">Diagnostic</span>
          </div>
          <span className="text-xs text-brand-subtle">{answeredCount}/{total} answered</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-6">
        {/* Content block — my-auto centres it vertically on desktop */}
        <div className="my-auto w-full max-w-xl">
          <ProgressBar current={currentIndex + 1} total={total} />

          {/* Section label */}
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-muted uppercase tracking-wide">
              Section {SECTIONS_ORDER.indexOf(currentSection) + 1} of {SECTIONS_ORDER.length} — {sectionLabel}
            </span>
          </div>

          {/* Question card — natural height, no flex-1 stretch */}
          <div className="card">
            <p className="text-base sm:text-lg font-semibold text-brand-text leading-relaxed mb-6">
              {question.text}
            </p>

            {/* Scale */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xs text-brand-subtle px-1 mb-1">
                <span>Strongly disagree</span>
                <span>Strongly agree</span>
              </div>
              <div className="flex justify-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleSelect(v)}
                    disabled={advancing}
                    className={`scale-btn ${
                      currentAnswer === v ? 'scale-btn-active' : 'scale-btn-inactive'
                    } ${advancing ? 'cursor-not-allowed' : ''}`}
                    title={scaleLabels[v - 1]}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className={`text-center text-sm text-brand-muted mt-1 transition-opacity ${currentAnswer ? 'opacity-100' : 'opacity-0'}`}>
                {currentAnswer ? scaleLabels[currentAnswer - 1] : '—'}
              </p>
            </div>

            {/* Navigation — Previous left, status indicator right */}
            <div className="flex justify-between items-center pt-4 border-t border-brand-border">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="text-sm text-brand-muted hover:text-brand-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              <p className={`text-xs text-brand-subtle transition-opacity ${advancing ? 'opacity-100' : 'opacity-0'}`}>
                {isLast ? 'Calculating results…' : 'Next question…'}
              </p>
            </div>
          </div>

          {/* Section navigation dots */}
          <div className="flex justify-center gap-2 mt-5">
            {SECTIONS_ORDER.map((sec) => {
              const secQuestions = QUESTIONS.filter((q) => q.section === sec);
              const secAnswered = secQuestions.filter((q) => answers[q.id]).length;
              const isActive = sec === currentSection;
              const isComplete = secAnswered === secQuestions.length;
              return (
                <div
                  key={sec}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive
                      ? 'w-8 bg-brand-accent'
                      : isComplete
                      ? 'w-4 bg-brand-accent/40'
                      : 'w-4 bg-brand-border'
                  }`}
                title={SECTION_NAMES[sec]}
              />
            );
          })}
          </div>
        </div>{/* end my-auto wrapper */}
      </main>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center px-6">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-border border-t-brand-accent mb-6" />
      <h2 className="text-xl font-bold text-brand-text mb-2">Analyzing your responses...</h2>
      <p className="text-brand-muted text-sm max-w-xs">
        Scoring your growth engine, identifying traps, and mapping your constraint.
      </p>
    </div>
  );
}

// ── Results Page ─────────────────────────────────────────────────────────

function ResultsPage({
  output,
  intake,
  onLeadCapture,
  leadSubmitted,
}: {
  output: ScoringOutput;
  intake: IntakeData;
  onLeadCapture: () => void;
  leadSubmitted: boolean;
}) {
  const {
    trap_scores,
    flow_scores,
    primary_trap,
    secondary_trap,
    weakest_flow,
    strongest_flow,
    constraint,
    recommended_system,
    warning,
  } = output;

  const archetype = ARCHETYPE_BY_TRAP[primary_trap];
  const archetypeName = ARCHETYPE_NAMES[archetype];
  const summary = buildExecutiveSummary(output);
  const recommendation = BUILD_FIRST_RECOMMENDATIONS[recommended_system];
  const actions = THIRTY_DAY_ACTIONS[recommended_system];

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <header className="bg-brand-surface border-b border-brand-border px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-brand-accent font-bold">GrowthSpan</span>
            <span className="text-brand-subtle">›</span>
            <span className="text-brand-muted text-sm">Your Results</span>
          </div>
          {leadSubmitted ? (
            <a
              href="#"
              onClick={async (e) => {
                e.preventDefault();
                const res = await fetch('/api/report', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ output }),
                });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'growth-engine-diagnostic.pdf';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn-primary text-sm py-2"
            >
              Download PDF Report
            </a>
          ) : (
            <button onClick={onLeadCapture} className="btn-primary text-sm py-2">
              Download PDF Report
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Archetype + Summary */}
        <div className="card border-brand-accent/30 bg-[#eef0ff]">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand-accent uppercase tracking-wide mb-1">
                Your Growth Profile
              </p>
              <h2 className="text-2xl font-bold text-brand-text mb-3">{archetypeName}</h2>
              <p
                className="text-brand-muted leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: summary.replace(/\*\*(.+?)\*\*/g, '<strong class="text-brand-text">$1</strong>'),
                }}
              />
            </div>
          </div>
        </div>

        {/* Over-fueling warning */}
        {warning && (
          <div className="card border-yellow-500/30 bg-yellow-500/5">
            <div className="flex gap-3">
              <span className="text-yellow-600 text-lg">⚠</span>
              <div>
                <p className="text-sm font-semibold text-yellow-700 mb-1">Over-fueling warning</p>
                <p className="text-sm text-brand-muted">{warning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Trap Scores */}
        <div className="card">
          <h3 className="text-lg font-bold text-brand-text mb-1">Growth Trap Profile</h3>
          <p className="text-sm text-brand-muted mb-6">
            Higher score = more evidence of that trap in your business.
          </p>
          <TrapBarChart trapScores={trap_scores} primaryTrap={primary_trap} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-0.5">Primary Trap</p>
              <p className="font-semibold text-brand-text">{TRAP_LABELS[primary_trap]}</p>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed line-clamp-2">{TRAP_DESCRIPTIONS[primary_trap].split('.')[0]}.</p>
            </div>
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-0.5">Secondary Trap</p>
              <p className="font-semibold text-brand-text">{TRAP_LABELS[secondary_trap]}</p>
            </div>
          </div>
        </div>

        {/* Flow Health */}
        <div className="card">
          <h3 className="text-lg font-bold text-brand-text mb-1">Flow Health Map</h3>
          <p className="text-sm text-brand-muted mb-6">
            Higher score = healthier, more systematic engine in that area. Lower score = bigger gap.
          </p>
          <FlowRadarChart flowScores={flow_scores} weakestFlow={weakest_flow} />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['demand', 'sales', 'delivery', 'expansion'] as const).map((flow) => (
              <div
                key={flow}
                className={`rounded-lg border p-3 text-center ${
                  flow === weakest_flow
                    ? 'border-red-500/20 bg-red-500/5'
                    : flow === strongest_flow
                    ? 'border-brand-accent/20 bg-brand-accent/5'
                    : 'border-brand-border bg-brand-bg'
                }`}
              >
                <p className="text-xs text-brand-subtle mb-1">{FLOW_LABELS[flow]}</p>
                <p className={`text-xl font-bold ${
                  flow === weakest_flow ? 'text-red-600' : flow === strongest_flow ? 'text-brand-accent' : 'text-brand-muted'
                }`}>
                  {flow_scores[flow]}
                </p>
                {flow === weakest_flow && <p className="text-xs text-red-600 mt-0.5">Weakest</p>}
                {flow === strongest_flow && <p className="text-xs text-brand-accent mt-0.5">Strongest</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Constraint + Recommendation */}
        <div className="card border-l-4 border-l-brand-accent">
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-wide mb-2">
            Build First
          </p>
          <h3 className="text-xl font-bold text-brand-text mb-2">{recommendation.title}</h3>
          <p className="text-sm text-brand-muted mb-4">
            {SYSTEM_DESCRIPTIONS[recommended_system]}
          </p>
          <ul className="space-y-1.5 mb-6">
            {recommendation.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-brand-muted">
                <span className="mt-0.5 text-brand-accent flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
              <p className="font-semibold text-brand-text mb-1">Stabilize next</p>
              <p className="text-brand-subtle text-xs leading-relaxed">{recommendation.stabilize}</p>
            </div>
            <div className="rounded-lg border border-brand-border bg-brand-bg p-3">
              <p className="font-semibold text-brand-text mb-1">Add fuel later</p>
              <p className="text-brand-subtle text-xs leading-relaxed">{recommendation.addFuel}</p>
            </div>
          </div>
        </div>

        {/* 30-Day Actions */}
        <div className="card">
          <h3 className="text-lg font-bold text-brand-text mb-1">Your 30-Day Priority Actions</h3>
          <p className="text-sm text-brand-muted mb-5">
            Concrete moves to start building your {SYSTEM_LABELS[recommended_system].toLowerCase()}.
          </p>
          <ol className="space-y-3">
            {actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-accent/15 text-brand-accent text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-brand-muted leading-relaxed">{action}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Book a Call CTA */}
        <div className="card border-brand-accent/20 text-center bg-[#eef0ff]">
          <h3 className="text-xl font-bold text-brand-text mb-2">Book a Growth Engine Review</h3>
          <p className="text-brand-muted text-sm mb-6 max-w-md mx-auto">
            We&apos;ll walk through your results, identify the real constraint, and show you what system to build first.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#"
              className="btn-primary px-8"
            >
              Book a Call
            </a>
            <button
              onClick={leadSubmitted ? undefined : onLeadCapture}
              className="btn-secondary px-8"
            >
              Download PDF Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Lead Capture Gate ─────────────────────────────────────────────────────

function LeadCaptureGate({
  onSubmit,
  onSkip,
}: {
  onSubmit: (data: LeadData) => void;
  onSkip: () => void;
}) {
  const [form, setForm] = useState<LeadData>({ name: '', email: '', company: '', role: '' });
  const isValid = form.name.trim() && form.email.trim() && form.email.includes('@') && form.company.trim();

  function set(key: keyof LeadData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-brand-accent text-xl">📄</span>
            </div>
            <h2 className="text-xl font-bold text-brand-text mb-1">Get your full PDF report</h2>
            <p className="text-sm text-brand-muted">
              Your personalized Growth Engine Diagnostic report includes your full breakdown, recommendations, and 30-day action plan.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-subtle focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Work email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane@company.com"
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-subtle focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Company <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Inc."
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-subtle focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1">
                Role <span className="text-brand-subtle font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="CEO, COO, VP Operations..."
                className="w-full rounded-lg border border-brand-border bg-brand-bg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-subtle focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => isValid && onSubmit(form)}
              disabled={!isValid}
              className="btn-primary w-full disabled:opacity-40"
            >
              Send me the PDF report
            </button>
            <button
              onClick={onSkip}
              className="w-full text-sm text-brand-subtle hover:text-brand-muted transition-colors py-2"
            >
              Skip — view results without PDF
            </button>
          </div>

          <p className="text-xs text-brand-subtle text-center mt-4">
            No spam. We&apos;ll only send you your report and one follow-up about the diagnostic.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sample Report data ─────────────────────────────────────────────────────

function buildSampleOutput(): ScoringOutput {
  const sampleAnswers: UserAnswers = {
    1: 4, 2: 4, 3: 3, 4: 4, 5: 3, 6: 3,
    7: 3, 8: 3, 9: 3, 10: 3,
    11: 2, 12: 2, 13: 2, 14: 2,
    15: 2, 16: 2, 17: 2, 18: 3,
    19: 3, 20: 3, 21: 3,
    22: 4, 23: 4, 24: 3,
  };
  return score(sampleAnswers);
}

const SAMPLE_INTAKE: IntakeData = {
  revenueRange: '$3M – $10M',
  employeeRange: '11–25',
  businessModel: 'Services (agency, consulting, professional services)',
  growthGoal: 'Improve delivery capacity / margins',
  leadershipStructure: 'Founder-led (founder in day-to-day decisions)',
};

// ── App Root ──────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const answersRef = useRef<UserAnswers>({});
  const [output, setOutput] = useState<ScoringOutput | null>(null);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  function handleIntakeSubmit(data: IntakeData) {
    setIntake(data);
    setState('questions');
  }

  function handleAnswer(id: number, value: number) {
    answersRef.current = { ...answersRef.current, [id]: value };
    setAnswers(answersRef.current);
  }

  function handleQuestionsComplete() {
    setState('loading');
    setTimeout(() => {
      const result = score(answersRef.current);
      setOutput(result);
      setState('results');
    }, 1800);
  }

  async function handleLeadSubmit(data: LeadData) {
    setLeadSubmitted(true);
    setState('results');

    // Fire-and-forget: send report email + generate PDF
    if (output) {
      fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output, lead: data }),
      }).catch(console.error);
    }
  }

  function handleSampleReport() {
    const sampleOutput = buildSampleOutput();
    setOutput(sampleOutput);
    setIntake(SAMPLE_INTAKE);
    setState('results');
  }

  if (state === 'landing') {
    return <Landing onStart={() => setState('intake')} onSampleReport={handleSampleReport} />;
  }

  if (state === 'intake') {
    return <IntakeForm onSubmit={handleIntakeSubmit} />;
  }

  if (state === 'questions') {
    return (
      <QuestionFlow
        answers={answers}
        onAnswer={handleAnswer}
        onComplete={handleQuestionsComplete}
      />
    );
  }

  if (state === 'loading') {
    return <LoadingScreen />;
  }

  if (state === 'results' && output && intake) {
    return (
      <ResultsPage
        output={output}
        intake={intake}
        onLeadCapture={() => setState('lead_capture')}
        leadSubmitted={leadSubmitted}
      />
    );
  }

  if (state === 'lead_capture') {
    return (
      <LeadCaptureGate
        onSubmit={handleLeadSubmit}
        onSkip={() => setState('results')}
      />
    );
  }

  return null;
}
