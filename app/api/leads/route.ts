import {evaluate,questions} from '../../../lib/test';
export async function POST(req:Request){
 try{
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origen no permitido'},{status:403});
 const raw=await req.json();
 if(!raw||typeof raw!=="object")return Response.json({error:"Datos inválidos"},{status:400});
 const b=raw as Record<string,unknown>;
 if(typeof b.name!=='string'||b.name.trim().length<2||b.name.length>100||typeof b.email!=='string'||b.email.length>200||!/^\S+@\S+\.\S+$/.test(b.email)||typeof b.phone!=='string'||!/^\+?[\d\s()-]{8,25}$/.test(b.phone)||typeof b.gift!=='string'||!['clase','tutorial'].includes(b.gift)||b.consent!==true||!Array.isArray(b.answers)||b.answers.length!==questions.length||!b.answers.every((n:unknown,i:number)=>Number.isInteger(n)&&Number(n)>=0&&Number(n)<questions[i].options.length)) return Response.json({error:'Revisá tus datos y completá el test.'},{status:400});
 const r=evaluate(b.answers as number[]);
 const url=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)throw new Error('Database configuration missing');
 const saved=await fetch(new URL('/rest/v1/halloween_leads',url),{
  method:'POST',
  headers:{'apikey':key,'Content-Type':'application/json','Prefer':'return=minimal'},
  body:JSON.stringify({id:crypto.randomUUID(),name:b.name.trim(),email:b.email.toLowerCase().trim(),phone:b.phone,answers:b.answers,level:r.level,score:r.score,gift:b.gift,marketing:b.marketing===true,consent:true,test_version:'halloween-2026-v4-braking-16'}),
  signal:AbortSignal.timeout(10000)
 });
 if(!saved.ok)throw new Error('Database insert failed');
 return Response.json({ok:true});
 }catch{return Response.json({error:'No pudimos guardar tu solicitud. Intentá nuevamente.'},{status:503});}
}
