# FitoGramme 🇹🇳 🏋️‍♂️

> **Plateforme d'assistance IA pour coachs sportifs, nutritionnistes et leurs athlètes.**  
> Journalisation des repas en **Darija tunisienne**, recommandations personnalisées et suivi de programmes d'entraînement.

---

## 🌟 Points Clés & Fonctionnalités

1. **Journal Alimentaire en Darija Tunisienne** (`/log-meal`) :
   - Saisie en langage naturel (ex: *"Klit sahn kafteji fi dar m3a 2 3dham w chwaya khobz ch3ir"* ou *"Bsisa b zit zitouna"*).
   - Suggestions en 1-clic pour les plats typiques tunisiens (Bsisa, Kafteji, Couscous, Lablabi, Ojja, Salade méchouia, Tajine).
   - Détection et estimation IA des calories, protéines, glucides et lipides avec score de confiance.
   - **Contrôle utilisateur** : les analyses IA sont toujours présentées comme des estimations ajustables et corrigibles par l'athlète avant validation.

2. **Espace Client / Athlète** (`/dashboard/client`) :
   - Jauge calorique interactive du jour et répartition des macronutriments (Protéines, Glucides, Lipides).
   - Historique des repas avec métadonnées nutritionnelles et timestamps.
   - Suivi du programme sportif actif en cours.

3. **Espace Coach Sportif** (`/dashboard/coach`) :
   - Tableau de bord des athlètes actifs et assiduité.
   - Création et paramétrage de programmes d'entraînement modulaires (`/workouts`).
   - Assignation directe de routines à chaque athlète et consultation de leurs journaux alimentaires (`/dashboard/coach/clients`).

4. **Espace Nutritionniste** (`/dashboard/nutritionist`) :
   - Création de plans alimentaires hebdomadaires équilibrés (`/dashboard/nutritionist/plans`).
   - Suivi des dossiers diététiques des patients et envoi de recommandations cliniques ciblées (`/dashboard/nutritionist/clients`).

5. **Avertissements & Rigueur Médicale** :
   - Présence systématique de bandeaux de rappel précisant que les estimations nutritionnelles de l'IA sont indicatives et ne se substituent jamais à un suivi médical.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v18.17+ ou v20+)
- npm ou yarn

### Installation & Lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/haddadahmedelyess-dev/Fitogramme.git
cd Fitogramme

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

L'application est disponible immédiatement sur **[http://localhost:3000](http://localhost:3000)**.

### Build de Production

```bash
npm run build
npm start
```

---

## 🔑 Mode Démo & Test en 1-Clic

Sur la page d'authentification (`/auth`), une section **"Accès Démo Rapide (1-clic)"** est mise à votre disposition pour tester instantanément chaque profil sans avoir à créer de compte :

| Rôle | Profil Démo | Accès direct |
|---|---|---|
| **Client** | Youssef Trabelsi | Bouton `Client` |
| **Coach** | Coach Karim Mansour | Bouton `Coach` |
| **Nutritionniste** | Dr. Sonia Ben Salem | Bouton `Nutritionniste` |

---

## 🛠️ Stack Technique

- **Framework** : Next.js 16 (App Router, Turbopack)
- **Langage** : TypeScript (Typage strict)
- **Design System** : CSS Vanilla sur mesure (Design Tokens HSL, Dark Mode, Micro-animations, Accessibilité WCAG AA)
- **Icônes** : Lucide React
- **Client API** : Client typé avec support double (Backend REST via `NEXT_PUBLIC_API_URL` + Fallback local persistant pour tests fluides hors-ligne).

---

## 🌐 Variables d'Environnement

Pour connecter un backend existant (ex: FastAPI ou Django), créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

En l'absence de variable, l'application fonctionne de manière autonome en mode démo interactif.
