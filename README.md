# Aficionados Nantes — Site vitrine

Site one-page pour le club privé **Aficionados Nantes**, dédié à l'art du cigare.
Démo statique pensée pour GitHub Pages — 100 % gratuit, sans build.

## Aperçu

- **Demo live :** https://virtualvaultboy-pixel.github.io/aficionados-nantes/
- **Stack :** HTML / CSS / JS pur — aucun build
- **Libs externes (via CDN) :**
  - [Lenis](https://github.com/darkroomengineering/lenis) — smooth scroll
  - [GSAP + ScrollTrigger](https://gsap.com/) — animations scroll
  - [Phosphor Icons](https://phosphoricons.com/) — iconographie
  - Google Fonts : Cormorant Garamond + Inter

## Structure

```
aficionados-nantes/
├── index.html        # Page unique
├── styles.css        # Tous les styles
├── script.js         # Age gate + Lenis + GSAP + canvas particules + forms
├── robots.txt        # SEO
├── sitemap.xml       # SEO
└── README.md
```

## Sections du site

1. **Age gate légal** — vérification 18+ avec mémorisation locale
2. **Hero** — inscription en action principale + canvas particules dorées
3. **Le Cercle** — pitch + 3 piliers (Dégustation, Transmission, Confidentialité)
4. **Soirées & Événements** — agenda + offre "Organiser votre soirée cigare"
5. **Le Journal** — 4 articles blog
6. **Vidéos** — lien vers la chaîne YouTube
7. **Rejoindre** — formulaire contact long

## Déployer sur GitHub Pages (5 minutes)

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Créer le repo et pousser
gh repo create aficionados-nantes --public --source=. --remote=origin --push

# Activer GitHub Pages
gh api -X POST /repos/virtualvaultboy-pixel/aficionados-nantes/pages \
  -f source[branch]=main -f source[path]=/
```

Le site sera dispo sous 1-2 minutes à :
**https://virtualvaultboy-pixel.github.io/aficionados-nantes/**

## À configurer plus tard (quand le client signe)

### 1. Formulaires (Formspree — gratuit jusqu'à 50/mois)
1. Créer un compte sur https://formspree.io
2. Créer un formulaire, récupérer l'ID (ex: `mzbqkjev`)
3. Dans `index.html`, remplacer les **2** occurrences de `YOUR_FORM_ID` par cet ID

### 2. Image de partage social
Créer un fichier `og-image.jpg` (1200×630 px) à la racine du repo — photo cigare + logo + tagline en or sur fond sombre.

### 3. Analytics (optionnel)
Dans `index.html`, décommenter la ligne `<script defer data-domain=...>` et ajuster :
- **Plausible** (9 €/mois, RGPD-friendly, FR) → garder tel quel après abonnement
- **GA4** → remplacer par le snippet Google Analytics
- **Cloudflare Web Analytics** (gratuit) → remplacer par leur snippet

### 4. Domaine personnalisé
Dans **Settings → Pages** du repo GitHub, ajouter le domaine custom (ex: `aficionados-nantes.fr`).
Puis dans le code, faire un find-and-replace de `virtualvaultboy-pixel.github.io/aficionados-nantes` → ton vrai domaine (canonical, OG, JSON-LD, sitemap.xml, robots.txt, README).

### 5. Vraies photos
Quand le client envoie des photos :
- Soit héberger sur Cloudinary et remplacer les `<div class="post-img post-img-X">` par `<img src="...">`
- Soit mettre les photos en local dans `assets/img/` et les référencer

## Accessibilité

- `prefers-reduced-motion` géré (toutes les animations désactivées si l'OS le demande)
- Aria labels sur la nav et le burger
- Contraste AAA sur le texte principal
- HTML sémantique (`<header>`, `<nav>`, `<section>`, `<article>`, `<footer>`)

## Licence

© Aficionados Nantes — Tous droits réservés.
Code source produit par **Deponchy Studio** pour démo client.
