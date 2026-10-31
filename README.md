# Mumuse

Un tableau de bord de charts réorganisables : chaque chart est un bloc que l'on déplace, redimensionne et verrouille sur une grille, en disposition automatique ou libre, avec cinq thèmes.

**React 19 · TypeScript · Vite · MUI · MUI X Charts · react-grid-layout**

## Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # vérifie les types puis construit la version de production
npm run lint
```

## Documentation

📖 **[Comment l'application est construite](docs/ARCHITECTURE.md)** : les couches, l'organisation des fichiers, le fonctionnement des dispositions et du mode Modifier, avec des schémas, et un guide pour modifier l'application.

## En bref

```
src/
├── components/   ce qu'on voit à l'écran
├── hooks/        état et logique
├── lib/          calculs purs
├── api/          seul accès aux données (aujourd'hui : un faux serveur)
├── data/         thèmes et types de charts
└── types/        définitions TypeScript
```
