# 🍔 El Bahia Fast Food — Application de Commande à Table par QR Code 🇩🇿

Application web moderne, fluide et complète pour restaurant / fast-food algérien permettant aux clients installés à table de scanner un QR Code, d'explorer le menu avec photos haute définition et personnalisations (viandes, sauces DZ, gratinage), de commander en direct et de suivre la préparation de leur repas en temps réel.

Comprend également un **KDS (Kitchen Display System)** pour l'équipe en cuisine, un gestionnaire d'appels serveurs, un générateur de chevalets de table avec QR codes imprimables et un tableau de bord des recettes.

---

## ✨ Fonctionnalités Clés

### 📱 Côté Client (Mobile-First & Responsive)
- **Accès Instantané par QR Code** : Le client scanne le QR code posé sur sa table (ex: `/?table=5`) et accède directement à l'application avec sa table déjà préconfigurée.
- **Carte Fast-Food Algérienne Authentique** :
  - **Tacos Algériens** : Le Boss (2 viandes), Tacos Gratiné Royal (3 viandes) avec sauce fromagère onctueuse maison.
  - **Chawarma & Plats** : Sandwich chawarma syrienne roulée dans pain saj, Assiette chawarma royale avec crème d'ail toum.
  - **Smash Burgers** : Le Smash Casbah (Double Cheese pur bœuf), Le Crispy DZ Burger au poulet pané piquant.
  - **Spécialités DZ** : Karantika oranaise au cumin & harissa, Sandwich Gratiné Spécial DZ, Pizza carrée de quartier.
  - **Barquettes & Sides** : Barquette Cheesy frites & poulet mariné, Tenders croustillants maison, Frites fraîches.
  - **Boissons Locales Incontournables** : Hamoud Boualem Selecto 33cl, Hamoud Blanche, Eau minérale Lalla Khedidja.
  - **Desserts** : Tiramisu maison spéculoos & caramel, Crêpe chocolat banane.
- **Tiroir de Personnalisation Poussée** :
  - Choix du format (M, L, XL, Formule Menu).
  - Choix des viandes (Poulet mariné, Viande hachée, Tenders, Cordon bleu).
  - Sauces algériennes au choix (Sauce Algérienne, Fromagère, Harissa, Samouraï, Toum, Barbecue).
  - Suppléments gourmands (Gratiné au four cheddar/mozzarella, Galette cheddar, Œuf au plat coulant, Jalapeños).
  - Remarques spéciales en cuisine ("Sans oignons", "Sauce bien piquante").
- **Panier & Commande Fluide** :
  - Choix Sur Place (Table #X) ou À Emporter.
  - Animations de célébration (confetti) et retours sonores via Web Audio API.
- **Suivi de Commande en Direct (Live Stepper)** :
  - 1. 📋 Commande reçue
  - 2. 🍳 En préparation en cuisine
  - 3. 🛎️ Prête à servir
  - 4. ✅ Servie & Dégustée
  - Synchronisation automatique toutes les 3 secondes.
- **Boutons de Service à Table** :
  - 🔔 *Appeler un serveur* (Notification instantanée en cuisine).
  - 🧾 *Demander l'addition* (Règlement espèces, CIB ou Dahabia).

---

### 👨‍🍳 Côté Équipe Cuisine & Salle (`/admin`)
- **KDS (Kitchen Display System) Kanban** :
  - Colonnes dynamiques : *Nouvelles Commandes (Reçues)* ➜ *En Cuisine (Préparation)* ➜ *Prêtes à Servir* ➜ *Historique*.
  - Transition en 1 clic : "Passer en cuisine 🍳", "Marquer Prête 🛎️", "Servie & Payée ✅".
  - Signal sonore carillon à chaque nouvelle commande entrante.
  - Mise en évidence des consignes spéciales (ex: *⚠️ SANS OIGNONS*).
- **Gestionnaire d'Appels Serveur** :
  - Liste en temps réel des tables demandant l'addition ou de l'aide avec bouton d'acquittement.
- **Générateur de QR Code pour les Tables** :
  - Sélection de n'importe quelle table (1 à 30, terrasse...).
  - Génération dynamique du QR code vectoriel.
  - Modèle de chevalet de table imprimable prêt à poser en salle (*"Scannez pour Explorer & Commander"*).
  - Bouton d'impression automatique avec feuille de style print dédiée.
- **Gestion des Stocks** : Activation/désactivation en temps réel des plats en rupture.
- **Statistiques & Recettes** : Total des ventes du jour en DA, nombre de couverts et top 5 des plats.

---

## 🛠️ Architecture & Stack Technique

- **Framework** : Next.js 16 (App Router, Server Components + Client Components)
- **Langage** : TypeScript 5 (Typage strict de bout en bout)
- **Styles & Animations** : Tailwind CSS v4, PostCSS, animations micro-interactions et célébrations Confetti
- **Icônes** : Lucide React
- **Audio tactile** : Synthétiseur Web Audio API (aucun fichier audio externe requis)
- **Persistance** : Couche de stockage JSON atomique avec Service Repository (`src/lib/storage.ts`)
- **Tests** : Vitest, React Testing Library, JSDOM (17 tests automatisés couvrant règles métier, API et composants)
- **Conteneurisation** : Multi-stage Dockerfile et Docker Compose

---

## 🚀 Démarrage Rapide

### Option 1 : Avec Docker Compose (Recommandé)

```bash
# Démarrer l'application
docker compose up -d

# L'application est disponible sur :
# http://localhost:3000          (Vue Client)
# http://localhost:3000/?table=5  (Client Table #5)
# http://localhost:3000/admin    (Console Cuisine / KDS)
```

Pour arrêter le conteneur :
```bash
docker compose down
```

---

### Option 2 : En Local avec Node.js

Prérequis : Node.js 20+ ou 22+.

```bash
# Installer les dépendances
npm install

# Lancer les tests unitaires et d'intégration
npm test

# Lancer en mode développement
npm run dev

# Ou compiler pour la production
npm run build
npm start
```

---

## 🧪 Tests Automatisés

Le projet dispose d'une suite de tests complète garantissant le bon fonctionnement des règles métier et des routes d'API :

```bash
npm test
```

### Couverture :
1. `src/test/storage.test.ts` : Création de commandes, calcul des totaux, cycle de vie du statut, appels serveurs, rupture de stock, métriques de ventes.
2. `src/test/api.test.ts` : Endpoints REST (`/api/menu`, `/api/orders`, `/api/waiter-call`, `/api/stats`).
3. `src/test/components.test.tsx` : Rendu des cartes de menu, sélection des catégories, panier et calculs de quantité.

---

## 📁 Structure du Projet

```text
restaurant/
├── data/                      # Stockage persistant des commandes et appels
├── public/                    # Fichiers statiques et logos
├── src/
│   ├── app/
│   │   ├── admin/             # Console Cuisine KDS, QR Generator & Stats
│   │   ├── api/               # Routes API REST (menu, orders, waiter-call, stats)
│   │   ├── order/[id]/        # Écran de suivi de commande en direct
│   │   ├── globals.css        # Styles globaux & animations
│   │   ├── layout.tsx         # Layout racine avec CartProvider
│   │   └── page.tsx           # Page d'accueil & exploration du menu
│   ├── components/
│   │   ├── CartDrawer.tsx     # Tiroir du panier et confirmation
│   │   ├── CategoryNav.tsx    # Navigation par catégories scrollable
│   │   ├── ItemDetailModal.tsx# Tiroir de personnalisation du plat
│   │   ├── MenuCard.tsx       # Carte de plat avec badges et prix en DA
│   │   ├── Navbar.tsx         # Barre de navigation et badge de table
│   │   ├── OrderTracker.tsx   # Stepper visuel de suivi de commande
│   │   ├── TableModal.tsx     # Sélecteur de table
│   │   └── WaiterCallModal.tsx# Modal d'appel serveur / demande addition
│   ├── context/
│   │   └── CartContext.tsx    # État global du panier et session de table
│   ├── lib/
│   │   ├── menu-data.ts       # Menu algérien complet avec photos et tarifs
│   │   ├── sound.ts           # Synthétiseur de sons Web Audio API
│   │   └── storage.ts         # Repository pattern et persistance
│   ├── test/                  # Suite de tests Vitest
│   └── types/                 # Définitions TypeScript
├── Dockerfile                 # Image Docker multi-stage optimisée
├── docker-compose.yml         # Déploiement Docker avec volume persistant
└── vitest.config.mts          # Configuration des tests
```

---

## 📄 Licence
Projet réalisé sous licence MIT.
