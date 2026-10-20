// Local integration fixture. Never imported by app code or deployed as a route.
// No real Supabase connection, credentials or participant records.
const http = require('node:http');
const { spawn } = require('node:child_process');
const path = require('node:path');
const { createHash } = require('node:crypto');
const setupMode=process.argv.includes('--setup');
const appPort=setupMode?3112:3102, authPort=setupMode?4129:4119;
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const tokens = new Map();
const flows = new Map();
let lastCode = '', sequence = 0;
const row = { email:'ficticia@example.invalid', phone:'0000000000', instagram:null, skate_type:'rigida', answers:[2,2,2,2,2,2,1,2,2,2,2,0,0,3,0,1], level:'primeros-pasos', score:18, gift:'tutorial', marketing:false, consent:true, test_version:'halloween-2026-v4-braking-16', created_at:'2026-10-11T02:00:00Z', career_interest:null, zone:null, mentorship_opt_in:false };
const rows = [
  {...row,id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Lila · FICTICIA'},
  {...row,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',name:'Teo · FICTICIO',test_version:'halloween-2026-v2-rigid-14',answers:row.answers.slice(0,14),created_at:'2026-10-09T08:00:00Z'},
  {...row,id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',name:'Versión no verificada · FICTICIA',test_version:'version-desconocida',score:7,level:'preparacion'},
];
const user = id => ({id,aud:'authenticated',role:'authenticated',email:id===owner?'owner@example.invalid':'other@example.invalid',email_confirmed_at:'2026-10-01T00:00:00Z',created_at:'2026-10-01T00:00:00Z',app_metadata:{},user_metadata:{role:'owner',owner_id:owner}});
function session(id) {
  const b = v => Buffer.from(JSON.stringify(v)).toString('base64url');
  const token = `${b({alg:'HS256',typ:'JWT'})}.${b({sub:id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'})}.synthetic`;
  tokens.set(token,id);
  return {access_token:token,refresh_token:`synthetic-${id}`,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:user(id)};
}
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url,`http://127.0.0.1:${authPort}`);
  const send=(code,body,headers={})=>{res.writeHead(code,{'Content-Type':'application/json',...headers});res.end(JSON.stringify(body));};
  const id=tokens.get((req.headers.authorization||'').replace('Bearer ',''));
  if(url.pathname==='/auth/v1/otp'){
    let raw='';for await (const chunk of req)raw+=chunk;
    const data=JSON.parse(raw);
    if(data.email!=='owner@example.invalid'||data.create_user!==setupMode||!data.code_challenge)return send(400,{code:'unexpected_fixture_request',msg:'Not allowed'});
    lastCode=`synthetic_auth_code_${++sequence}`;
    flows.set(lastCode,{challenge:data.code_challenge,callback:url.searchParams.get('redirect_to'),id:owner});
    return send(200,{});
  }
  if(url.pathname==='/auth/v1/verify'){
    let raw='';for await(const chunk of req)raw+=chunk;
    const data=JSON.parse(raw);
    if(data.email!=='owner@example.invalid'||data.type!=='email'||!['123456','222222'].includes(data.token))return send(403,{code:'otp_expired',msg:'Token has expired or is invalid'});
    return send(200,session(data.token==='222222'?other:owner));
  }
  if(url.pathname==='/fixture/last-link'){
    let code=lastCode;
    if(url.searchParams.get('user')==='other'){code=lastCode+'_other';flows.set(code,{...flows.get(lastCode),id:other});}
    return send(200,{url:`http://127.0.0.1:${authPort}/fixture/email?code=${code}`});
  }
  if(url.pathname==='/fixture/email'){
    const code=url.searchParams.get('code'),flow=flows.get(code);
    res.writeHead(303,{location:`${flow?.callback??`http://127.0.0.1:${appPort}/api/admin/callback`}?code=${code}`});return res.end();
  }
  if(url.pathname==='/fixture/foreign-session')return send(200,session(other));
  if(url.pathname==='/auth/v1/token'){
    let raw='';for await (const chunk of req)raw+=chunk;
    const data=JSON.parse(raw);
    const flow=flows.get(data.auth_code);
    const challenge=createHash('sha256').update(data.code_verifier??'').digest('base64url');
    if(!flow||flow.challenge!==challenge)return send(400,{code:'bad_code_verifier',msg:'Invalid code or verifier'});
    flows.delete(data.auth_code);return send(200,session(flow.id));
  }
  if(url.pathname==='/auth/v1/user')return id?send(200,user(id)):send(401,{code:'bad_jwt',msg:'Invalid JWT'});
  if(url.pathname==='/auth/v1/logout'){tokens.delete((req.headers.authorization||'').replace('Bearer ',''));res.writeHead(204);return res.end();}
  if(url.pathname==='/rest/v1/halloween_leads'){
    if(id!==owner)return send(403,{code:'42501',message:'permission denied'});
    if(req.method!=='GET')return send(405,{error:'read only'});
    const start=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||200);
    const page=rows.slice(start,start+limit);
    return send(200,page,{'Content-Range':`${start}-${start+page.length-1}/${rows.length}`});
  }
  send(404,{});
});
server.listen(authPort,'127.0.0.1',()=>{
  const child=spawn(process.execPath,[path.join(__dirname,'../node_modules/next/dist/bin/next'),'dev','--hostname','127.0.0.1','--port',String(appPort)],{cwd:path.join(__dirname,'..'),stdio:'inherit',env:{...process.env,SUPABASE_URL:`http://127.0.0.1:${authPort}`,SUPABASE_PUBLISHABLE_KEY:'sb_publishable_synthetic_test_only',HALLOWEEN_OWNER_USER_ID:setupMode?'':owner,HALLOWEEN_OWNER_SETUP:setupMode?'1':'',HALLOWEEN_OWNER_EMAIL:'owner@example.invalid',HALLOWEEN_ADMIN_ORIGIN:`http://127.0.0.1:${appPort}`,HALLOWEEN_ADMIN_LOCAL_CHECK:'1'}});
  child.on('exit',code=>server.close(()=>process.exit(code??0)));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child.kill();server.close();});
});
