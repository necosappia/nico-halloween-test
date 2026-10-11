import { test, expect } from '@playwright/test';
import { historicalAnswers } from '../../lib/admin/history';
test('decode only verified versions and preserve unavailable historical answers',()=>{
  const values=[2,2,2,2,2,2,1,2,2,2,2,0,0,3,0,1];
  const old=historicalAnswers('halloween-2026-v2-rigid-14',values.slice(0,14))!;
  expect(old.filter(q=>q.included)).toHaveLength(14);
  expect(old[13].answer).toBe('Ninguno');expect(old[14].selected).toBeNull();expect(old[14].included).toBe(false);
  expect(historicalAnswers('halloween-2026-v4-braking-16',values)![15].answer).toBe('Frenada en T');
  for(const version of ['toString','unknown','halloween-2026-proposal-18-sections','halloween-2026-v3-brake-15'])expect(historicalAnswers(version,values)).toBeNull();
  for(const value of [null,-1,3,'2',1.5])expect(historicalAnswers('halloween-2026-v4-braking-16',[value])![0].selected).toBeNull();
});
