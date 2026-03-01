"""
report_generator.py
Pure Python PDF generation fallback with an integrated responsive template.
Now with granular status breakdown.
"""
import os
import io
from jinja2 import Template
from datetime import datetime
from collections import Counter

# A responsive, standard CSS template for the report.
REPORT_TEMPLATE = """
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Activité - {{ project_name }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 1100px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #137fec; }
        .header-info { text-align: right; }
        .header-info h1 { font-size: 20px; margin: 0; color: #0f172a; }
        .header-info p { margin: 5px 0; font-size: 14px; color: #64748b; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 40px; }
        .stat-card { padding: 15px; border-radius: 12px; color: white; display: flex; flex-direction: column; min-height: 80px; justify-content: center; }
        .stat-card .label { font-size: 12px; opacity: 0.9; margin-bottom: 5px; font-weight: 500; }
        .stat-card .value { font-size: 24px; font-weight: bold; }
        
        /* Dynamic Status Colors */
        .color-0 { background-color: #4f46e5; } /* Indigo */
        .color-1 { background-color: #059669; } /* Emerald */
        .color-2 { background-color: #d97706; } /* Amber */
        .color-3 { background-color: #7c3aed; } /* Violet */
        .color-4 { background-color: #dc2626; } /* Red */
        .color-5 { background-color: #0891b2; } /* Cyan */
        .color-6 { background-color: #475569; } /* Slate */
        
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; display: flex; align-items: center; }
        .section-title::before { content: ""; width: 4px; height: 18px; background: #137fec; margin-right: 10px; border-radius: 2px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        th { background-color: #f8fafc; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .badge { padding: 4px 8px; border-radius: 99px; font-size: 10px; font-weight: bold; display: inline-block; }
        .badge-priority-high { background-color: #fee2e2; color: #b91c1c; }
        
        footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8; }
        
        @media (max-width: 600px) {
            header { flex-direction: column; text-align: center; }
            .header-info { text-align: center; margin-top: 20px; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">Medianet Maintenance</div>
            <div class="header-info">
                <h1>Rapport d'Activité</h1>
                <p>Projet: <strong>{{ project_name }}</strong></p>
                <p>Période: {{ date_from }} au {{ date_to }}</p>
                <p>Généré le: {{ generated_at }}</p>
            </div>
        </header>

        <div class="section-title">Résumé des indicateurs</div>
        <div class="stats-grid">
            <div class="stat-card color-0">
                <span class="label">Total Tickets</span>
                <span class="value">{{ total_tickets }}</span>
            </div>
            {% for status, count in status_counts.items() %}
            <div class="stat-card color-{{ (loop.index % 6) + 1 }}">
                <span class="label">{{ status }}</span>
                <span class="value">{{ count }}</span>
            </div>
            {% endfor %}
        </div>

        <div class="section-title">Détail des Interventions</div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Titre</th>
                    <th>Tracker</th>
                    <th>Statut</th>
                    <th>Priorité</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {% for t in tickets %}
                <tr>
                    <td style="font-weight: bold; color: #4f46e5;">#{{ t.id }}</td>
                    <td>{{ t.subject }}</td>
                    <td>{{ t.tracker }}</td>
                    <td>
                        <span class="badge" style="background-color: #f1f5f9; color: #475569;">
                            {{ t.status }}
                        </span>
                    </td>
                    <td>
                        <span class="badge {% if t.priority in ['Critique', 'Urgente', 'Haute', 'Majeure'] %}badge-priority-high{% endif %}" style="{% if not t.priority in ['Critique', 'Urgente', 'Haute', 'Majeure'] %}background-color: #dcfce7; color: #15803d;{% endif %}">
                            {{ t.priority }}
                        </span>
                    </td>
                    <td>{{ t.created_on }}</td>
                </tr>
                {% else %}
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">Aucun ticket sur cette période.</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>

        <footer>
            © 2026 Medianet - Tous droits réservés - Rapport généré via Redmine API
        </footer>
    </div>
</body>
</html>
"""

def prepare_context(project_name, date_from, date_to, tickets):
    # Dynamically count all statuses
    counts = Counter(t.get('status', 'Inconnu') for t in tickets)
    # Sort them by count or name
    sorted_counts = dict(sorted(counts.items(), key=lambda item: item[1], reverse=True))

    return {
        'project_name': project_name,
        'date_from': date_from,
        'date_to': date_to,
        'generated_at': datetime.now().strftime('%d/%m/%Y à %H:%M'),
        'total_tickets': len(tickets),
        'status_counts': sorted_counts,
        'tickets': tickets,
    }

def generate_pdf(
    project_id: int,
    project_name: str,
    date_from: str,
    date_to: str,
    tickets: list[dict],
) -> bytes:
    context = prepare_context(project_name, date_from, date_to, tickets)
    template = Template(REPORT_TEMPLATE)
    html_content = template.render(**context)

    try:
        from xhtml2pdf import pisa
        result = io.BytesIO()
        pisa_status = pisa.CreatePDF(src=io.StringIO(html_content), dest=result)
        if not pisa_status.err:
            return result.getvalue()
    except ImportError:
        pass

    return html_content.encode('utf-8')

def get_report_html(
    project_name: str,
    date_from: str,
    date_to: str,
    tickets: list[dict],
) -> str:
    context = prepare_context(project_name, date_from, date_to, tickets)
    template = Template(REPORT_TEMPLATE)
    return template.render(**context)
