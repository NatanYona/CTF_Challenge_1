# 🕵️‍♂️ CTF Challenge — Hacker Console

Interfaz web interactiva que simula una consola "hacker" para retos **CTF (Capture The Flag)**. Incluye efectos visuales, validación de flags, sistema de scoring avanzado, hall of fame y *easter eggs* para una experiencia inmersiva.

---

## 🎯 Resumen

* Proyecto de front-end (HTML/CSS/Vanilla JS) pensado para alojar mini-challenges tipo CTF.
* Entorno seguro: la validación y la experiencia están orientadas a uso local o en entornos de demostración (no confundir con sistemas de producción).

---

## 🚀 Características principales

* 🔴 **Selección de niveles (1 — 3)** con temas visuales por nivel:

  * **Nivel 1 — ROOKIE** (por defecto)
  * **Nivel 2 — ADVANCED** (tema naranja / rojo)
  * **Nivel 3 — ELITE** (overlay de "sistema clausurado", partículas y contenido avanzado - acceso restringido)
* 🖥 **Efecto Matrix** renderizado con `<canvas>` y responsive a cambios de nivel.
* 🔐 **Validación de flag** (formulario en la UI). Las flags actuales están definidas en `script.js` por nivel.
* ⏱ **Cronómetro invisible** que mide tiempo de resolución para scoring.
* 📊 **Sistema de scoring avanzado**:

  * Score base + multiplicadores por tiempo.
  * Bonos por rapidez y por pocos intentos.
  * Penalizaciones por intentos fallidos y uso de pistas.
  * Desglose detallado (breakdown) y análisis de rendimiento.
* 🏆 **Wall of Fame** con posibilidad de guardar score (persistencia en `localStorage`).
* 🐣 **Easter eggs / comandos globales** accesibles desde la consola DevTools: `hack()`, `stats()`, `konami()`, `walloffame()`, `breakdown()`.
* 🛡 **Pequeña protección anti-debug**: heurística ligera que detecta la apertura de DevTools y bloquea operaciones si se detecta manipulación.

---

## 📂 Estructura del proyecto

```
/
├── index.html        # Interfaz principal
├── styles.css        # Estilos y animaciones (niveles, overlays, partículas)
├── script.js         # Lógica: matrix, flags, scoring, modales, comandos
└── public/
    ├── ctf_challenge.zip  # (opcional) archivos descargables del challenge
    └── Favicon.ico
```

---

## ⚙️ Instalación y uso

1. Clona el repositorio:

```bash
git clone https://github.com/NatanYona/CTF_Challenge_1
cd https://github.com/NatanYona/CTF_Challenge_1
```

2. Sirve el proyecto localmente (opcional):

```bash
npx serve
# o abre index.html directamente en el navegador
```

3. (Opcional) Coloca el paquete del challenge en `/public/ctf_challenge.zip` para habilitar la descarga desde la UI.

4. Usa la UI para:

   * Seleccionar nivel
   * Conectarte al sandbox (si has enlazado uno)
   * Ingresar la flag en formato `CTF{...}` y presionar **VERIFICAR FLAG**

---

## 🧩 Flags y configuración

* Las flags por nivel están hardcodeadas en `script.js` en el objeto `levelFlags`:

  ```js
  const levelFlags = {
    1: 'CTF{HICISTE_LAS_MOVIDAS_BIEN}',
    2: 'CTF{L0S_P3RM1S05_S0N_L4_CL4V3_P4R4_3L_T3S0R0_D3_L0S_H4CK3R5}',
    3: 'CTF{3l1t3_h4ck3r_m4st3r_0f_4ll}'
  };
  ```

> **Nota de seguridad**: para un deployment real o competitivo no distribuyas flags en el JS del cliente. Usa un backend seguro para la verificación.

---

## 📊 Scoring, rankings y logros

* `calculateScore(timeSeconds, attempts, hintsUsed)` realiza el cálculo de puntuación.
* Rankings definidos por umbrales (ej.: `LEGENDARY HACKER`, `ELITE HACKER`, ...).
* Logros automáticos basados en tiempo/errores (ej.: `LIGHTNING FAST`, `FIRST SHOT`, `PERSISTENT`).
* `createStatsModal()` genera un modal con desglose, análisis y botones para guardar el score.

---

## 🕵️‍♂️ Comandos útiles (consola DevTools)

* `hack()` — activa un efecto visual (modo hacker).
* `stats()` — imprime tabla con estadísticas actuales.
* `konami()` — activa animación Konami en la UI.
* `walloffame()` — abre el Wall of Fame.
* `breakdown()` — muestra el desglose de puntuación y análisis en consola.

---

## ✍️ Personalización

* **Cambiar flags**: editar `levelFlags` en `script.js` (para pruebas locales únicamente).
* **Colores/estilos**: ajustar `styles.css` (temas por `body.level-1/2/3`).
* **Matrix**: modificar `matrixChars`, `fontSize` o intervalos en la función del canvas en `script.js`.
* **Persistencia**: actualmente usa `localStorage` (ver funciones de guardado). Puedes conectar an API/DB para multiusuario.

---

## 📦 Despliegue

* Proyecto estático; puedes hospedar en GitHub Pages, Netlify, Vercel o cualquier servidor de archivos estáticos.
* Asegúrate de no dejar flags en el JS si el reto será competitivo.

---

## 🛠 Contribuciones

Si quieres mejorar el proyecto, algunos puntos sugeridos:

* Mover la verificación de flags a un servicio backend seguro.
* Añadir autenticación de usuarios y ranking global.
* Soporte multi-desafío con mapas/etapas.
* Tests unitarios para la lógica de scoring.

---

## 📝 Cambios importantes en esta versión

* README actualizado para reflejar todas las funcionalidades reales del código (niveles, scoring, easter eggs, protección anti-debug, overlay nivel 3, etc.).
* Advertencias de seguridad sobre flags expuestas en frontend.

---

## 📜 Licencia

MIT — modifícalo y úsalo según tus necesidades.

---

Si quieres, puedo:

* Generar un `README` en inglés adicionalmente.
* Extraer y mover las flags fuera del frontend (sugerir una estructura básica de API + ejemplos).
* Crear un `CONTRIBUTING.md` con pautas para colaborar.

Dime qué prefieres y lo dejo listo.
