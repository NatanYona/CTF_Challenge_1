# 🕵️‍♂️ CTF Challenge - Hacker Console

Este proyecto es una interfaz web interactiva para un reto **CTF (Capture The Flag)**.  
Simula una consola hacker con efectos visuales y animaciones, permitiendo descargar el reto, ingresar la flag encontrada y validar el progreso con estadísticas detalladas y *easter eggs* ocultos.

---

## 🚀 Características

- 🎥 **Efecto Matrix** en tiempo real con `<canvas>`.
- ⌨ **Interfaz estilo terminal** con animaciones de texto.
- 📦 **Descarga directa** de los archivos del challenge.
- 🔐 **Validación de flag** con lógica interna en JavaScript.
- ⏱ **Cronómetro oculto** que registra el tiempo de resolución.
- 📊 **Estadísticas detalladas** con:
  - Tiempo total
  - Intentos fallidos
  - Ranking dinámico
  - Logros desbloqueables
- 🐣 **Easter eggs y comandos secretos** en consola:
  - `hack()` → Activa modo hacker.
  - `stats()` → Muestra estadísticas en consola.
  - `konami()` → Desbloquea animaciones especiales.
- 🎮 **Código Konami** para animaciones ocultas.

---

## 📂 Estructura del Proyecto

/
├── index.html        # Estructura principal del sitio
├── styles.css        # Estilos visuales y animaciones
├── script.js         # Lógica principal y efectos dinámicos
└── public/
    ├── ctf_challenge.zip  # Archivos del reto (debes agregarlo)
    └── Favicon.ico       # Ícono del sitio

---

## 🛠 Tecnologías Usadas

- **HTML5** → Estructura semántica.  
- **CSS3** → Animaciones avanzadas y diseño responsivo.  
- **JavaScript (Vanilla)** → Lógica de validación, efectos visuales y estadísticas.  
- **Canvas API** → Renderizado del efecto Matrix.  
- **Google Fonts** → Tipografía Fira Code.  

---

## ⚡ Instalación y Uso

Clonar el repositorio:

git clone https://github.com/usuario/ctf-hacker-console.git
cd ctf-hacker-console

Abrir el proyecto:

- Doble clic en index.html, o  
- Servirlo en un entorno local con:

npx serve

Agregar los archivos del challenge:

- Coloca el archivo ctf_challenge.zip en la carpeta /public.

Iniciar el reto:

1. Descarga el archivo desde el botón en pantalla.  
2. Analiza los contenidos.  
3. Ingresa tu flag en el formato CTF{...} y verifica.  

---

## 🎮 Comandos Secretos

Una vez completes el reto, abre la consola del navegador (F12) y usa:

Comando   | Descripción
----------|-------------
hack()    | Activa modo hacker con efectos visuales.
stats()   | Muestra estadísticas detalladas en consola.
konami()  | Reproduce animación secreta en pantalla.

---

## 📱 Responsividad

El proyecto está optimizado para:

- Desktop 🖥  
- Tablets 📱  
- Dispositivos móviles 📲  

---

## 🔧 Personalización

Puedes ajustar el reto modificando:

- Clave de cifrado para la flag en script.js.  
- Velocidad y colores del efecto Matrix en las variables de script.js y styles.css.  
- Archivos del reto cambiando el .zip dentro de /public.  

---

## 📜 Licencia

Este proyecto está bajo licencia MIT.  
Puedes modificarlo y adaptarlo a tus necesidades.
