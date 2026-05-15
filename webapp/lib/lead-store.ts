import { getStore } from '@netlify/blobs';
import { randomUUID } from 'crypto';
import { ScoringOutput } from './types';

export interface StoredLead {
  id: string;
  name: string;
  email: string;
  company: string;
  role?: string;
  submittedAt: string;
  primaryTrap: string;
  secondaryTrap: string;
  weakestFlow: string;
  strongestFlow: string;
  constraint: string;
}

export async function storeLead(
  lead: { name: string; email: string; company: string; role?: string },
  output: ScoringOutput
): Promise<StoredLead | null> {
  try {
    const store = getStore('leads');
    const id = randomUUID();
    const entry: StoredLead = {
      id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      role: lead.role,
      submittedAt: new Date().toISOString(),
      primaryTrap: output.primary_trap,
      secondaryTrap: output.secondary_trap,
      weakestFlow: output.weakest_flow,
      strongestFlow: output.strongest_flow,
      constraint: output.constraint,
    };
    await store.setJSON(id, entry);
    return entry;
  } catch {
    // Storage unavailable outside Netlify environment — non-fatal
    return null;
  }
}

export async function getAllLeads(): Promise<StoredLead[]> {
  const store = getStore('leads');
  const { blobs } = await store.list();
  const leads = await Promise.all(
    blobs.map(({ key }) => store.get(key, { type: 'json' }) as Promise<StoredLead>)
  );
  return leads
    .filter(Boolean)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}
