# Nico Sappia — Halloween sobre ruedas

## Idea del proyecto

Web visual e interactiva para que una persona descubra su preparación para una salida en rollers. La campaña usa Halloween como contexto y conecta la evaluación con una clase gratuita o una guía tutorial gratuita. El objetivo comercial es captar contactos, conocer sus necesidades y orientar futuras propuestas de clases, cursos, planes, salidas y mantenimiento.

No es una certificación ni una autorización para patinar en la calle. El resultado es una autoevaluación que requiere validación de un profesor y revisión de las condiciones del recorrido.

## Marca y diseño

- Marca visible: Nico Sappia, con el logo aportado por el usuario y fondo transparente.
- Campaña: Halloween sobre ruedas, edición 2026.
- Foto principal: grupo de patinadores disfrazados en Puerto Madero, aportada por el usuario.
- Fondo oscuro, tonos violeta, naranja y acentos verdes del logo.
- Degradados CSS sobre la foto para integrarla al diseño y mantener el contraste.
- Una pregunta por pantalla; botones grandes; selección marcada; progreso segmentado.
- Transiciones suaves y soporte de `prefers-reduced-motion`.
- Diseño adaptable a celular y escritorio.
- Tono rioplatense, directo y fácil de leer.

## Recorrido del visitante

1. Portada: “¿Listo para salir a patinar?”. Explica que el test tiene 14 preguntas, dura aproximadamente 3 minutos y es gratuito.
2. Test: al tocar una respuesta avanza automáticamente tras una confirmación visual de 240 ms; puede volver y modificarla. No requiere pulsar un botón Siguiente.
3. Resultado: preparación, salida primeros pasos o salida urbana. Se muestran habilidades y recomendaciones de equipo/mantenimiento.
4. Regalo: “Accedé a una clase gratuita” o guía tutorial gratuita.
5. Formulario: nombre, WhatsApp y email; consentimiento obligatorio para gestionar la solicitud y consentimiento comercial opcional.
6. Confirmación: guarda el contacto y muestra la guía escrita si fue elegida. La clase queda como solicitud pendiente de coordinación.
7. Orientación comercial: sugiere el curso Aprende Patinando o un plan de clases según el nivel.

## Preguntas actuales

| Nº | Tema | Qué registra |
| --- | --- | --- |
| 1 | Freno | Capacidad de detenerse con control en piso plano |
| 2 | Dirección | Giros y capacidad de esquivar obstáculos |
| 3 | Superficies | Experiencia en juntas e irregularidades |
| 4 | Pendientes | Capacidad de regular velocidad y frenar |
| 5 | Resistencia | Tiempo de patinaje cómodo |
| 6 | Grupo | Autonomía, distancia y seguimiento de indicaciones |
| 7 | Protecciones | Equipo incompleto, parcial o completo |
| 8 | Tipo de roller | Tela/bota blanda, extensible, urbano/bota rígida o desconocido |
| 9 | Recorrido | Más de 10 km continuos sin parar |
| 10 | Imprevisto | Respuesta declarada ante un auto que se cruza |
| 11 | Una pierna | Equilibrio en movimiento con cada pierna por separado |
| 12 | Ruedas | Experiencia en revisión del desgaste y rotación |
| 13 | Tornillos | Revisión reciente de ejes y fijaciones de la guía |
| 14 | Reconocimiento visual | Identificar bota rígida entre tres fotos; opciones A, B, C y Ninguno |

La pregunta de una pierna usa una referencia de 10 segundos con cada pierna. Es una regla inicial de la campaña, pendiente de validación técnica por Nico y sus profesores.

## Clasificación implementada

Cada respuesta de habilidad vale de 0 a 2. Las preguntas 1, 2, 3, 4, 5, 6, 9, 10 y 11 componen un puntaje descriptivo de 0 a 18. El resultado no depende de un promedio: utiliza condiciones específicas.

### Preparación

Se recomienda cuando no se cumplen simultáneamente estas condiciones mínimas:

- Freno con control: respuesta 2 de la pregunta 1.
- Dirección al menos en progreso: respuesta 1 o 2 de la pregunta 2.
- Autonomía de grupo al menos a ritmo tranquilo: respuesta 1 o 2 de la pregunta 6.

### Primeros pasos

Se recomienda cuando se cumplen las condiciones mínimas anteriores, pero falta algún requisito de la salida urbana. Las alertas de protecciones y mantenimiento siguen visibles: este resultado no autoriza a salir con equipo incompleto.

### Salida urbana

Requiere la respuesta de mayor control en las preguntas 1 a 6, 9, 10 y 11; protecciones completas; y revisión reciente de tornillos o por un técnico.

El tipo de roller y la rotación de ruedas no suman puntos de habilidad. El modelo desconocido genera una recomendación de identificación con un profesor; la falta de experiencia en rotación genera una recomendación de aprendizaje.

Estas reglas son una primera implementación. Deben ajustarse según las dos salidas reales, sus distancias, ritmo, terreno y criterios del equipo docente.

## Captación de contactos

Se guarda en Supabase Postgres, tabla `halloween_leads`:

| Campo | Contenido |
| --- | --- |
| id | Identificador único |
| name | Nombre |
| email | Email normalizado |
| phone | WhatsApp |
| answers | Respuestas del test en JSON |
| level | `preparacion`, `primeros-pasos` o `urbana` |
| score | Puntaje de habilidades |
| gift | `clase` o `tutorial` |
| marketing | Permiso comercial opcional, 0 o 1 |
| created_at | Fecha y hora de registro |

El servidor valida los datos y recalcula el resultado antes de guardarlo. No confía en un nivel calculado por el navegador. La tabla no tiene una API pública de lectura ni un panel de gestión implementado.

## Embudo comercial previsto

| Necesidad detectada | Propuesta posible |
| --- | --- |
| Construir bases | Clase gratuita y curso Aprende Patinando |
| Mejorar técnica o ganar autonomía | Plan de clases NM Roller |
| Preparación urbana | Salida adecuada y clases para consolidar habilidades |
| Equipo o mantenimiento | Orientación de modelo, revisión y tutorial de ruedas |

Estas propuestas describen la intención comercial. No hay mensajes automáticos, cobros ni enlaces de compra conectados. Solo se deben enviar campañas a quienes acepten el consentimiento comercial.

## Qué está implementado

- Portada y encuesta interactiva con 14 preguntas.
- Clasificación y recomendaciones individuales.
- Logo transparente y foto de Halloween integrada con degradados.
- Captación y persistencia de contactos en Supabase.
- Selección de regalo.
- Guía escrita gratuita disponible al completar el formulario.
- Solicitud de clase gratuita, pendiente de coordinación manual.

## Qué falta conectar

- Enlaces oficiales para comprar el curso y contratar los planes.
- WhatsApp, CRM o automatizaciones para entregar y dar seguimiento.
- Disponibilidad, sedes y condiciones de la clase gratuita.
- Panel privado para consultar, filtrar y exportar contactos.
- Política de privacidad completa con responsable y canal de contacto.
- Métricas del embudo: inicio, finalización, formulario, regalo y compra.
- Revisión del criterio técnico y prueba completa en navegador, especialmente en celular.
- Acceso público: la publicación actual conserva acceso privado del propietario.

## Tecnología y archivos

Proyecto en Next.js + React + TypeScript, preparado para Vercel. Persistencia en Supabase Postgres mediante la API REST, utilizada únicamente desde la ruta del servidor. RLS habilitada: inserción de contactos sin acceso público de lectura, actualización ni borrado.

| Archivo | Función |
| --- | --- |
| `app/page.tsx` | Portada, encuesta, resultados, formulario y confirmación |
| `app/globals.css` | Diseño, degradados, animaciones y estilos móviles |
| `app/layout.tsx` | Idioma y metadatos de página |
| `lib/test.ts` | Preguntas y reglas de clasificación |
| `app/api/leads/route.ts` | Validación y guardado de contactos |
| `supabase/schema.sql` | Esquema y permisos de `halloween_leads` |
| `public/nico-sappia-logo-transparent.png` | Logo sin fondo |
| `public/halloween-puerto-madero.png` | Foto principal |
| `vercel.json` | Configuración de Vercel |
| `.env.example` | Variables del servidor, sin valores |

## Desarrollo

```bash
npm ci
cp .env.example .env.local
# Completar SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY
npm run dev
npm run typecheck
npm run build
```

Las variables se usan en el servidor. No se incluyen credenciales en el repositorio ni en el navegador. El formulario recalcula el resultado antes de guardarlo. `supabase/schema.sql` ya fue aplicado en el proyecto seleccionado: no volver a ejecutarlo sin revisar su estado.

## Migración

La versión de Sites permanece disponible. Esta carpeta contiene la versión separada para GitHub y Vercel. Los contactos nuevos de esta versión se registran en Supabase. No se han transferido registros históricos de D1.

El despliegue inicial puede hacerse desde los archivos. La conexión de GitHub permitirá desplegar cambios automáticamente al subir nuevos commits, una vez vinculado el repositorio.

Los contactos registran `test_version` para interpretar el orden de las 14 respuestas. La respuesta visual correcta para bota rígida es «Ninguno» y no cambia el nivel técnico.

## Pendientes de producto

El video de Nico todavía no fue proporcionado. La guía escrita sigue disponible; la solicitud de clase requiere coordinación del equipo. WhatsApp, CRM, enlaces de compra, panel de contactos y política de privacidad completa siguen pendientes.
