const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1180,height:820}});
 const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 await p.goto('http://localhost:8765/index.html?selftest=1');
 await p.waitForFunction(()=>window.SELFTEST_RESULT,null,{timeout:90000});
 console.log(JSON.stringify(await p.evaluate(()=>window.SELFTEST_RESULT)));
 // import flow with the mxl
 await p.evaluate(()=>{localStorage.clear();});
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(800);
 await p.fill('.big-input','Paulo'); for(const s of ['Next →','Both','An adult','More than 6 years','Thumb position too']){ await p.click('text='+s); await p.waitForTimeout(250); }
 await p.click('text=Tenor clef'); await p.click('text=Next →'); await p.waitForTimeout(250); await p.click('text=Next →'); await p.waitForTimeout(250); await p.click('text=30 min'); await p.waitForTimeout(250); await p.click('text=Start practising'); await p.waitForTimeout(800);
 await p.click('nav >> text=Library'); await p.waitForTimeout(400);
 await p.setInputFiles('#v-library input[type=file]','/home/claude/scores/The-Swan.mxl'); await p.waitForTimeout(2500);
 await p.screenshot({path:'shots/10-imported-piece.png'});
 await p.click('nav >> text=Today'); await p.waitForTimeout(600); await p.screenshot({path:'shots/11-home-imported.png'});
 await p.click('text=Begin →'); await p.waitForTimeout(500);
 for(let i=0;i<14;i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500); await p.screenshot({path:'shots/12-imp-'+String(i).padStart(2,'0')+'.png'}); }
 await p.click('nav >> text=Library').catch(()=>{});
 console.log(errs.join('\n')||'no page errors'); await b.close();})();
