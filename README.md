# CV Builder

Generador local de CVs modernos y **compatibles con ATS** (los filtros automáticos que usan los reclutadores). Escribes tu información en un formulario estructurado y la app genera un PDF en vivo, listo para descargar.

Inspirado en herramientas tipo [aurajobs.ai](https://aurajobs.ai/), pero pensado para uso personal y 100% local: no necesita servidor ni base de datos. Tus datos se guardan en el navegador (`localStorage`) y puedes exportarlos/importarlos como JSON para respaldarlos o moverlos entre equipos.

## Características

- **Formulario estructurado** por secciones: contacto, resumen, experiencia, educación, cursos/certificaciones, habilidades e idiomas.
- **Vista previa del PDF en vivo** mientras editas.
- **Exportación a PDF** con texto seleccionable real (no es una imagen), una sola columna, encabezados estándar y fuente core (Helvetica) → pensado para pasar los parsers de ATS.
- **Persistencia automática** en `localStorage` + **importar/exportar JSON**.
- Botones rápidos para cargar **datos de ejemplo** o **empezar desde cero**.
- Personalización ligera: **color de acento**, **tamaño de fuente** y mostrar/ocultar la fecha de "Last updated".

## Requisitos

- Node.js 18+ (probado con Node 22)

## Cómo usarlo

```bash
cd cv-builder
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

### Build de producción

```bash
npm run build      # genera /dist
npm run preview    # sirve el build localmente
```

## Cómo está pensado para ATS

- Una sola columna y secciones con títulos estándar (`Experience`, `Education`, `Skills`, etc.).
- Texto real seleccionable en el PDF (los ATS extraen el texto directamente).
- Sin imágenes, tablas ni cajas de texto que confundan a los parsers.
- Fechas y cargos en formato claro y consistente.
- Enlaces (LinkedIn/GitHub) con etiqueta de texto legible aunque se eliminen los hipervínculos.

## Donaciones

La app es **gratuita y de código abierto**. Si te resulta útil, puedes apoyarla con una donación por PayPal.

El enlace de donación y el del repositorio se configuran en `src/config.ts`:

```ts
export const DONATION_URL = "https://www.paypal.com/paypalme/tu-usuario";
export const REPO_URL = "https://github.com/tu-usuario/cv-builder";
```

Deja `DONATION_URL` como `""` (cadena vacía) si quieres ocultar el botón de donar.

## Estructura del proyecto

```
cv-builder/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx                 # punto de entrada
    ├── App.tsx                  # layout, persistencia, preview y descarga
    ├── index.css                # estilos de la interfaz
    ├── types.ts                 # modelo de datos del CV
    ├── config.ts                # enlaces de donación y repositorio
    ├── components/
    │   ├── ui.tsx               # inputs, cards y secciones reutilizables
    │   └── ResumeForm.tsx       # formulario completo por secciones
    ├── pdf/
    │   └── ResumeDocument.tsx   # plantilla del PDF (react-pdf)
    └── lib/
        ├── sampleData.ts        # datos de ejemplo + plantilla vacía
        └── storage.ts           # carga/guardado en localStorage
```

## Respaldar tus datos

Usa **Exportar JSON** para descargar un archivo con toda tu información. Para restaurarla (o usarla en otra máquina), usa **Importar JSON**. Como todo vive en `localStorage`, limpiar los datos del navegador borraría tu CV: exporta de vez en cuando.

## Roadmap (ideas futuras)

- Múltiples plantillas/diseños de CV.
- Varios perfiles de CV guardados a la vez.
- Reordenar entradas por arrastre.
- Sincronización opcional con un backend si algún día se necesita compartir.
