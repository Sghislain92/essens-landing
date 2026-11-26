# Ess'Sens · landing page immersive

Maquette de démonstration réalisée par WEDE pour **Ess'Sens**, liqueur artisanale fruits rouges et épices (Bénin).

## Contenu

- **La liqueur** : scène collante pilotée par le scroll (GSAP ScrollTrigger + Lenis), bouteille détourée, fruits et épices en couches.
- **Le service** : scène canvas 2D. La bouteille est dévissée, versée dans un verre avec glaçons ; le niveau baisse dans la bouteille et monte dans le verre.
- **Cocktails** : défilement horizontal sur grand écran, empilé sur mobile.
- **Commande** : boutons WhatsApp avec message pré-rédigé.
- Contrôle d'âge à l'entrée et mention légale alcool.

## Structure

```
index.html
assets/css/input.css   ← source Tailwind (à modifier)
assets/css/style.css   ← CSS compilé (servi en production)
assets/js/main.js      ← animations de la page
assets/js/service.js   ← scène « Le service » (canvas)
assets/img/            ← visuels WebP
tailwind.config.js
```

## Développement

```bash
npm install
npm run dev     # recompile style.css à chaque modification
npm run build   # version minifiée
```

Le site est statique : `style.css` est déjà compilé, donc il fonctionne tel quel sur GitHub Pages, Netlify ou un hébergement mutualisé.

## À valider avec la cliente

- Numéro WhatsApp utilisé : +229 01 67 15 66 85
- Prix de la liqueur 500 ml (non communiqué)
- Lien exact du compte Instagram « Essens by mc »
- Fichier source du logo (redessiné en SVG à partir d'un visuel)
