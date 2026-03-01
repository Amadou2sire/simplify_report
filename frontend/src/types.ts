export interface Ticket {
  id: string;
  title: string;
  project: string;
  subject: string;
  tracker: string;
  type: 'Bug' | 'Performance' | 'Maintenance' | 'Sécurité';
  status: 'Résolu' | 'En cours' | 'Clôturé' | 'Test' | 'Bloqué' | 'Validation' | 'Ouvert' | 'Nouveau' | 'Inconnu';
  date: string;
  priority: 'Critique' | 'Majeure' | 'Mineure';
}

export interface StatSummary {
  label: string;
  value: string | number;
  subtext: string;
  icon: string;
  color: string;
}

export interface StatusData {
  name: string;
  value: number;
  color: string;
}
