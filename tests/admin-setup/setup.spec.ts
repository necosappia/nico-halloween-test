import { test, expect } from '@playwright/test';
test('owner-only setup can confirm email but never grants reading or leaves a session',async({page})=>{
  const origin='http://127.0.0.1:3112';
  expect((await page.request.get('/api/admin/leads')).status()).toBe(503);
  const denied=await page.request.post('/api/admin/login',{headers:{origin},data:{email:'other@example.invalid'}});
  expect(denied.status()).toBe(403);
  await page.goto('/admin');
  await page.getByLabel('Email',{exact:true}).fill('owner@example.invalid');
  await page.getByRole('button',{name:'Enviar enlace de acceso'}).click();
  await expect(page.getByText('Revisá tu correo. Abrí el enlace en este mismo navegador.')).toBeVisible();
  const mail=await (await page.request.get('http://127.0.0.1:4129/fixture/last-link')).json();
  await page.goto(mail.url);
  await expect(page.getByText('Tu correo quedó confirmado.',{exact:false})).toBeVisible();
  expect((await page.request.get('/api/admin/leads')).status()).toBe(503);
  expect((await page.context().cookies()).filter(c=>c.name==='halloween-admin')).toHaveLength(0);
  await expect(page.getByText('Lila · FICTICIA')).toHaveCount(0);
});
