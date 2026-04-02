import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { GrowthEngineDiagnosticPDF } from '@/lib/pdf-template';
import { ScoringOutput } from '@/lib/types';

/**
 * POST /api/report
 *
 * Body:
 * {
 *   output: ScoringOutput,
 *   recipientName?: string,
 *   recipientCompany?: string,
 * }
 *
 * Returns the PDF as application/pdf.
 */
export async function POST(req: NextRequest) {
  let body: { output: ScoringOutput; recipientName?: string; recipientCompany?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.output) {
    return NextResponse.json({ error: 'output is required' }, { status: 400 });
  }

  const element = React.createElement(GrowthEngineDiagnosticPDF, {
    output: body.output,
    recipientName: body.recipientName,
    recipientCompany: body.recipientCompany,
    generatedAt: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="growth-engine-diagnostic.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
