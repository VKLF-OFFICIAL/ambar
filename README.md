# Ambar

Aplicación web (PWA) gratuita y privada para acompañar a quien quiere dejar una adicción, basada en la neurociencia del hábito y en Terapia Cognitivo-Conductual.

- **Contador en tiempo real** con hitos sin final (12 h, 24 h, 3 días… y cada aniversario y cada 100 días).
- **Modo calma (SOS)**: respiración 4-7-8, enraizamiento 5-4-3-2-1, tus por qués y distracciones; teléfonos de ayuda por país.
- **Diario rápido**: intensidad, emoción y entorno con unos toques; patrones de detonantes.
- **Recaída compasiva**: reflexión guiada que conserva tu progreso total.
- **Por qués y ahorro** de dinero y tiempo, **pacto diario**, **calendario** y **cómo se recupera tu cuerpo** (tabaco y alcohol).
- **Privacidad total**: todo se guarda en `localStorage` del dispositivo; PIN opcional; copia de seguridad en JSON. Sin cuentas, sin servidor, sin analíticas.
- Español e inglés, modo oscuro por defecto y modo claro, accesible y funciona sin conexión.

## Desarrollo

Requiere Node 20 o superior.

```bash
npm install
npm run dev       # servidor de desarrollo
npm run check     # tipos + tests + lint
npm run build     # compilación de producción en dist/
npm run preview   # sirve dist/ localmente
```

## Despliegue

`dist/` es un sitio estático: súbelo a cualquier hosting estático (Netlify, Vercel, Cloudflare Pages, GitHub Pages…). Debe servirse por HTTPS para que la PWA sea instalable y funcione sin conexión.

## Estructura

- `src/lib/` — lógica pura (tiempo, hitos, rachas, ahorro, patrones, calendario, PIN, copias).
- `src/store/` — estado global con Zustand persistido (`ambar-store`).
- `src/data/` — catálogo de adicciones, teléfonos de ayuda (con fuentes), línea de salud, distracciones.
- `src/i18n/` — textos en español (`es.ts`, fuente) e inglés (`en.ts`).
- `src/components/` — pantallas y componentes.
- `docs/superpowers/` — documento de diseño y plan de implementación.

## Antes del lanzamiento público

- Que un profesional sanitario revise `src/data/healthTimeline.ts`, los textos `health.*` y el aviso médico (`onboarding.medical*`).
- Volver a verificar los teléfonos de `src/data/helplines.ts`.
- Registrar dominio y marca.

> Ambar es una herramienta de autoayuda y no sustituye la atención de un profesional sanitario.
