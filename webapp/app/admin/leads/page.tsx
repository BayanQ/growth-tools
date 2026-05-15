'use client';

import { useState, useEffect, useCallback } from 'react';

interface Lead {
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

const TRAP_LABELS: Record<string, string> = {
  growth_by_addition: 'Growth by Addition',
  key_person_reliance: 'Key Person Reliance',
  acquisition_over_expansion: 'Acquisition Over Expansion',
  activity_confusion: 'Activity Confusion',
};

const FLOW_LABELS: Record<string, string> = {
  demand: 'Demand',
  sales: 'Sales',
  delivery: 'Delivery',
  expansion: 'Expansion',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function leadsToCSV(leads: Lead[]): string {
  const headers = [
    'Name', 'Email', 'Company', 'Role',
    'Submitted At', 'Primary Trap', 'Secondary Trap',
    'Weakest Flow', 'Strongest Flow', 'Constraint',
  ];
  const rows = leads.map((l) => [
    l.name, l.email, l.company, l.role ?? '',
    l.submittedAt,
    TRAP_LABELS[l.primaryTrap] ?? l.primaryTrap,
    TRAP_LABELS[l.secondaryTrap] ?? l.secondaryTrap,
    FLOW_LABELS[l.weakestFlow] ?? l.weakestFlow,
    FLOW_LABELS[l.strongestFlow] ?? l.strongestFlow,
    l.constraint,
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export default function LeadsAdminPage() {
  const [token, setToken] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authed, setAuthed] = useState(false);

  const fetchLeads = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/leads?token=${encodeURIComponent(t)}`);
      if (res.status === 401) {
        setError('Invalid token.');
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setAuthed(true);
    } catch {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_token');
    if (saved) {
      setToken(saved);
      fetchLeads(saved);
    }
  }, [fetchLeads]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem('admin_token', token);
    fetchLeads(token);
  }

  function downloadCSV() {
    const csv = leadsToCSV(leads);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Lead Admin</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Admin token"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
            <p className="text-sm text-gray-500 mt-1">{leads.length} submission{leads.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchLeads(token)}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            {leads.length > 0 && (
              <button
                onClick={downloadCSV}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            No leads yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Primary Trap</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Weakest Flow</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                          {lead.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{lead.company}</td>
                      <td className="px-4 py-3 text-gray-500">{lead.role ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">
                          {TRAP_LABELS[lead.primaryTrap] ?? lead.primaryTrap}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                          {FLOW_LABELS[lead.weakestFlow] ?? lead.weakestFlow}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(lead.submittedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
