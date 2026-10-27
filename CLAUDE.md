# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

PWA "Weldinger Schweiß-Assistent": zeigt Einstellwerte für den WELDINGER MWPE 209 HF/AC pro Combi PFC und den Helm AH-800. Kein Backend, alles läuft offline im Browser. Stack: React + TypeScript + MUI + Vite, Tests mit Vitest.

## Befehle

- `npm run dev` – Entwicklungsserver
- `npm test` – alle Tests einmal (`npx vitest run src/domain/helm.test.ts -t "WIG"` für einen Test)
- `npm run test:watch` – Tests im Watch-Modus
- `npm run build` – Typprüfung + Produktionsbuild (erzeugt `dist/sw.js` und das Manifest)
- `npm run build && npm run preview` – PWA/Offline testen (im `dev`-Server läuft kein Service Worker)
- `node scripts/make-icons.mjs` – PWA-Icons in `public/icons/` neu erzeugen

## Architektur

- `src/domain/` – reine Fachlogik ohne UI (`helm.ts`: DIN-Stufe, Empfindlichkeit, Verzögerung; `weldCalc.ts` folgt). Wird testgetrieben entwickelt.
- `docs/Parameterquellen.md` – verbindliche Werte aus den Handbüchern. Hat Vorrang vor `docs/SchweißApp.md` und der Entwickler-Übergabe. Werte ohne Handbuchquelle sind als Richtwert zu kennzeichnen.
- `docs/arc42/arc42.md` – Architektur und Entscheidungen (ADR).

## Konventionen

- Sprache in UI und Doku: Deutsch, Dezimalkomma.
- Bei Helm-Grenzwerten gilt am Grenzwert die dunklere Stufe (Sicherheit).
- Kein MIG/MAG-Aluminium (Handbuch: nicht vorgesehen), Alu nur WIG AC.
