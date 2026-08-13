# Heyama Dev Technical Test - Backend API & Web Application

Ce dépôt contient la solution complète pour le test technique développeur de **Heyama**.

## Architecture du Projet

Le projet est structuré en deux applications complémentaires :
- **`backend/`** : API REST & WebSocket en **NestJS**, base de données **MongoDB**, stockage d'images sur **S3 (hors Amazon)**, et synchronisation temps réel avec **Socket.IO**.
- **`web/`** : Application web moderne en **Next.js 14 (App Router)** avec **shadcn/ui**, **Tailwind CSS**, et client **Socket.IO** pour les mises à jour instantanées.

---

## 🌟 Fonctionnalités

1. **Création d'objets (`POST /objects`)**
   - Téléversement d'image vers un bucket S3 compatible (ex: Cloudflare R2, Supabase Storage S3, MinIO, Backblaze B2).
   - Enregistrement des métadonnées (`title`, `description`, `imageUrl`, `createdAt`) dans MongoDB.
   - Diffusion instantanée de l'événement `object:created` via Socket.IO à tous les clients connectés.

2. **Liste des objets (`GET /objects`)**
   - Récupération de tous les objets triés par date décroissante.
   - Affichage réactif dans une grille avec prévisualisation des images S3.

3. **Détails d'un objet (`GET /objects/:id`)**
   - Affichage complet du titre, de la description, de l'image haute résolution, de la date et de l'ID.

4. **Suppression d'un objet (`DELETE /objects/:id`)**
   - Suppression du fichier image dans le bucket S3.
   - Suppression du document dans MongoDB.
   - Diffusion instantanée de l'événement `object:deleted` via Socket.IO.

5. **Synchronisation Temps Réel (Socket.IO)**
   - Dès qu'un objet est créé ou supprimé depuis n'importe quel écran ou client API, il apparaît ou disparaît immédiatement sur l'application Web sans recharger la page.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- Une instance **MongoDB** (MongoDB Atlas gratuit ou instance locale `mongodb://localhost:27017/heyama`)
- Un bucket **S3 compatible non-Amazon** (Cloudflare R2, Supabase S3, MinIO, etc.)

---

### 1. Démarrer le Backend (NestJS)

```bash
cd backend

# 1. Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec votre URL MongoDB et vos accès S3

# 2. Démarrer en mode développement
npm run start:dev
```

Le serveur démarre sur **`http://localhost:3001`**.

---

### 2. Démarrer l'Application Web (Next.js)

```bash
cd web

# 1. Démarrer le serveur Next.js
npm run dev
```

L'application web est accessible sur **`http://localhost:3000`**.

---

## ⚙️ Configuration du Stockage S3 (Non-Amazon)

Dans `backend/.env`, configurez votre fournisseur S3 préféré :

### Exemple : Cloudflare R2 (Recommandé & Gratuit)
```env
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<VOTRE_R2_ACCESS_KEY_ID>
S3_SECRET_ACCESS_KEY=<VOTRE_R2_SECRET_ACCESS_KEY>
S3_BUCKET_NAME=heyama-objects
S3_PUBLIC_URL_PREFIX=https://pub-<ID>.r2.dev
S3_FORCE_PATH_STYLE=false
```

### Exemple : Supabase Storage (S3 API)
```env
S3_ENDPOINT=https://<PROJECT_REF>.supabase.co/storage/v1/s3
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<VOTRE_ACCESS_KEY_ID>
S3_SECRET_ACCESS_KEY=<VOTRE_SECRET_ACCESS_KEY>
S3_BUCKET_NAME=heyama-objects
S3_PUBLIC_URL_PREFIX=https://<PROJECT_REF>.supabase.co/storage/v1/object/public/heyama-objects
S3_FORCE_PATH_STYLE=true
```

### Exemple : MinIO (Local)
```env
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_BUCKET_NAME=heyama-objects
S3_PUBLIC_URL_PREFIX=http://localhost:9000/heyama-objects
S3_FORCE_PATH_STYLE=true
```

---

## 📡 Documentation API REST

| Méthode | Route | Description | Corps de requête |
|---|---|---|---|
| `POST` | `/objects` | Créer un objet | `multipart/form-data` : `title`, `description`, `file` (image) |
| `GET` | `/objects` | Lister tous les objets | - |
| `GET` | `/objects/:id` | Récupérer un objet par son ID | - |
| `DELETE` | `/objects/:id` | Supprimer un objet et son image S3 | - |

### Événements WebSocket (Socket.IO)

- `object:created` : Émis lors de la création d'un nouvel objet (payload : l'objet créé).
- `object:deleted` : Émis lors de la suppression d'un objet (payload : `{ id: string }`).

---

## 🧪 Tests & Démonstration

1. Ouvrez `http://localhost:3000` dans deux fenêtres de navigateur distinctes (ou un onglet normal et un onglet privé).
2. Cliquez sur **"Ajouter un objet"** dans la première fenêtre, choisissez une image, saisissez un titre et une description, puis validez.
3. Observez l'objet apparaître instantanément dans la deuxième fenêtre avec notification en temps réel sans rafraîchir la page !
4. Supprimez l'objet : il disparaît instantanément sur toutes les fenêtres.
