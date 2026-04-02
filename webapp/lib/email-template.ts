import { ScoringOutput } from './types';
import {
  TRAP_LABELS,
  FLOW_LABELS,
  SYSTEM_LABELS,
  THIRTY_DAY_ACTIONS,
  BUILD_FIRST_RECOMMENDATIONS,
  ARCHETYPE_BY_TRAP,
  ARCHETYPE_NAMES,
  buildExecutiveSummary,
} from './content';

interface EmailData {
  output: ScoringOutput;
  recipientName: string;
  recipientEmail: string;
  recipientCompany: string;
  recipientRole?: string;
  bookCallUrl?: string;
}

/**
 * Generates the HTML body for the Growth Engine Diagnostic summary email.
 * Inline styles only — compatible with all major email clients.
 */
export function buildDiagnosticEmailHtml(data: EmailData): string {
  const {
    output,
    recipientName,
    recipientCompany,
    bookCallUrl = '#',
  } = data;

  const {
    primary_trap,
    secondary_trap,
    weakest_flow,
    strongest_flow,
    flow_scores,
    trap_scores,
    recommended_system,
    warning,
  } = output;

  const archetype = ARCHETYPE_BY_TRAP[primary_trap];
  const archetypeName = ARCHETYPE_NAMES[archetype];
  const summary = buildExecutiveSummary(output)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const recommendation = BUILD_FIRST_RECOMMENDATIONS[recommended_system];
  const actions = THIRTY_DAY_ACTIONS[recommended_system].slice(0, 3);
  const systemLabel = SYSTEM_LABELS[recommended_system];

  const trapOrder = [
    'growth_by_addition',
    'key_person_reliance',
    'acquisition_over_expansion',
    'activity_confusion',
  ] as const;

  const flowOrder = ['demand', 'sales', 'delivery', 'expansion'] as const;

  const trapRows = trapOrder.map((trap) => {
    const sc = trap_scores[trap];
    const isPrimary = trap === primary_trap;
    const barColor = isPrimary ? '#dc2626' : '#fb923c';
    const barOpacity = isPrimary ? '1' : '0.65';
    return `
      <tr>
        <td style="padding: 4px 0; font-size: 12px; color: #374151; width: 170px;">
          ${TRAP_LABELS[trap]}${isPrimary ? ' <span style="color:#dc2626">★</span>' : ''}
        </td>
        <td style="padding: 4px 8px;">
          <div style="background:#f3f4f6;border-radius:4px;height:10px;overflow:hidden;">
            <div style="height:10px;border-radius:4px;background:${barColor};opacity:${barOpacity};width:${sc}%;"></div>
          </div>
        </td>
        <td style="padding: 4px 0; font-size: 11px; color: #6b7280; text-align:right; width:40px;">${sc}/100</td>
      </tr>`;
  }).join('');

  const flowBoxes = flowOrder.map((flow) => {
    const sc = flow_scores[flow];
    const isWeakest = flow === weakest_flow;
    const isStrongest = flow === strongest_flow;
    const bg = isWeakest ? '#fef2f2' : isStrongest ? '#f0f1ff' : '#f9fafb';
    const border = isWeakest ? '#fecaca' : isStrongest ? '#dce0ff' : '#e5e7eb';
    const scoreColor = isWeakest ? '#dc2626' : isStrongest ? '#4d65ff' : '#374151';
    const tag = isWeakest
      ? '<div style="font-size:10px;color:#dc2626;font-weight:bold;margin-top:2px;">Weakest</div>'
      : isStrongest
      ? '<div style="font-size:10px;color:#4d65ff;font-weight:bold;margin-top:2px;">Strongest</div>'
      : '';
    return `
      <td style="width:25%;padding:4px;">
        <div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:10px;text-align:center;">
          <div style="font-size:11px;color:#6b7280;">${FLOW_LABELS[flow]}</div>
          <div style="font-size:22px;font-weight:bold;color:${scoreColor};margin:4px 0;">${sc}</div>
          ${tag}
        </div>
      </td>`;
  }).join('');

  const actionItems = actions.map((action, i) => `
    <tr>
      <td style="vertical-align:top;padding:6px 8px 6px 0;width:28px;">
        <div style="width:22px;height:22px;background:#e5e8ff;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:bold;color:#3a52e8;">${i + 1}</div>
      </td>
      <td style="font-size:13px;color:#374151;line-height:1.5;padding:6px 0;">${action}</td>
    </tr>`).join('');

  const warningBlock = warning
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:bold;color:#92400e;margin-bottom:4px;">⚠ Over-fueling Warning</div>
        <div style="font-size:13px;color:#78350f;line-height:1.5;">${warning}</div>
      </div>`
    : '';

  const firstName = recipientName.split(' ')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Growth Engine Diagnostic Results</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:28px 32px 24px;">
              <div style="font-size:11px;font-weight:bold;color:#818bff;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Growth Engine Diagnostic</div>
              <div style="font-size:24px;font-weight:bold;color:#ffffff;margin-bottom:4px;">Your Results Are Ready</div>
              <div style="font-size:14px;color:#9ca3af;">Prepared for ${recipientName} · ${recipientCompany}</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">

              <p style="font-size:14px;color:#374151;margin:0 0 20px;">Hi ${firstName},</p>
              <p style="font-size:14px;color:#374151;margin:0 0 24px;line-height:1.6;">
                Here's your Growth Engine Diagnostic summary. Your full PDF report is attached.
              </p>

              <!-- Profile Card -->
              <div style="background:#eef0ff;border:1px solid #c7d0ff;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
                <div style="font-size:10px;font-weight:bold;color:#4d65ff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Your Growth Profile</div>
                <div style="font-size:18px;font-weight:bold;color:#111827;margin-bottom:8px;">${archetypeName}</div>
                <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;">${summary}</p>
              </div>

              ${warningBlock}

              <!-- Trap Scores -->
              <div style="margin-bottom:24px;">
                <div style="font-size:14px;font-weight:bold;color:#111827;margin-bottom:4px;border-left:3px solid #4d65ff;padding-left:10px;">Growth Trap Profile</div>
                <div style="font-size:11px;color:#6b7280;padding-left:13px;margin-bottom:12px;">Higher score = more evidence of that trap</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${trapRows}
                </table>
              </div>

              <!-- Flow Scores -->
              <div style="margin-bottom:24px;">
                <div style="font-size:14px;font-weight:bold;color:#111827;margin-bottom:4px;border-left:3px solid #4d65ff;padding-left:10px;">Flow Health Scores</div>
                <div style="font-size:11px;color:#6b7280;padding-left:13px;margin-bottom:12px;">Higher = more systematic engine</div>
                <table width="100%" cellpadding="0" cellspacing="0"><tr>${flowBoxes}</tr></table>
              </div>

              <!-- Build First -->
              <div style="background:#f9fafb;border-left:4px solid #4d65ff;border-radius:8px;padding:16px 18px;margin-bottom:20px;">
                <div style="font-size:10px;font-weight:bold;color:#4d65ff;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Build First</div>
                <div style="font-size:16px;font-weight:bold;color:#111827;margin-bottom:8px;">${recommendation.title}</div>
                ${recommendation.items.map((item) =>
                  `<div style="font-size:12px;color:#374151;margin-bottom:4px;">✓ ${item}</div>`
                ).join('')}
              </div>

              <!-- 30-Day Actions (top 3) -->
              <div style="margin-bottom:24px;">
                <div style="font-size:14px;font-weight:bold;color:#111827;margin-bottom:4px;border-left:3px solid #4d65ff;padding-left:10px;">Your First 3 Actions This Month</div>
                <div style="font-size:11px;color:#6b7280;padding-left:13px;margin-bottom:12px;">Start building your ${systemLabel.toLowerCase()}</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${actionItems}
                </table>
                <p style="font-size:12px;color:#9ca3af;margin-top:8px;margin-bottom:0;">See your full 30-day plan in the attached PDF report.</p>
              </div>

              <!-- CTA -->
              <div style="background:#eef0ff;border:1px solid #c7d0ff;border-radius:10px;padding:24px;text-align:center;">
                <div style="font-size:17px;font-weight:bold;color:#111827;margin-bottom:6px;">Book a Growth Engine Review</div>
                <p style="font-size:13px;color:#374151;margin:0 0 16px;line-height:1.5;">
                  We&apos;ll walk through your results, identify the real constraint, and show you what system to build first.
                </p>
                <a href="${bookCallUrl}" style="display:inline-block;background:#4d65ff;color:#ffffff;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:8px;text-decoration:none;">
                  Book a Call
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
              <p style="font-size:11px;color:#9ca3af;margin:0;line-height:1.6;">
                Growth Engine Diagnostic · This report was generated based on your assessment responses.<br>
                You&apos;re receiving this because you requested a diagnostic report. No spam, ever.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates plain-text fallback for the email.
 */
export function buildDiagnosticEmailText(data: EmailData): string {
  const { output, recipientName, bookCallUrl = '#' } = data;
  const {
    primary_trap,
    secondary_trap,
    weakest_flow,
    recommended_system,
  } = output;
  const recommendation = BUILD_FIRST_RECOMMENDATIONS[recommended_system];
  const actions = THIRTY_DAY_ACTIONS[recommended_system].slice(0, 3);

  return `
Hi ${recipientName.split(' ')[0]},

Your Growth Engine Diagnostic results are ready. Your full PDF report is attached.

━━━ YOUR GROWTH PROFILE ━━━

Primary Trap: ${TRAP_LABELS[primary_trap]}
Secondary Trap: ${TRAP_LABELS[secondary_trap]}
Weakest Flow: ${FLOW_LABELS[weakest_flow]}
Build First: ${recommendation.title}

━━━ YOUR FIRST 3 ACTIONS ━━━

${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

See your full 30-day plan and detailed breakdown in the attached PDF.

━━━ BOOK A REVIEW ━━━

We'll walk through your results, identify the real constraint, and show you what system to build first.

Book a call: ${bookCallUrl}

—
Growth Engine Diagnostic
  `.trim();
}
