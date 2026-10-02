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

## Ejercicios de profundidad (2 oct 2026)

Diez ejercicios guiados de escritura y reflexión en `src/data/ejercicios.ts`, con páginas en `/conocete-mejor/ejercicios/<id>/` y runner en `src/scripts/ejercicio.ts`. No son instrumentos de medida: son adaptaciones originales de técnicas documentadas, con preguntas y textos propios. No se copia ningún cuestionario ni manual con derechos. Cada página cita el enfoque y las fuentes al pie del reflejo.

| id | Título | Técnica de origen | Fuente principal |
| --- | --- | --- | --- |
| `ochenta` | Tu discurso de los ochenta | Clarificación de valores (ACT; "80th birthday" / eulogy exercise) | Hayes, Strosahl & Wilson (2012); Harris (2009) |
| `brecha` | Dónde se te va la vida | Vida valiosa: importancia vs. consistencia por áreas (ACT) | Wilson & Murrell (2004); Lundgren et al. (2012), Bull's-Eye Values Survey (estructura, no ítems) |
| `futuro` | Carta desde dentro de cinco años | Best possible self | King (2001); Peters et al. (2010) |
| `frases` | Las frases que te criaron | Creencias tempranas y reglas de vida (TCC / terapia de esquemas); lista de frases propia | Beck (2011); Young, Klosko & Weishaar (2003) |
| `historia` | Tu vida en seis frases | Re-autoría narrativa | White & Epston (1990); Adler (2012) |
| `critica` | La voz que te habla por dentro | Autocompasión ("¿qué le dirías a un amigo?"), voz crítica | Neff (2003); Gilbert (2009) |
| `evitar` | Lo que llevas tiempo sin mirar | Evitación experiencial (ACT) | Hayes et al. (1996) |
| `ciclo` | Tu paso en el baile | Ciclo negativo (EFT), apego adulto; sin materiales de Gottman ni de "Hold Me Tight" | Johnson (2004); Mikulincer & Shaver (2016) |
| `carta` | La carta que no vas a enviar | Carta no enviada (Gestalt) + escritura expresiva | Pennebaker & Beall (1986); Frattaroli (2006) |
| `gracias` | Gracias con nombre | Visita de gratitud | Seligman et al. (2005) |

Reglas de seguridad y privacidad: cada intro avisa de la intensidad (suave / media / honda) y de que no es para hacerlo en crisis; el ejercicio de pareja incluye la línea de la Procuradora de las Mujeres (787-722-2977) por si lo que hay no es un ciclo sino violencia; el reflejo de todos cierra con las líneas de crisis. El borrador vive en `sessionStorage` (solo la pestaña) y se puede borrar desde el reflejo. Si hay `PUBLIC_LEADS_ENDPOINT`, el paso de datos aparece antes del reflejo con enlace para verlo sin dejar datos; la carga útil (`source: "ejercicio"`) lleva nombre, contacto, ejercicio, fecha y consentimientos, nunca lo escrito.

Pendiente: aprobación de Melanie de los textos (marcados con `Verify` en el índice) y, si quiere, ajustar la lista de frases de `frases` y las opciones de `ciclo` a lo que oye en consulta.
