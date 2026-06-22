import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  MessageSquare, CheckCircle2, XCircle, Clock, Search,
  RefreshCw, Landmark, Tag, AlertTriangle, Star, ChevronRight
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseReport(reportText) {
  try {
    const p = JSON.parse(reportText);
    if (p && typeof p === 'object') {
      return {
        office: p.office || '—',
        counter: p.counter || '',
        friction_tags: Array.isArray(p.friction_tags) ? p.friction_tags : [],
        comments: p.comments || '',
        isStructured: true,
      };
    }
  } catch (_) {}
  return { office: '—', counter: '', friction_tags: [], comments: reportText, isStructured: false };
}

const STATUS = {
  Pending:  { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   dot: 'bg-amber-400',   Icon: Clock },
  Verified: { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400', Icon: CheckCircle2 },
  Rejected: { pill: 'bg-rose-500/10 text-rose-400 border-rose-500/20',      dot: 'bg-rose-400',    Icon: XCircle },
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.Pending;
  const { Icon } = s;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${s.pill}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CustomerReviews = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data } = await axios.get('/api/v1/crowd-reports');
      setReports(data);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await axios.patch(`/api/v1/crowd-reports/${id}/verify`, {
        verification_status: newStatus,
      });
      setReports(prev =>
        prev.map(r => r.id === id ? { ...r, verification_status: newStatus } : r)
      );
    } catch (e) {
      console.error('Failed to update:', e);
    } finally {
      setUpdating(null);
    }
  };

  // ── Derived data ─────────────────────────────────────────────────
  const stats = {
    total:    reports.length,
    pending:  reports.filter(r => r.verification_status === 'Pending').length,
    verified: reports.filter(r => r.verification_status === 'Verified').length,
    rejected: reports.filter(r => r.verification_status === 'Rejected').length,
  };

  const visible = reports.filter(r => {
    if (filter !== 'All' && r.verification_status !== filter) return false;
    if (!search.trim()) return true;
    const p = parseReport(r.report_text);
    const q = search.toLowerCase();
    return (
      p.office.toLowerCase().includes(q) ||
      p.comments.toLowerCase().includes(q) ||
      p.friction_tags.some(t => t.toLowerCase().includes(q))
    );
  });

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0B1120] p-6 md:p-8 space-y-7 w-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Customer Reviews</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Citizen-submitted office feedback — verify or reject reports to keep VisitGuard scores accurate.
          </p>
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total,    color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Pending',       value: stats.pending,  color: 'text-amber-400',  bg: 'bg-amber-500/10  border-amber-500/20'  },
          { label: 'Verified',      value: stats.verified, color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20'},
          { label: 'Rejected',      value: stats.rejected, color: 'text-rose-400',   bg: 'bg-rose-500/10   border-rose-500/20'   },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.bg}`}>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">{s.label}</p>
            <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by office name, friction tag, or comment…"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'Verified', 'Rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                filter === f
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {f}
              {f !== 'All' && (
                <span className="ml-1.5 text-xs opacity-60">{stats[f.toLowerCase()] ?? 0}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_auto] gap-4 px-6 py-3 bg-slate-950/50 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Office</span>
          <span>Comment</span>
          <span>Friction Tags</span>
          <span>Date</span>
          <span className="text-right">Status / Action</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-slate-800/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_auto] gap-4 px-6 py-4 animate-pulse">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-5 bg-slate-800 rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p className="font-medium">No reviews match your filter</p>
            <p className="text-sm">Try changing the status filter or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {visible.map(report => {
              const parsed = parseReport(report.report_text);
              const isExpanded = expanded === report.id;
              const isUpdating = updating === report.id;

              return (
                <div key={report.id} className="hover:bg-slate-800/20 transition-colors">
                  {/* Main Row */}
                  <div
                    className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_auto] gap-4 px-6 py-4 items-center cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : report.id)}
                  >
                    {/* Office */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Landmark className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{parsed.office}</p>
                        {parsed.counter && (
                          <p className="text-xs text-slate-600 truncate">Counter: {parsed.counter}</p>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-slate-400 truncate">
                      {parsed.comments || <span className="italic text-slate-600">No comment</span>}
                    </p>

                    {/* Friction Tags */}
                    <div className="flex flex-wrap gap-1">
                      {parsed.friction_tags.length === 0 ? (
                        <span className="text-slate-600 text-xs">—</span>
                      ) : (
                        parsed.friction_tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />
                            {tag.length > 20 ? tag.slice(0, 18) + '…' : tag}
                          </span>
                        ))
                      )}
                      {parsed.friction_tags.length > 2 && (
                        <span className="text-xs text-slate-600">+{parsed.friction_tags.length - 2}</span>
                      )}
                    </div>

                    {/* Date */}
                    <p className="text-xs text-slate-500">
                      {report.created_at
                        ? new Date(report.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })
                        : '—'}
                    </p>

                    {/* Status + Expand */}
                    <div className="flex items-center gap-2 justify-end">
                      <StatusPill status={report.verification_status} />
                      <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Detail Row */}
                  {isExpanded && (
                    <div className="px-6 pb-5 bg-slate-950/30 border-t border-slate-800/50">
                      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Full Comment */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Full Comment</p>
                          <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-indigo-500/50 pl-3">
                            {parsed.comments || <span className="italic text-slate-600">No comment provided.</span>}
                          </p>
                        </div>

                        {/* All Friction Tags */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Friction Issues Reported</p>
                          {parsed.friction_tags.length === 0 ? (
                            <p className="text-sm text-slate-600 italic">None reported</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {parsed.friction_tags.map((tag, i) => (
                                <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Report Info</p>
                          <dl className="space-y-1 text-sm">
                            <div className="flex gap-2">
                              <dt className="text-slate-600 w-20">Report #</dt>
                              <dd className="text-slate-300 font-mono">{report.id}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="text-slate-600 w-20">Submitted</dt>
                              <dd className="text-slate-300">
                                {report.created_at
                                  ? new Date(report.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                  : '—'}
                              </dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="text-slate-600 w-20">Status</dt>
                              <dd><StatusPill status={report.verification_status} /></dd>
                            </div>
                          </dl>
                        </div>

                        {/* Action Buttons */}
                        {report.verification_status === 'Pending' && (
                          <div className="flex items-end gap-3">
                            <button
                              disabled={isUpdating}
                              onClick={() => updateStatus(report.id, 'Verified')}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {isUpdating ? 'Updating…' : 'Verify Report'}
                            </button>
                            <button
                              disabled={isUpdating}
                              onClick={() => updateStatus(report.id, 'Rejected')}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-50 text-rose-400 border border-rose-500/30 text-sm font-semibold rounded-xl transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              {isUpdating ? 'Updating…' : 'Reject Report'}
                            </button>
                          </div>
                        )}
                        {report.verification_status !== 'Pending' && (
                          <div className="flex items-end">
                            <button
                              disabled={isUpdating}
                              onClick={() => updateStatus(report.id, 'Pending')}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
                            >
                              <Clock className="w-4 h-4" />
                              Reset to Pending
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Table Footer */}
        {!loading && visible.length > 0 && (
          <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800 text-xs text-slate-600">
            Showing {visible.length} of {reports.length} reviews
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerReviews;
