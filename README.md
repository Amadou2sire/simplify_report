# 📊 Rapport d'Activité Automatique — Redmine

Outil de reporting automatique qui parcourt les projets Redmine, identifie les tickets du tracker **"Documentation et reporting"** et détermine si le rapport d'activité est **effectué** ou **en attente** selon la date d'échéance.

## 🏗️ Structure du projet

```
p_07_report/
├── backend/               # API FastAPI (Python)
│   ├── main.py            # Application FastAPI + endpoints
│   ├── redmine_client.py  # Client Redmine API
│   ├── logic.py           # Logique métier (règle J+2)
│   ├── test_logic.py      # Tests unitaires
│   ├── .env               # Variables d'environnement (clés API)
│   └── venv/              # Environnement virtuel Python
└── frontend/              # Interface React (Vite + TypeScript)
    ├── src/
    │   ├── App.tsx        # Composant principal + fetch API
    │   ├── constants.ts   # Données de démo (fallback)
    │   └── types.ts       # Types TypeScript
    └── .env               # Variables frontend
```

---

## ⚙️ Prérequis

- **Python 3.10+**
- **Node.js 18+**
- Accès à l'API Redmine (URL + clé API)

---

## 🚀 Installation & Démarrage

### 1. Cloner / Ouvrir le projet

```powershell
cd c:/Users/formation/Downloads/saas/p_07_report
```

### 2. Backend — FastAPI

```powershell
cd backend

# (Première fois uniquement) Créer le venv et installer les dépendances
python -m venv venv
.\venv\Scripts\pip install fastapi uvicorn requests python-dotenv pandas

# Configurer les accès Redmine
# Éditer le fichier backend/.env :
# REDMINE_BASE_URL='https://votre-instance.redmine.com'
# REDMINE_API_KEY='votre_cle_api'

# Démarrer le serveur
.\venv\Scripts\python -m uvicorn main:app --reload --port 8000
```

✅ API disponible sur : **http://localhost:8000**  
📖 Documentation interactive : **http://localhost:8000/docs**

### 3. Frontend — React

```powershell
cd frontend

# (Première fois uniquement) Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

✅ Interface disponible sur : **http://localhost:5173**

---

## 🔑 Configuration `.env`

### `backend/.env`
```env
REDMINE_BASE_URL='https://maintenance.medianet.com.tn'
REDMINE_API_KEY='votre_cle_api_redmine'
```

---

## 🧠 Logique métier

### Règle des 2 jours

```
Si date_echeance > (aujourd'hui + 2 jours)
  → Statut : ✅ Effectué
Sinon
  → Statut : ⏳ Non effectué
```

### Fonctionnement

1. Le backend parcourt **tous les projets Redmine**
2. Il filtre les tickets avec le tracker **"Documentation et reporting"**
3. Pour chaque ticket, il compare la date d'échéance (due_date) avec **aujourd'hui + 2 jours**
4. Le frontend React interroge `GET /api/reports` et affiche les résultats

---

## 🌐 Endpoints API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/reports` | Liste tous les rapports avec leur statut |
| `GET` | `/docs` | Documentation Swagger interactive |

### Exemple de réponse `/api/reports`

```json
[
  {
    "id": 11852,
    "project_id": 123,
    "project_name": "BNDA",
    "title": "Elaboration Rapport d'activité",
    "due_date": "2026-03-15",
    "status": "Effectué",
    "is_effected": true
  }
]
```

---

## 🧪 Tests

```powershell
cd backend
.\venv\Scripts\python test_logic.py
```

---

## 📦 Dépendances Backend

| Package | Version | Usage |
|---|---|---|
| `fastapi` | ≥0.135 | Framework API |
| `uvicorn` | ≥0.41 | Serveur ASGI |
| `requests` | ≥2.32 | Appels Redmine API |
| `python-dotenv` | ≥1.2 | Chargement du `.env` |
| `pandas` | ≥3.0 | Traitement des données |

---

## 🔄 Mode Fallback

Si le backend n'est pas accessible, le frontend affiche automatiquement un **bandeau d'avertissement** et utilise des **données de démonstration** issues de `constants.ts`.
