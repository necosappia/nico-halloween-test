# Panel privado Halloween

`/admin` muestra una pantalla de acceso. Los resultados se consultan mediante
`/api/admin/leads`, en servidor y sin caché, después de verificar la sesión con
Supabase Auth y comparar su UUID confirmado con `HALLOWEEN_OWNER_USER_ID`.
El lector usa exclusivamente la clave pública existente; nunca una clave secret
o service_role. La RLS de Supabase también debe limitar SELECT al mismo UUID.

## Alta inicial del propietario

Configurar en Production `HALLOWEEN_OWNER_EMAIL`, `HALLOWEEN_ADMIN_ORIGIN` y,
temporalmente, `HALLOWEEN_OWNER_SETUP=1`. Autorizar el callback exacto
`https://nmhalloween.online/api/admin/callback` en Supabase Auth. El propietario
solicita y abre su Magic Link en el mismo navegador para completar PKCE.

El modo inicial sólo admite el correo configurado. Después de confirmarlo,
cierra la sesión y mantiene bloqueada la lectura. Un operador debe obtener el
UUID confirmado, revisar y aplicar `supabase/owner-read.PENDING.sql` sustituyendo
su marcador, configurar `HALLOWEEN_OWNER_USER_ID` y retirar la variable de alta
temporal. Tras desplegar de nuevo, comprobar acceso del propietario, rechazo de
otras cuentas y ausencia de lectura anónima. No modificar la inserción pública.

## Datos y límites

El lector conserva el resultado histórico almacenado, sin recalcularlo ni
deducir aptitud física. Decodifica las versiones verificadas v2 y v4; presenta
explícitamente las versiones desconocidas y las preguntas no incluidas.
Separa consentimiento operativo, marketing e interés en mentoría.
No guarda participantes en localStorage, exporta registros ni envía mensajes.

La demo sintética y la propuesta local no forman parte de esta rama.

## Verificación

`npm run build`, `npm run typecheck`, `npm run admin:test` y
`npx playwright test --config playwright.admin-setup.config.ts`.
Los tests de navegador usan un servidor Auth y registros ficticios locales;
no acreditan el envío real de email ni sustituyen la prueba final de RLS online.
