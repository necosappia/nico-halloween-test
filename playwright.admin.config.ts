import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/admin', timeout:30000, workers:1,
  reporter:[['list']], outputDir:'artifacts/admin-results',
  use:{baseURL:'http://127.0.0.1:3102',headless:true,viewport:{width:1440,height:1100},launchOptions:{executablePath:process.env.CHROME_PATH??'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'},trace:'retain-on-failure',screenshot:'only-on-failure'},
  webServer:{command:'node scripts/admin-test-server.cjs',url:'http://127.0.0.1:3102/admin',reuseExistingServer:false,timeout:120000},
});
