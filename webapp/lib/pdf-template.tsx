import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ScoringOutput } from './types';
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
} from './content';

// ── Styles ────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
    paddingBottom: 14,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  headerBadge: {
    fontSize: 9,
    color: '#1e40af',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#1e40af',
    paddingLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 8,
    paddingLeft: 11,
  },

  // Summary card
  summaryCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryArchetype: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
  },

  // Warning card
  warningCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    flexDirection: 'row',
    gap: 6,
  },
  warningTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 2,
  },
  warningText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.4,
  },

  // Trap bars
  trapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  trapLabel: {
    width: 150,
    fontSize: 9,
    color: '#374151',
  },
  trapBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trapBarFill: {
    height: 10,
    borderRadius: 4,
  },
  trapScore: {
    width: 36,
    fontSize: 9,
    textAlign: 'right',
    color: '#6b7280',
  },

  // Flow scores
  flowGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  flowBox: {
    flex: 1,
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  flowBoxLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  flowBoxScore: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  flowBoxTag: {
    fontSize: 7,
    marginTop: 2,
    fontFamily: 'Helvetica-Bold',
  },

  // Recommendation
  recCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#1e40af',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  recLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  recTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 5,
  },
  recDesc: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  recItem: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 3,
  },
  recCheck: {
    fontSize: 9,
    color: '#1e40af',
    width: 10,
  },
  recItemText: {
    fontSize: 9,
    color: '#374151',
    flex: 1,
  },

  // Phase boxes
  phaseRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  phaseBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
  },
  phaseTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 3,
  },
  phaseText: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.4,
  },

  // 30-day actions
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 5,
    alignItems: 'flex-start',
  },
  actionNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNumText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
  },
  actionText: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
    paddingTop: 2,
  },

  // CTA
  ctaBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  ctaText: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 1.5,
  },
  ctaBtn: {
    backgroundColor: '#1e40af',
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
  ctaBtnText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}

// ── PDF Document ──────────────────────────────────────────────────────────

interface Props {
  output: ScoringOutput;
  recipientName?: string;
  recipientCompany?: string;
  generatedAt?: string;
}

export function GrowthEngineDiagnosticPDF({
  output,
  recipientName,
  recipientCompany,
  generatedAt,
}: Props) {
  const {
    trap_scores,
    flow_scores,
    primary_trap,
    secondary_trap,
    weakest_flow,
    strongest_flow,
    recommended_system,
    warning,
  } = output;

  const archetype = ARCHETYPE_BY_TRAP[primary_trap];
  const archetypeName = ARCHETYPE_NAMES[archetype];
  const summary = stripMarkdown(buildExecutiveSummary(output));
  const recommendation = BUILD_FIRST_RECOMMENDATIONS[recommended_system];
  const actions = THIRTY_DAY_ACTIONS[recommended_system];
  const trapOrder = [
    'growth_by_addition',
    'key_person_reliance',
    'acquisition_over_expansion',
    'activity_confusion',
  ] as const;

  const date =
    generatedAt ??
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document
      title="Growth Engine Diagnostic Report"
      author="Growth Engine"
      subject="Operator Diagnostic Results"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Growth Engine Diagnostic</Text>
            <Text style={s.headerSubtitle}>
              {recipientName ? `Prepared for ${recipientName}${recipientCompany ? ` · ${recipientCompany}` : ''}` : 'Operator Diagnostic Results'}
            </Text>
          </View>
          <View>
            <Text style={s.headerBadge}>Confidential Report</Text>
            <Text style={[s.footerText, { textAlign: 'right', marginTop: 2 }]}>{date}</Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={s.section}>
          <View style={s.summaryCard}>
            <Text style={s.summaryLabel}>Your Growth Profile</Text>
            <Text style={s.summaryArchetype}>{archetypeName}</Text>
            <Text style={s.summaryText}>{summary}</Text>
          </View>

          {warning && (
            <View style={s.warningCard}>
              <Text style={{ fontSize: 10, color: '#d97706', width: 14 }}>⚠</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.warningTitle}>Over-fueling Warning</Text>
                <Text style={s.warningText}>{warning}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Growth Trap Profile */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Growth Trap Profile</Text>
          <Text style={s.sectionSubtitle}>Higher score = more evidence of that trap</Text>
          {trapOrder.map((trap) => {
            const score = trap_scores[trap];
            const isPrimary = trap === primary_trap;
            const isSecondary = trap === secondary_trap;
            const fillColor = isPrimary ? '#dc2626' : isSecondary ? '#ea580c' : '#d1d5db';
            return (
              <View key={trap} style={s.trapRow}>
                <Text style={s.trapLabel}>
                  {TRAP_LABELS[trap]}{isPrimary ? ' ★' : isSecondary ? ' ·' : ''}
                </Text>
                <View style={s.trapBarBg}>
                  <View
                    style={[
                      s.trapBarFill,
                      { width: `${score}%`, backgroundColor: fillColor },
                    ]}
                  />
                </View>
                <Text style={s.trapScore}>{score}/100</Text>
              </View>
            );
          })}
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 8, color: '#6b7280' }}>★ Primary trap · Secondary trap</Text>
          </View>
        </View>

        {/* Flow Health */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Flow Health Scores</Text>
          <Text style={s.sectionSubtitle}>Higher score = more mature, systematic engine in that area</Text>
          <View style={s.flowGrid}>
            {(['demand', 'sales', 'delivery', 'expansion'] as const).map((flow) => {
              const sc = flow_scores[flow];
              const isWeakest = flow === weakest_flow;
              const isStrongest = flow === strongest_flow;
              const bg = isWeakest ? '#fef2f2' : isStrongest ? '#eff6ff' : '#f9fafb';
              const border = isWeakest ? '#fecaca' : isStrongest ? '#bfdbfe' : '#e5e7eb';
              const scoreColor = isWeakest ? '#dc2626' : isStrongest ? '#1e40af' : '#374151';
              return (
                <View key={flow} style={[s.flowBox, { backgroundColor: bg, borderColor: border }]}>
                  <Text style={s.flowBoxLabel}>{FLOW_LABELS[flow]}</Text>
                  <Text style={[s.flowBoxScore, { color: scoreColor }]}>{sc}</Text>
                  {isWeakest && <Text style={[s.flowBoxTag, { color: '#dc2626' }]}>Weakest</Text>}
                  {isStrongest && <Text style={[s.flowBoxTag, { color: '#1e40af' }]}>Strongest</Text>}
                </View>
              );
            })}
          </View>
        </View>

        {/* Build First */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>What to Build First</Text>
          <View style={s.recCard}>
            <Text style={s.recLabel}>Build First</Text>
            <Text style={s.recTitle}>{recommendation.title}</Text>
            <Text style={s.recDesc}>{SYSTEM_DESCRIPTIONS[recommended_system]}</Text>
            {recommendation.items.map((item, i) => (
              <View key={i} style={s.recItem}>
                <Text style={s.recCheck}>✓</Text>
                <Text style={s.recItemText}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={s.phaseRow}>
            <View style={s.phaseBox}>
              <Text style={s.phaseTitle}>Stabilize next</Text>
              <Text style={s.phaseText}>{recommendation.stabilize}</Text>
            </View>
            <View style={s.phaseBox}>
              <Text style={s.phaseTitle}>Add fuel later</Text>
              <Text style={s.phaseText}>{recommendation.addFuel}</Text>
            </View>
          </View>
        </View>

        {/* 30-Day Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Your 30-Day Priority Actions</Text>
          <Text style={s.sectionSubtitle}>
            Concrete moves to start building your {SYSTEM_LABELS[recommended_system].toLowerCase()}
          </Text>
          {actions.map((action, i) => (
            <View key={i} style={s.actionRow}>
              <View style={s.actionNum}>
                <Text style={s.actionNumText}>{i + 1}</Text>
              </View>
              <Text style={s.actionText}>{action}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={s.ctaBox}>
          <Text style={s.ctaTitle}>Book a Growth Engine Review</Text>
          <Text style={s.ctaText}>
            We&apos;ll walk through your results, identify the real constraint,{'\n'}
            and show you what system to build first.
          </Text>
          <View style={s.ctaBtn}>
            <Text style={s.ctaBtnText}>Book a Call</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Growth Engine Diagnostic — Confidential</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
