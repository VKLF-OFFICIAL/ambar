# Ambar — Documento de diseño

Fecha: 2026-10-17 · Estado: borrador para aprobación

> Convención: **[Decidido]** = lo decidió el usuario. **[Mi decisión]** = lo propuse yo y el usuario no lo ha contradicho; se puede revisar. Lo no marcado es base del encargo original.

---

## 1. Intención y porqué

Ambar es una aplicación web (SPA instalable como PWA) para ayudar a cualquier persona a superar una adicción —sustancias (tabaco, alcohol, cannabis…) o conductas (juego, pornografía, redes, compras…)—, apoyándose en la neurociencia del hábito (ciclo señal‑rutina‑recompensa, dopamina) y en Terapia Cognitivo‑Conductual.

Es un **producto público para mucha gente** [Decidido], **gratuito, sin anuncios y sin muros de pago** [Decidido]. Las apps existentes (I Am Sober, Quitzilla, QuitNow) son útiles, pero las quejas más repetidas son: muros de pago en lo esencial (incluida la ayuda en crisis), anuncios, logros que se acaban, recaídas tratadas como un "reset" frío, y falta de privacidad frente a otras personas que ven el móvil.

**Nombre:** Ambar [Decidido]. El ámbar del semáforo = el instante entre el impulso y la acción; también es el color de acento. En la interfaz se escribe "Ambar" (logotipo) [Mi decisión]. Dominio y marca los gestiona el usuario más adelante.

**Éxito:** que una persona en pleno antojo abra la app, la use 15‑20 minutos y el antojo pase sin recaer; y que tras una recaída vuelva a la app en lugar de abandonarla.

## 2. Objetivos, no‑objetivos y anti‑objetivos

**Objetivos**
- SOS accesible en un toque desde cualquier pantalla, que funcione sin conexión.
- Contador en tiempo real e hitos sin fin, con celebraciones.
- Diario rápido (sin apenas escribir) que revele patrones de detonantes.
- Panel de "por qués" y calculadora de dinero/tiempo ahorrado.
- Privacidad total: todo en el dispositivo del usuario.
- Español e inglés desde el primer día [Decidido].

**No‑objetivos (versión 1)**
- Comunidad / chat: el usuario lo resolverá por otra vía, fuera de la app [Decidido].
- Cuentas, servidor, sincronización entre dispositivos.
- Notificaciones push (requieren servidor). Ver §11.
- Diagnóstico o tratamiento médico.

**Anti‑objetivos (sería un fracaso aunque funcione)**
- Cualquier lenguaje que culpabilice: la palabra "fracaso" no aparece en la app [Mi decisión]. Tras una recaída lo primero visible es el progreso acumulado, no un cero.
- Sobreestimulación: colores de alarma, animaciones rápidas, ruido visual.
- Que el SOS obligue a decidir o a leer mucho en el peor momento.
- Que datos sensibles salgan del dispositivo (sin analíticas de terceros, sin fuentes ni scripts externos en tiempo de ejecución).

## 3. Restricciones técnicas

- **React + Vite + TypeScript estricto** (`strict: true`, sin `any`). Vite y no Next.js [Mi decisión]: no hay servidor, Vite es más ligero.
- **Zustand** con middleware `persist` sobre `localStorage`, con `version` y `migrate` para futuras migraciones de esquema.
- **Tailwind CSS** (tokens de color como variables CSS para modo oscuro/claro).
- **Framer Motion** para respiración, transiciones y celebraciones.
- **PWA** con service worker (vite-plugin-pwa): instalable y funcionamiento offline completo [Mi decisión]. El SOS debe abrir sin cobertura.
- Tipografías **autoalojadas** (no Google Fonts en tiempo de ejecución) por privacidad y offline.
- Accesibilidad: respeta `prefers-reduced-motion` (animaciones sustituidas por fundidos/estáticos), contraste AA, navegable con teclado, `aria-live` para las instrucciones de respiración.
- Mobile‑first; usable también en escritorio (columna central ~480px).
- Sin git salvo que el usuario lo pida [Decidido, regla general del usuario].
- Ubicación: `/mnt/almacen/AMBAR` [Decidido].

## 4. Dirección visual [Decidido: estilo B, "Cálido y humano"]

- **Modo oscuro por defecto**: fondo grafito cálido (≈ `#1a1715`, superficies `#221d1a`, bordes `#2b2522`), texto crema (`#f3ece4`), secundario taupe (`#a39589` / `#8c7e72`), **acento ámbar** (`#e8b07a`, degradado a `#f0c98f`).
- **Modo claro** [Mi decisión]: papel/crema (≈ `#f7f2ea`, superficies `#fffaf3`), texto grafito, mismo ámbar algo más oscuro para contraste (≈ `#b9783a`). Toggle en Ajustes y en la cabecera.
- Tipografía: **serif** para cifras grandes y titulares emocionales (Fraunces o similar), **sans** limpia para el resto (Inter o similar). Cifras con `tabular-nums`.
- Tarjetas redondeadas (≈18px), sin bordes duros, mucho aire, solo lo esencial por pantalla.
- **El botón SOS no es rojo**: es el elemento más destacado por tamaño y contraste (relleno ámbar), no por color de peligro.
- Navegación inferior: Inicio · Diario · Por qués · Progreso (+ Ajustes desde cabecera).
- Las maquetas aprobadas están en `.superpowers/brainstorm/` del scratchpad de la sesión (no críticas; esta sección manda).

## 5. Multi‑adicción [Mi decisión, aceptada]

- La persona empieza con **una** adicción en la bienvenida; puede añadir más luego.
- Cada adicción ("seguimiento") tiene su propio contador, hitos, dinero/tiempo, por qués y racha.
- El Dashboard muestra **solo el seguimiento activo**, con un selector discreto (pastilla "Alcohol ▾").
- SOS y Diario son globales; en el diario se etiqueta a qué seguimiento se refiere el antojo (por defecto el activo).
- Motivo clínico: policonsumo y adicción cruzada son frecuentes; varios contadores a la vez generan ansiedad.

## 6. Módulos

### 6.1 Bienvenida (onboarding)
Pasos cortos, uno por pantalla:
1. Idioma y **país** (ambos detectados de `navigator.language`, p. ej. `es-MX` → español/México; cambiables) y mensaje de bienvenida/privacidad ("Todo se queda en tu dispositivo"). El país determina los teléfonos de ayuda (§6.4) [Mi decisión].
2. ¿Qué quieres dejar? — lista de tipos predefinidos + "Otra" con nombre libre. Tipos v1: tabaco, vapeo, alcohol, cannabis, cocaína/estimulantes, opioides, sedantes/benzodiacepinas, juego/apuestas, pornografía, redes sociales/móvil, videojuegos, compras, comida (atracones), cafeína, otra.
2b. **Línea roja** (solo para comida, redes/móvil, videojuegos, compras y "otra"): donde la abstinencia total no es posible o deseable, la persona define en una frase qué conducta cuenta como recaída (p. ej. "un atracón", "una compra impulsiva no planificada", "más de 1 h seguida en redes"). Con chips de ejemplo para no tener que escribir. El contador mide tiempo sin cruzar esa línea. No hay "modo reducción" en v1 [Mi decisión].
2c. **Aviso de seguridad médica** (solo alcohol, opioides y sedantes/benzodiacepinas — añadir `sedatives` a los tipos): dejarlo de golpe puede provocar un síndrome de abstinencia peligroso; pantalla breve y no alarmista recomendando hablar con un médico antes de dejarlo o reducir, con botón "Entendido". También accesible desde Progreso [Mi decisión].
3. ¿Desde cuándo? — ahora mismo, o fecha y hora pasadas.
4. Coste y tiempo (opcional, saltable): gasto medio por día/semana y tiempo dedicado por día/semana. Moneda según idioma/región (€, $… editable).
5. Tus por qués (opcional): 1‑3 razones; se pueden añadir más luego.
6. Nombre o apodo (opcional) para saludos.
7. PIN opcional (ofrecido, no forzado).

### 6.2 Store global — `src/store/useAddictionStore.ts`
Responsabilidades:
- Estado persistido (ver §7).
- Cálculo del tiempo transcurrido: función pura `getElapsed(startISO, now) → { totalMs, days, hours, minutes, seconds }`. El "tic" de 1 s **no se persiste**: lo gestiona un hook `useNow(intervalMs)` en los componentes, para no escribir en `localStorage` cada segundo.
- Hitos: función pura `getMilestones(totalMs)` → alcanzados / próximo / progreso 0‑1.
- `addTracker`, `updateTracker`, `removeTracker`, `setActiveTracker`.
- `resetStreak(trackerId, relapseNote)`: guarda la racha actual en `streakHistory` (inicio, fin, duración, nota de reflexión), pone `startDate = ahora`, y devuelve un **mensaje compasivo** aleatorio de un banco i18n (sin culpa; refuerza lo aprendido y el progreso total). Calcula y conserva: racha más larga, media de rachas, total de tiempo libre acumulado.
- `addJournalEntry`, `deleteJournalEntry`.
- `addReason`, `updateReason`, `removeReason`, `reorderReasons`.
- `markMilestoneCelebrated(trackerId, milestoneId)` para no repetir celebraciones.
- Pacto diario: `makePledge(date)`, `closeDay(date, rating, note?)`.
- Ajustes: tema, idioma, moneda, PIN (hash), reducir movimiento forzado.
- Exportar / importar / borrar todo.

### 6.3 Dashboard — `src/components/Dashboard.tsx`
- Saludo + selector de seguimiento.
- **Contador grande**: días en serif enorme; debajo `h · min · s` en tiempo real.
- **Tarjeta próximo hito**: nombre, tiempo restante, barra de progreso.
- **Ahorro**: dinero y tiempo recuperados (si se configuraron); si no, invitación sutil a configurarlo.
- **Pacto diario** (de I Am Sober): por la mañana "Hoy me comprometo" (un toque); por la tarde/noche "¿Cómo fue el día?" (1‑5 caras + nota opcional). Ventanas horarias: pacto disponible todo el día hasta hacerlo; cierre a partir de las 18:00 [Mi decisión].
- **Botón SOS** (CTA principal, ancho completo).
- Si el seguimiento es una sustancia con línea de salud definida, un acceso a "Cómo se recupera tu cuerpo" (§6.8).
- Además, un **botón SOS flotante/persistente** accesible desde cualquier pantalla (en la barra inferior o cabecera).

### 6.4 SOS / Intervención en crisis — `src/components/SosIntervention.tsx` [Decidido: directo a respirar]
- Modal a pantalla completa que bloquea el resto (focus trap, `Esc` no cierra por accidente: cerrar pide un toque en ✕).
- Cabecera: "Modo calma" + **cronómetro** desde que se abrió (ver pasar los minutos ayuda a "surfear la ola") + ✕.
- Acceso siempre visible y discreto: **"Hablar con alguien ahora"** → teléfonos de ayuda **por país** (de Ajustes/onboarding), en una tabla de datos `helplines.ts` indexada por código ISO. v1 cubre como mínimo: España (024, 112), México, Argentina, Colombia, Chile, EE. UU. (988, 911), Reino Unido e Irlanda (116 123 Samaritans, 999/112), Canadá. País no cubierto → número de emergencias genérico 112/911 + enlace a findahelpline.com (único enlace externo, abierto solo si la persona lo pulsa). La persona puede añadir sus propios contactos (terapeuta, padrino), que aparecen primero [Mi decisión, aceptada]. **Los números se verifican contra fuentes oficiales al implementar.**
- **Recorrido guiado automático**, sin decisiones; cada paso tiene "Saltar" y "Siguiente":
  1. **Respiración 4‑7‑8**: círculo que se expande (inhala 4 s), se mantiene (sostén 7 s) y se contrae (exhala 8 s), palabra sincronizada ("Inhala… / Sostén… / Exhala…") y cuenta atrás grande. 4 ciclos (~76 s). Con `prefers-reduced-motion`: cambio de opacidad/tamaño mínimo + texto.
  2. **Enraizamiento 5‑4‑3‑2‑1**: una pantalla por sentido (5 cosas que ves, 4 que tocas, 3 que oyes, 2 que hueles, 1 que saboreas), con contadores pulsables (no hace falta escribir).
  3. **Tus por qués**: tarjetas con las razones del usuario (si no tiene, invitación a crear una en el momento).
  4. **Distracciones cognitivas** breves, rotatorias: contar hacia atrás de 7 en 7 desde 100, nombrar 5 cosas de una categoría, juego de memoria simple, "bebe un vaso de agua / sal a caminar 5 min". Mínimo 4 tipos en v1.
- Al terminar (o al cerrar tras ≥1 min): "¿Cómo está ahora el antojo? 1‑10" → se guarda como entrada de diario de tipo `sos` (**no se pregunta nada al abrir**, solo al final) y mensaje de refuerzo ("Has surfeado la ola durante 18 min").
- Si la persona indica que recayó durante el SOS, se ofrece el flujo de recaída (§6.6), nunca automáticamente.
- **SOS desde la pantalla de bloqueo (sin PIN)**: el recorrido completo funciona; los "por qués" se sustituyen por mensajes genéricos; al final la intensidad **se puede guardar** (solo escritura, sin ver el diario); el flujo de recaída **pide el PIN** [Mi decisión].

### 6.5 Diario / Check‑in — `src/components/Journal.tsx`
- Formulario de un vistazo, sin escribir (texto libre opcional al final):
  - Seguimiento (por defecto el activo).
  - **Intensidad del antojo** 0‑10 (slider grande, con etiqueta de texto cambiante).
  - **Emoción** (chips, multiselección): estrés, ansiedad, aburrimiento, tristeza, soledad, enfado, cansancio, alegría/celebración, vergüenza, otra.
  - **Entorno** (chips): casa, trabajo/estudios, con amigos, fiesta/ocio, solo/a, en pareja/familia, en la calle/transporte, en internet, otro.
  - **Hora** se registra automáticamente (se puede ajustar).
  - ¿Lo superaste? sí / sigo en ello (no hay opción que implique recaída aquí; la recaída tiene su flujo).
- Lista de entradas recientes debajo.

### 6.6 Recaída como reflexión (de I Am Sober)
- Acceso discreto en el Dashboard ("He tenido una recaída") y desde el SOS.
- Flujo de 3 pantallas, todo saltable:
  1. Mensaje compasivo + lo que **no** se pierde: tiempo total libre acumulado, racha más larga, hitos ya alcanzados.
  2. ¿Qué pasó? Chips de detonante (mismos de emoción/entorno) + nota opcional.
  3. ¿Qué harás distinto la próxima vez? Chips sugeridos + nota opcional.
- Luego `resetStreak`. El contador nuevo arranca con un mensaje de reinicio amable.

### 6.7 Por qués + Ahorro
- Lista de razones (texto corto; emoji opcional) ordenable. Sin fotos en v1 [Mi decisión: peso en localStorage].
- Calculadora: dinero ahorrado = gasto diario × días de la racha actual; tiempo recuperado igual. También "total acumulado entre todas las rachas". Equivalencias amables opcionales ("≈ 3 cenas fuera").

### 6.8 Progreso
- **Calendario** (de Quitzilla): cada día del seguimiento activo coloreado como: *libre*; *antojo fuerte superado* (alguna entrada de diario o SOS de ese seguimiento con intensidad ≥ 7 y no seguida de recaída ese día); *recaída* (fin de una racha en ese día). El pacto diario no colorea el calendario; se muestra como un pequeño punto aparte [Mi decisión].
- **Hitos**: de la racha actual (alcanzados y próximos) y **mejor hito de todos los tiempos** (de la racha más larga), que nunca se pierde.
- **Rachas**: actual, más larga, media, historial.
- **Patrones** (a partir del diario): emociones y entornos más frecuentes en antojos intensos (≥7), franja horaria con más antojos, día de la semana. Gráficos simples (barras), sin librería pesada. Requiere ≥5 entradas; si no, mensaje de "sigue registrando".
- **Cómo se recupera tu cuerpo** (de QuitNow): línea temporal solo para tabaco/vapeo y alcohol en v1, con hitos de salud de fuentes reconocidas (OMS, NHS, CDC), cada uno con su fuente citada en el código, redactados con prudencia ("muchas personas notan…"). Para el resto: beneficios genéricos no médicos. **Antes del lanzamiento público, este contenido y el aviso médico deben revisarlos un profesional sanitario** (pendiente del usuario; no bloquea el desarrollo).

### 6.9 Ajustes
Tema, idioma, moneda, PIN (activar/cambiar/quitar), gestionar seguimientos, teléfonos de ayuda, exportar/importar JSON, borrar todos los datos (con confirmación), aviso legal ("Ambar no sustituye a un profesional").

## 7. Modelo de datos (orientativo)

```ts
type TrackerKind = 'tobacco' | 'vape' | 'alcohol' | 'cannabis' | 'stimulants' | 'opioids' | 'sedatives'
  | 'gambling' | 'porn' | 'social' | 'gaming' | 'shopping' | 'food' | 'caffeine' | 'custom';

interface Tracker {
  id: string; kind: TrackerKind; customName?: string;
  startDate: string;              // ISO, inicio de la racha actual
  createdAt: string;
  costPerDay?: number; minutesPerDay?: number;
  reasons: Reason[];
  streakHistory: PastStreak[];
  celebratedMilestones: string[];   // de la racha actual; se vacía en resetStreak (los hitos se vuelven a celebrar)
  redLine?: string;                 // conductas sin abstinencia total (§6.1 paso 2b)
  medicalNoticeAck?: boolean;
}
interface PastStreak { start: string; end: string; durationMs: number; trigger?: string[]; note?: string; plan?: string[] }
interface Reason { id: string; text: string; emoji?: string }
interface JournalEntry {
  id: string; trackerId: string; at: string; source: 'checkin' | 'sos';
  intensity: number; emotions: string[]; environments: string[];
  overcame?: boolean; note?: string; sosDurationSec?: number;
}
interface Pledge { /* global, uno por día, no por seguimiento */ date: string /* YYYY-MM-DD */; pledgedAt?: string; dayRating?: 1|2|3|4|5; note?: string }
interface Settings { theme: 'dark'|'light'; locale: 'es'|'en'; country: string /* ISO */; currency: string; pinHash?: string;
  helplines: { label: string; phone: string }[]; onboarded: boolean; activeTrackerId?: string }
```
Clave de persistencia `ambar-store`, `version: 1`.

## 8. Hitos [Mi decisión]
12 h · 24 h · 3 días · 1 semana · 2 semanas · 1 mes · 2 meses · 3 meses · 6 meses · 9 meses · 1 año · 18 meses · 2 años, y después **cada aniversario y cada 100 días**, sin final. Cada hito tiene nombre y mensaje en ES/EN. Celebración: animación de confeti/partículas suaves en ámbar con Framer Motion, a pantalla parcial, que se cierra sola o con un toque; respetando reducir movimiento. Se dispara una sola vez por hito **en cada racha** (tras una recaída, los hitos se vuelven a celebrar) (también si el hito se alcanzó con la app cerrada: se celebra al abrir el más alto pendiente, no todos en cadena).

## 9. Privacidad y PIN
- Nada sale del dispositivo. Sin analíticas, sin peticiones de red tras la carga (salvo el service worker actualizando la propia app).
- PIN de 4‑6 dígitos opcional; se guarda **hash** (SHA‑256 con sal vía Web Crypto). Pantalla de bloqueo al abrir y tras 5 min en segundo plano. **El SOS es accesible sin PIN** desde la pantalla de bloqueo (los por qués no se muestran sin PIN en ese caso) [Mi decisión].
- Aviso honesto: el PIN protege de miradas, no es cifrado fuerte; olvidarlo → opción de borrar datos.
- Exportar/importar JSON como copia de seguridad (resuelve la queja de backups de la competencia).

## 10. Internacionalización
- ES y EN completos. Librería ligera (i18next + react-i18next, o diccionarios tipados propios) — a elección del constructor, con claves tipadas.
- Formatos de fecha, número y moneda con `Intl`.
- Tono: tuteo cálido en español; "you" cercano en inglés. Nunca culpabilizador.

## 11. Fuera de alcance v1 / ideas futuras
Recordatorios (notificaciones locales vía PWA cuando el navegador lo permita), comunidad (vía externa del usuario), fotos en por qués, widgets, sincronización cifrada opcional.

## 12. Dejado al constructor
- Estructura exacta de carpetas más allá de los ficheros nombrados en el encargo (`src/store/useAddictionStore.ts`, `src/components/Dashboard.tsx`, `src/components/SosIntervention.tsx`, `src/components/Journal.tsx`).
- Router (o navegación por estado) y librería i18n.
- Textos concretos de mensajes compasivos, hitos y distracciones (respetando el tono).
- Tests: funciones puras del store (tiempo, hitos, rachas, ahorro) con Vitest como mínimo.
