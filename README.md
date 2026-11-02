# Superheroes INC. - Website Oficial

Sitio web oficial del juego de rol **Superheroes INC. Tercera Edición**, construido con [Astro](https://astro.build).

## 🦸 Características

- **Contenido dinámico**: Sistema de colecciones de Astro para blog, personajes y lore
- **Diseño temático**: Estética de documentos clasificados con tipografía monoespaciada
- **Organización por categorías**: Lore organizado en localizaciones, organizaciones y grupos
- **Búsqueda integrada**: Sistema de búsqueda en tiempo real
- **Responsive**: Diseño adaptable a todos los dispositivos
- **SEO optimizado**: Meta tags, sitemap y estructura semántica

## 🚀 Estructura del Proyecto

```
/
├── docs/                # Documentación técnica y contexto de arquitectura (Wizard / IA)
│   ├── WIZARD_ARCHITECTURE.md
│   └── wizard/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── content/         # Contenido en Markdown
│   │   ├── blog/        # Noticias y actualizaciones
│   │   ├── characters/  # Personajes del juego
│   │   └── lore/        # Lore del universo
│   │       ├── localizaciones/
│   │       ├── organizaciones/
│   │       └── grupos/
│   ├── layouts/         # Layouts de página
│   ├── pages/           # Rutas de la aplicación
│   └── styles/          # Estilos globales
└── package.json
```

## 🛠️ Comandos

| Comando                | Acción                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Instala las dependencias                         |
| `npm run dev`          | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build`        | Construye el sitio para producción en `./dist/`  |
| `npm run preview`      | Previsualiza la build antes de desplegar         |

## 📝 Añadir Contenido

### Blog
Crea un archivo `.md` en `src/content/blog/`:

```markdown
---
title: "Título del post"
pubDate: 2025-11-30
description: "Descripción breve"
author: "Autor"
image: "/ruta/imagen.jpg"
tags: ["tag1", "tag2"]
---

Contenido del post...
```

### Personajes
Crea un archivo `.md` en `src/content/characters/`:

```markdown
---
name: "Nombre Real"
alias: "Nombre de Héroe"
description: "Descripción breve"
powers: ["Poder 1", "Poder 2"]
source: "Manual Básico"
---

Biografía del personaje...
```

### Lore
Crea un archivo `.md` en la carpeta correspondiente de `src/content/lore/`:

```markdown
---
title: "Nombre"
description: "Descripción breve"
category: "organizaciones" # o "localizaciones" o "grupos"
source: "Manual Básico"
---

Descripción detallada...
```

## 🎨 Personalización

- **Colores**: Edita las variables CSS en `src/styles/global.css`
- **Tipografía**: Configurada con Courier Prime para el tema de documentos clasificados
- **Componentes**: Todos los componentes están en `src/components/`
- **Arquitectura del Generador de Fichas (Wizard)**: Consulta [docs/WIZARD_ARCHITECTURE.md](./docs/WIZARD_ARCHITECTURE.md) para la guía técnica completa y contexto para IA.

## 📦 Tecnologías

- [Astro](https://astro.build) - Framework web
- [React](https://react.dev) - Componentes interactivos
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- CSS Variables - Sistema de diseño

## 📄 Licencia

Este proyecto contiene contenido del juego de rol Superheroes INC., todos los derechos reservados.

## 🤝 Contribuir

Si encuentras algún error o tienes sugerencias, por favor abre un issue en GitHub.

---

Desarrollado con ❤️ para la comunidad de Superheroes INC.
