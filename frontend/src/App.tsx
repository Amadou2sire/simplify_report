import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ClipboardList, Clock, TrendingUp, AlertCircle,
  CheckCircle2, FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { TICKETS as MOCK_TICKETS, STATUS_DISTRIBUTION as MOCK_STATUS_DISTRIBUTION, PRIORITY_DISTRIBUTION } from './constants';
import { Ticket } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const StatCard = ({ label, value, subtext, icon: Icon, colorClass }: {
  label: string;
  value: string | number;
  subtext: string;
  icon: any;
  colorClass: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("relative overflow-hidden rounded-2xl p-6 text-white shadow-lg", colorClass)}
  >
    <div className="relative z-10">
      <p className="text-sm font-medium opacity-80">{label}</p>
      <h3 className="mt-2 text-4xl font-bold">{value}</h3>
      <p className="mt-1 text-xs opacity-70">{subtext}</p>
    </div>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
      <Icon size={48} />
    </div>
  </motion.div>
);

const SectionTitle = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="h-6 w-1 rounded-full bg-indigo-600" />
    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
      {Icon && <Icon size={20} className="text-indigo-600" />}
      {children}
    </h2>
  </div>
);

const PriorityBadge = ({ priority }: { priority: Ticket['priority'] }) => {
  const styles = {
    Critique: "bg-red-500 text-white",
    Majeure: "bg-orange-500 text-white",
    Mineure: "bg-emerald-500 text-white",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider", styles[priority])}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: Ticket['status'] }) => {
  const styles: Record<string, string> = {
    Résolu: "bg-emerald-100 text-emerald-700",
    'En cours': "bg-amber-100 text-amber-700",
    Clôturé: "bg-slate-100 text-slate-700",
    Test: "bg-indigo-100 text-indigo-700",
    Bloqué: "bg-red-100 text-red-700",
    Validation: "bg-purple-100 text-purple-700",
    Ouvert: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
};

const TypeBadge = ({ type }: { type: Ticket['type'] }) => {
  const styles: Record<string, string> = {
    Bug: "bg-red-50 text-red-600 border border-red-100",
    Performance: "bg-amber-50 text-amber-600 border border-amber-100",
    Maintenance: "bg-blue-50 text-blue-600 border border-blue-100",
    Sécurité: "bg-rose-50 text-rose-600 border border-rose-100",
  };
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold", styles[type])}>
      {type}
    </span>
  );
};

// ── Types for API Report ─────────────────────────────────────────────────────
interface ReportItem {
  id: number;
  project_id: number;
  project_name: string;
  title: string;
  due_date: string | null;
  status: string;
  real_status: string;
  tracker: string;
  is_effected: boolean;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/reports', {
          signal: controller.signal,
          mode: 'cors'
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          const data: ReportItem[] = await response.json();
          setReports(data);
          setApiError(false); // Reset error if we got data
        } else {
          setApiError(true);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Map API reports → Ticket[] shape for the table
  const apiTickets: Ticket[] = reports.map(r => ({
    id: r.id.toString(),
    title: r.project_name,
    project: r.project_name,
    subject: r.title,
    tracker: r.tracker || 'Documentation et reporting',
    type: 'Maintenance',
    status: (r.real_status || (r.is_effected ? 'Résolu' : 'Ouvert')) as Ticket['status'],
    date: r.due_date ?? '—',
    priority: 'Majeure',
  }));

  // Fallback to mock data when API has no data or fails
  const displayTickets = apiTickets.length > 0 ? apiTickets : MOCK_TICKETS;

  const statusDistribution = reports.length > 0 ? [
    { name: 'Effectué', value: reports.filter(r => r.is_effected).length, color: '#10B981' },
    { name: 'Non effectué', value: reports.filter(r => !r.is_effected).length, color: '#F59E0B' },
  ] : MOCK_STATUS_DISTRIBUTION;

  const todayStr = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-slate-600 font-medium">Chargement des données Redmine…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans">

      {/* Header */}
      <header className="bg-white px-8 py-6 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://www.medianet.tn/assets/fr/images/png/logo-medianet.png"
              alt="Medianet Logo"
              className="h-auto w-auto"
              referrerPolicy="no-referrer"
            />
            <div className="h-auto w-px bg-slate-200" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rapport d'Activité de Maintenance</h1>
              <p className="text-sm text-slate-500">
                {apiError ? 'Données de démonstration (backend non accessible)' : 'Données en direct — Redmine'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Source</p>
            <p className="text-sm font-bold text-slate-700">Tracker "Documentation et reporting"</p>
            <p className="mt-1 text-[10px] text-slate-400">Généré le {todayStr}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl px-8">

        {/* API Error banner */}
        {apiError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-700">
            ⚠️ Impossible de joindre le backend FastAPI (<code>http://localhost:8000</code>). Les données affichées sont des données de démonstration.
            Lancez le backend avec : <code className="font-mono">.\venv\Scripts\uvicorn main:app --reload</code>
          </div>
        )}

        {/* Overview Stats */}
        <section className="mb-12">
          <SectionTitle>Vue d'ensemble des rapports</SectionTitle>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total des tickets"
              value={reports.length || MOCK_TICKETS.length}
              subtext="Tracker: Documentation et reporting"
              icon={ClipboardList}
              colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700"
            />
            <StatCard
              label="Rapports Effectués"
              value={reports.length > 0 ? reports.filter(r => r.is_effected).length : 35}
              subtext="Échéance > Aujourd'hui + 2j"
              icon={CheckCircle2}
              colorClass="bg-gradient-to-br from-emerald-500 to-emerald-700"
            />
            <StatCard
              label="En Attente"
              value={reports.length > 0 ? reports.filter(r => !r.is_effected).length : 12}
              subtext="Prochaine échéance proche"
              icon={Clock}
              colorClass="bg-gradient-to-br from-orange-400 to-orange-600"
            />
            <StatCard
              label="Taux de Complétion"
              value={reports.length > 0
                ? `${((reports.filter(r => r.is_effected).length / reports.length) * 100).toFixed(1)}%`
                : '74.5%'}
              subtext="Ratio effectué / total"
              icon={TrendingUp}
              colorClass="bg-gradient-to-br from-purple-500 to-purple-700"
            />
          </div>
        </section>

        {/* Status Distribution */}
        <section className="mb-12">
          <SectionTitle>Statuts des rapports</SectionTitle>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

            {/* Bar Chart */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <h3 className="mb-1 text-base font-bold text-slate-800">Répartition par statut</h3>
              <p className="mb-6 text-xs text-slate-400">Distribution des rapports effectués vs en attente</p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <h3 className="mb-1 text-base font-bold text-slate-800">Proportion des statuts</h3>
              <p className="mb-6 text-xs text-slate-400">Visualisation en pourcentage</p>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] text-slate-500">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Mini Status Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statusDistribution.map((status) => (
              <div key={status.name} className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm border border-slate-100">
                <div className="mb-2 h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="text-xl font-bold text-slate-800">{status.value}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{status.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Priority section (always uses mock-style static data) */}
        <section className="mb-12">
          <SectionTitle>Répartition par priorité</SectionTitle>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <h3 className="mb-1 text-base font-bold text-slate-800">Priorités</h3>
              <p className="mb-6 text-xs text-slate-400">Critique, Majeure, Mineure</p>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PRIORITY_DISTRIBUTION} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {PRIORITY_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-[10px] text-slate-500">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
              <h3 className="mb-1 text-base font-bold text-slate-800">Détails des priorités</h3>
              <p className="mb-8 text-xs text-slate-400">Analyse détaillée par niveau de criticité</p>
              <div className="space-y-6">
                {[
                  { label: 'Critique', count: 6, total: 47, color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50', desc: 'Nécessite une intervention immédiate. Impact majeur sur le service.' },
                  { label: 'Majeure', count: 15, total: 47, color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50', desc: 'Impact significatif nécessitant une résolution rapide.' },
                  { label: 'Mineure', count: 26, total: 47, color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', desc: 'Problème mineur sans impact critique sur le service.' },
                ].map((p) => (
                  <div key={p.label} className={cn("rounded-xl p-4 border border-slate-100", p.bgColor)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-white", p.color)}>
                          <AlertCircle size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800">{p.label}</span>
                          <p className="text-[11px] text-slate-500">{p.desc}</p>
                        </div>
                      </div>
                      <span className={cn("text-sm font-bold", p.textColor)}>{p.count} tickets</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.count / p.total) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full", p.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed ticket / report list */}
        <section className="mb-12">
          <SectionTitle>Liste détaillée des rapports par projet</SectionTitle>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {reports.length > 0 ? "Rapports d'activité (live)" : "Tickets de démonstration"}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {reports.length > 0
                    ? "Comparaison de la date d'échéance avec aujourd'hui + 2 jours"
                    : "Données statiques — lancez le backend pour les données réelles"}
                </p>
              </div>
              <span className="text-[10px] font-medium text-slate-400">Affichage de {displayTickets.length} item(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Projet</th>
                    <th className="px-6 py-4">Sujet</th>
                    <th className="px-6 py-4">Tracker</th>
                    <th className="px-6 py-4">Échéance</th>
                    <th className="px-6 py-4 text-right">Statut / Rapport</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayTickets.map((ticket, idx) => {
                    // Find matching report to get project_id for navigation
                    const report = reports.find(r => r.id.toString() === ticket.id);
                    const handleRowClick = () => {
                      if (report) {
                        navigate(`/project/${report.project_id}`, {
                          state: { project_name: report.project_name },
                        });
                      }
                    };
                    return (
                      <tr
                        key={ticket.id ?? idx}
                        onClick={handleRowClick}
                        className={cn(
                          "group transition-colors",
                          report ? "cursor-pointer hover:bg-indigo-50" : "hover:bg-slate-50/50"
                        )}
                      >
                        <td className="px-6 py-4 text-xs font-bold text-indigo-600">#{ticket.id}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-900">
                          {report && <span className="mr-1 text-indigo-400" title="Voir le détail">🔗</span>}
                          {ticket.project}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 truncate max-w-[200px]" title={ticket.subject}>
                          {ticket.subject}
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            {ticket.tracker}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">{ticket.date}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <StatusBadge status={ticket.status} />
                            <span className={cn(
                              "text-[10px] font-bold",
                              report?.is_effected ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {report?.is_effected ? "Rapport OK" : "À effectuer"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-8 mt-12">
        <div className="flex items-center justify-between border-t border-slate-200 py-8">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <FileText size={12} />
            <span>Système de reporting dynamique connecté à Redmine API</span>
          </div>
          <p className="text-[10px] text-slate-400">© 2026 Medianet — Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
