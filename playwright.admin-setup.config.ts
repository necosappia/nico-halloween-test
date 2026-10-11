import { defineConfig } from '@playwright/test';
import base from './playwright.admin.config';
export default defineConfig({
  ...base,testDir:'./tests/admin-setup',
  use:{...base.use,baseURL:'http://127.0.0.1:3112'},
  webServer:{command:'node scripts/admin-test-server.cjs --setup',url:'http://127.0.0.1:3112/admin',reuseExistingServer:false,timeout:120000},
});
