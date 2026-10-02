# "Conócete mejor": instrumentos revisados (1 oct 2026)

Qué se integró, qué se excluyó y por qué. Antes de añadir un instrumento nuevo: verificar fuente original, licencia vigente, versión oficial en español, puntuación y cortes. Las definiciones viven en `src/data/evaluaciones.ts`.

## Datos que viajan si la persona deja su contacto

Nombre, correo, teléfono, autoevaluación, fecha, puntuación total, rango y consentimientos. Nunca las respuestas individuales. Destino: `PUBLIC_LEADS_ENDPOINT` (variable del build; vacío = sin paso de datos; `demo` = simulado en la vista previa). El formulario de cita usa el mismo destino con `source: "cita"` (y, si el destino falla o no existe, cae al correo). Cargas útiles en `src/lib/leads.ts`.


## Integrados

- **WHO-5 (Índice de Bienestar de la OMS, 1998)** — "free of charge and does not require permission to use" (CORC). Sitio oficial (Psychiatric Research Unit, Hillerød): versión en español oficial `WHO5_Spanish.pdf`; "Any deviation from the WHO-Five language versions ... should be clearly marked". 5 ítems, escala 0-5, suma ×4 = 0-100; <13 (bruto) / <52 (%) = bienestar bajo; ≤28 (%) se usa como umbral de cribado de depresión. Se corrigió una errata ("descandado" → "descansado").
- **PHQ-9** — Pfizer / Spitzer, Williams, Kroenke: "No se requiere permiso para reproducir, traducir, presentar o distribuir." Versión "Spanish for the USA". 0-4 mínimo, 5-9 leve, 10-14 moderado, 15-19 moderadamente grave, 20-27 grave. Ítem 9 (ideas de muerte o de hacerse daño) → flujo de seguridad.
- **GAD-7** — misma licencia. Versión "Spanish for the USA". 0-4 mínima, 5-9 leve, 10-14 moderada, 15-21 grave; ≥10 recomienda evaluación.
- **DASS-21, escala de estrés (7 ítems: 1, 6, 8, 11, 12, 14, 18)** — UNSW: "The DASS questionnaire is in the public domain". Traducción Daza, Novy, Stanley & Averill (2002), validada con muestra hispana en EE. UU. Suma ×2 = 0-42: 0-14 normal, 15-18 leve, 19-25 moderado, 26-33 severo, 34+ extremadamente severo.

## Excluidos (y por qué)

- **SWLS (Diener)** — el sitio oficial (eddiener.com) limita hoy el uso a "non-commercial purposes only". Una web de práctica privada con captación de contactos no entra con claridad. Fuera hasta tener autorización.
- **PSS (Cohen)** — hoy requiere solicitud de permiso vía Mapi Research Trust (ePROVIDE), gratuita pero obligatoria. Se puede añadir cuando se obtenga.
- **CSI-4/16 (Funk & Rogge)** — uso libre en contextos clínicos y de investigación, pero sin versión oficial en español; traducirlo sería publicar un instrumento no validado. Fuera hasta tener traducción validada.
- **MBI, WEMWBS, ISI, DAS, CD-RISC** — licencias de pago o registro obligatorio. No se reproducen.
