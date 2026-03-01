import { Ticket, StatusData } from './types';

export const TICKETS: Ticket[] = [
  { id: 'TKT-1001', title: 'BNDA : Ajustement balance', project: 'BNDA', subject: 'Ajustement balance', tracker: 'Documentation et reporting', type: 'Bug', status: 'Résolu', date: '28 janv. 2025', priority: 'Critique' },
  { id: 'TKT-1002', title: 'ATB : Reporting mensuel', project: 'ATB', subject: 'Reporting mensuel', tracker: 'Documentation et reporting', type: 'Performance', status: 'En cours', date: '27 janv. 2025', priority: 'Majeure' },
  { id: 'TKT-1003', title: 'BH BANK : Backup SSL', project: 'BH BANK', subject: 'Backup SSL', tracker: 'Documentation et reporting', type: 'Maintenance', status: 'Clôturé', date: '26 janv. 2025', priority: 'Mineure' },
  { id: 'TKT-1004', title: 'AMEN BANK : Synchro panier', project: 'AMEN BANK', subject: 'Synchro panier', tracker: 'Bug', type: 'Bug', status: 'Test', date: '25 janv. 2025', priority: 'Majeure' },
  { id: 'TKT-1005', title: 'DASHBOARD : Auth OAuth', project: 'DASHBOARD', subject: 'Auth OAuth', tracker: 'Bug', type: 'Bug', status: 'Bloqué', date: '24 janv. 2025', priority: 'Critique' },
];

export const STATUS_COLORS = {
  Ouverts: '#60A5FA',
  Clôturés: '#10B981',
  Validation: '#A78BFA',
  Test: '#6366F1',
  Bloqués: '#F87171',
  'En cours': '#FBBF24',
};

export const STATUS_DISTRIBUTION: StatusData[] = [
  { name: 'Ouverts', value: 8, color: STATUS_COLORS.Ouverts },
  { name: 'Clôturés', value: 28, color: STATUS_COLORS.Clôturés },
  { name: 'Validation', value: 4, color: STATUS_COLORS.Validation },
  { name: 'Test', value: 5, color: STATUS_COLORS.Test },
  { name: 'Bloqués', value: 2, color: STATUS_COLORS.Bloqués },
  { name: 'En cours', value: 12, color: STATUS_COLORS['En cours'] },
];

export const PRIORITY_DISTRIBUTION = [
  { name: 'Critique', value: 6, color: '#EF4444' },
  { name: 'Majeure', value: 15, color: '#F97316' },
  { name: 'Mineure', value: 26, color: '#10B981' },
];
