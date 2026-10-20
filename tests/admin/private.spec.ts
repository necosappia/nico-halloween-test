import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const origin='http://127.0.0.1:3102';
async function login(page: import('@playwright/test').Page,user='owner') {
  await page.goto('/admin');
  await page.getByLabel('Email',{exact:true}).fill('owner@example.invalid');
  await page.getByRole('button',{name:'Enviar código de acceso',exact:true}).click();
  await expect(page.getByText('Revisá tu correo e ingresá el código. Si recibiste un enlace, abrilo en este mismo navegador.')).toBeVisible();
  const mail=await page.request.get(`http://127.0.0.1:4119/fixture/last-link?user=${user}`);
  await page.goto((await mail.json()).url);
}
test('anonymous API, forged cookie, CSRF and public page do not expose records',async({request,page,context})=>{
  const response=await request.get('/api/admin/leads'); expect(response.status()).toBe(401);
  expect(response.headers()['cache-control']).toContain('no-store');
  expect(await response.text()).not.toContain('FICTICIA');
  const csrf=await request.post('/api/admin/login',{headers:{origin:'https://untrusted.invalid'},data:{email:'owner@example.invalid'}});expect(csrf.status()).toBe(403);
  await context.addCookies([{name:'halloween-admin',value:'base64-forged',url:origin+'/api/admin'}]);
  expect((await context.request.get('/api/admin/leads')).status()).toBe(401);
  await page.goto('/admin'); await expect(page.getByRole('heading',{name:'Entrá para revisar'})).toBeVisible();
  expect(await page.content()).not.toContain('Lila · FICTICIA');
  expect((await request.get('/api/leads')).status()).toBe(405);
});
test('other user is denied even when editable metadata claims owner',async({page})=>{
  await login(page,'other');
  await expect(page.getByText('Esta cuenta no tiene acceso al panel.',{exact:true})).toBeVisible();
  await expect(page.getByText('Lila · FICTICIA')).toHaveCount(0);
  expect((await page.request.get('/api/admin/leads')).status()).toBe(401);
});
test('only allowed inbox can request a link; bad, reused and unbound PKCE codes fail',async({request,browser})=>{
  const headers={origin};
  const denied=await request.post('/api/admin/login',{headers,data:{email:'other@example.invalid'}});
  expect(denied.status()).toBe(403);
  const invalid=await request.get('/api/admin/callback?code=invalid_auth_code',{maxRedirects:0});
  expect(invalid.status()).toBe(303);expect(invalid.headers().location).toContain('access=invalid-link');
  expect((await request.post('/api/admin/login',{headers,data:{email:'owner@example.invalid'}})).status()).toBe(200);
  const mail=await (await request.get('http://127.0.0.1:4119/fixture/last-link')).json();
  const foreign=await browser.newContext();
  await foreign.request.get(mail.url);
  expect((await foreign.request.get(origin+'/api/admin/leads')).status()).toBe(401);
  await foreign.close();
  await request.get(mail.url);
  expect((await request.get('/api/admin/leads')).status()).toBe(200);
  const callback=await request.get(mail.url,{maxRedirects:0});
  const reused=await request.get(callback.headers().location,{maxRedirects:0});
  expect(reused.headers().location).toContain('access=invalid-link');
});
test('a valid foreign session cannot read and a revoked owner session is cleared',async({page,context})=>{
  const issued=await page.request.get('http://127.0.0.1:4119/fixture/foreign-session');
  const foreign=await issued.json();
  await context.addCookies([{name:'halloween-admin',value:'base64-'+Buffer.from(JSON.stringify(foreign)).toString('base64url'),domain:'127.0.0.1',path:'/api/admin',httpOnly:true,sameSite:'Strict'}]);
  expect((await page.request.get('/api/admin/leads')).status()).toBe(403);
  await context.clearCookies();await login(page);
  await expect(page.getByText('3 envíos registrados')).toBeVisible();
  const cookie=(await context.cookies()).find(c=>c.name==='halloween-admin')!;
  const session=JSON.parse(Buffer.from(cookie.value.slice(7),'base64url').toString());
  await page.request.post('http://127.0.0.1:4119/auth/v1/logout',{headers:{authorization:`Bearer ${session.access_token}`}});
  await page.getByRole('button',{name:'Actualizar',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Entrá para revisar'})).toBeVisible();
  await expect(page.getByText('Lila · FICTICIA')).toHaveCount(0);
});
test('owner sees stored results, filters, historical questions, reload and logout',async({page,context})=>{
  await login(page);
  await expect(page.getByText('3 envíos registrados')).toBeVisible();
  await expect(page.getByText('Resultado guardado · sin recalcular')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Tu próximo paso: salida primeros pasos'})).toBeVisible();
  const cookie=(await context.cookies()).find(c=>c.name==='halloween-admin');
  expect(cookie?.httpOnly).toBe(true);expect(cookie?.sameSite).toBe('Strict');expect(cookie?.path).toBe('/api/admin');
  expect(await page.evaluate(()=>document.cookie)).not.toContain('halloween-admin');
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);
  await page.getByLabel('Buscar',{exact:true}).fill('Teo');
  await expect(page.getByRole('status')).toContainText('1 de 3');
  await page.getByRole('button',{name:'Respuestas',exact:true}).click();
  await expect(page.getByText('PREGUNTA 1 DE 14')).toBeVisible();
  await page.getByRole('button',{name:'Siguiente',exact:true}).click();
  await expect(page.getByRole('heading',{name:'¿Controlás la dirección?'})).toBeVisible();
  await page.getByRole('button',{name:'Anterior',exact:true}).click();
  await page.getByRole('button',{name:'Ver todas juntas'}).click();
  await expect(page.locator('.private-question')).toHaveCount(14);
  await expect(page.getByText('Las preguntas 15 y 16 no estaban incluidas en v2.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Datos y permisos',exact:true}).click();
  await expect(page.getByText('Guardar datos para gestionar el regalo y orientar')).toBeVisible();
  await expect(page.getByText('Propuestas de clases, cursos y salidas',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Limpiar filtros'}).click();
  await page.getByRole('combobox',{name:'Versión',exact:true}).selectOption('halloween-2026-v4-braking-16');
  await expect(page.getByRole('status')).toContainText('1 de 3');
  await page.reload(); await expect(page.getByText('3 envíos registrados')).toBeVisible();
  const closed = page.waitForResponse(response => response.url().endsWith('/api/admin/logout'));
  await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();
  expect((await closed).status()).toBe(200);
  await expect(page.getByRole('heading',{name:'Entrá para revisar'})).toBeVisible();
  expect((await page.request.get('/api/admin/leads')).status()).toBe(401);
  await page.reload();await expect(page.getByRole('heading',{name:'Entrá para revisar'})).toBeVisible();
});
test('unverified historical version is explicit and stored result remains intact',async({page})=>{
  await login(page);await page.getByLabel('Buscar',{exact:true}).fill('no verificada');
  await expect(page.getByText('No se reconstruyen habilidades:',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Respuestas',exact:true}).click();
  await expect(page.getByText('No hay una copia histórica verificada',{exact:false})).toBeVisible();
  await expect(page.locator('.private-question')).toHaveCount(0);
});
test('visual and accessibility checks with synthetic records only',async({page})=>{
  await login(page);await expect(page.getByText('3 envíos registrados')).toBeVisible();
  for(const tab of ['Resultado','Respuestas','Datos y permisos']){
    await page.getByRole('button',{name:tab,exact:true}).click();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  }
  await page.getByRole('button',{name:'Respuestas',exact:true}).click();
  await page.screenshot({path:'artifacts/admin-respuestas-sinteticas.png',fullPage:true});
  await page.getByRole('button',{name:'Resultado',exact:true}).click();
  await page.screenshot({path:'artifacts/admin-resultado-sintetico.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'artifacts/admin-mobile-sintetico.png',fullPage:true});
});
