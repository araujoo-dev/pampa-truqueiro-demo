const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const captureDir=process.env.CAPTURE_DIR || '/tmp/played-captures';
const before=process.env.BASELINE_URL || 'http://127.0.0.1:8010';
const after=process.env.BASE_URL || 'http://127.0.0.1:8011';
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const results=[];fs.mkdirSync(captureDir,{recursive:true});
 for(const [name,width,height] of [['desktop',1600,736],['celular',390,844],['pequeno',320,640],['notebook',1280,720],['paisagem',844,390],['paisagem-pequena',568,320],['tablet',700,1024]]){
 let baseline;
 for(const [version,port] of [['antes',before],['depois',after]]){
 const ctx=await b.newContext({viewport:{width,height},hasTouch:width<1000,reducedMotion:'reduce'});
 await ctx.addInitScript(()=>{let seed=12345;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)});
 await ctx.route('https://fonts.googleapis.com/**',r=>r.abort());
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.clock.install();await p.goto(port);
 await p.locator('#splashFrame').click();await p.locator('#btnIniciar').click();await p.locator('#btn1vUI').click();
 await p.clock.pauseAt(Date.now()+2000);
 const rects=async()=>p.evaluate(()=>{
 const rect=e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
 return {hands:[...document.querySelectorAll('.card-hand .demo-card')].map(rect),slots:[...document.querySelectorAll('.card-slot')].map(rect),protected:[...document.querySelectorAll('.portrait,.deck-stack,.future-actions,.side-button,#gameTitle,.scoreboard,.game-back,.human-hand,.opponent-hand')].map(rect),felt:rect(document.querySelector('.table-felt'))};
 });
 const geometry=await rects();
 if(version==='antes')baseline=geometry;else{
 assert.deepEqual(geometry.hands,baseline.hands,`${name} hands`);assert.deepEqual(geometry.protected,baseline.protected,`${name} protected`);
 for(const a of geometry.slots){for(const c of geometry.slots){if(a===c)continue;assert(!(a.x<c.x+c.w-.5&&a.x+a.w>c.x+.5&&a.y<c.y+c.h-.5&&a.y+a.h>c.y+.5),`${name} overlapping slots`)}
 for(const c of geometry.protected)assert(!(a.x<c.x+c.w-.5&&a.x+a.w>c.x+.5&&a.y<c.y+c.h-.5&&a.y+a.h>c.y+.5),`${name} overlaps protected ${JSON.stringify({a,c})}`);
 const f=geometry.felt;for(const x of [a.x,a.x+a.w])for(const y of [a.y,a.y+a.h])assert(((x-f.x-f.w/2)/(f.w/2))**2+((y-f.y-f.h/2)/(f.h/2))**2<1,`${name} outside felt ${JSON.stringify({a,f,x,y})}`);
 }
 results.push({name,width,height,scaleWidth:geometry.slots[0].w/baseline.slots[0].w,scaleHeight:geometry.slots[0].h/baseline.slots[0].h});
 }
 const shot=async n=>{assert.equal(await p.locator('.has-card').count(),n);if(['desktop','celular'].includes(name))await p.screenshot({path:`${captureDir}/${name}-${version}-${n}.png`,fullPage:true,animations:'disabled'});};
 await p.locator('.human-hand button').first().click();await shot(1);await p.clock.fastForward(900);
 await p.locator('.human-hand button').first().click();await shot(3);await p.clock.fastForward(900);
 await p.locator('.human-hand button').first().click();await p.clock.fastForward(900);await shot(6);
 assert(await p.locator('#btnNewHand').isVisible());await p.locator('#btnNewHand').click();assert.equal(await p.locator('.has-card').count(),0);assert.equal(await p.locator('.human-hand button').count(),3);
 await p.locator('#btnGameBack').click();assert(await p.locator('#menuScreen').isVisible());assert.deepEqual(errors,[]);
 await ctx.close();
 }
 console.log('PASS',name);
 }
 console.log(JSON.stringify(results,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
