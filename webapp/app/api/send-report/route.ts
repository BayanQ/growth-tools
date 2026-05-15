import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { GrowthEngineDiagnosticPDF } from '@/lib/pdf-template';
import { buildDiagnosticEmailHtml, buildDiagnosticEmailText } from '@/lib/email-template';
import { ScoringOutput } from '@/lib/types';

/**
 * POST /api/send-report
 *
 * Generates the PDF and sends the diagnostic summary email.
 *
 * Body:
 * {
 *   output: ScoringOutput,
 *   lead: { name: string, email: string, company: string, role?: string },
 *   bookCallUrl?: string,
 * }
 *
 * Email sending is handled by the configured provider (SMTP, SendGrid, Resend, etc.).
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and FROM_EMAIL env vars to enable.
 * If no env vars are set, the API returns the generated HTML/PDF without sending.
 */

interface Lead {
  name: string;
  email: string;
  company: string;
  role?: string;
}

export async function POST(req: NextRequest) {
  let body: { output: ScoringOutput; lead: Lead; bookCallUrl?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.output || !body.lead?.name || !body.lead?.email) {
    return NextResponse.json(
      { error: 'output and lead (name, email) are required' },
      { status: 400 }
    );
  }

  const { output, lead, bookCallUrl = process.env.BOOK_CALL_URL ?? 'https://calendly.com/adam-liederman/30-min-w-adam' } = body;

  // Generate PDF
  const pdfElement = React.createElement(GrowthEngineDiagnosticPDF, {
    output,
    recipientName: lead.name,
    recipientCompany: lead.company,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    bookCallUrl,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(pdfElement as any);

  // Build email content
  const emailData = {
    output,
    recipientName: lead.name,
    recipientEmail: lead.email,
    recipientCompany: lead.company,
    recipientRole: lead.role,
    bookCallUrl,
  };
  const htmlBody = buildDiagnosticEmailHtml(emailData);
  const textBody = buildDiagnosticEmailText(emailData);

  // Send email if SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  let sent = false;
  let sendError: string | undefined;

  if (smtpHost) {
    try {
      // Dynamic import to avoid bundling nodemailer when not configured
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL ?? 'Growth Engine Diagnostic <noreply@growthengine.io>',
        to: `${lead.name} <${lead.email}>`,
        bcc: 'adam@growthspan.ca',
        subject: 'Your Growth Engine Diagnostic Results',
        text: textBody,
        html: htmlBody,
        attachments: [
          {
            filename: 'growth-engine-diagnostic.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
      sent = true;
    } catch (err) {
      sendError = err instanceof Error ? err.message : String(err);
    }
  }

  // Always return success for the lead capture flow;
  // if no SMTP is configured the PDF is available via the /api/report route.
  return NextResponse.json({
    ok: true,
    sent,
    ...(sendError ? { sendError } : {}),
    ...(process.env.NODE_ENV === 'development'
      ? { emailHtml: htmlBody, emailText: textBody }
      : {}),
  });
}
