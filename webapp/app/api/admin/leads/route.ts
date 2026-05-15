import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads } from '@/lib/lead-store';

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const token =
    req.headers.get('x-admin-token') ??
    req.nextUrl.searchParams.get('token');
  return token === secret;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leads = await getAllLeads();
  return NextResponse.json({ leads, total: leads.length });
}
