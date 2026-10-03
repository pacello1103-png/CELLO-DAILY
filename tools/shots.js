const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:1180,height:820},deviceScaleFactor:1});
 const p=await ctx.newPage();
 const errs=[];p.on('pageerror',e=>errs.push('PAGEERR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
 const shot=n=>p.screenshot({path:'/home/claude/dailycello/shots/'+n+'.png'});
 await p.goto('http://localhost:8765/index.html');await p.waitForTimeout(1200);
 await shot('01-onboard');
 await p.fill('.big-input','Paulo'); await p.click('text=Next →'); await p.waitForTimeout(400);
 await shot('02-role');
 await p.click('text=Both'); await p.waitForTimeout(300); await p.click('text=An adult'); await p.waitForTimeout(300);
 await p.click('text=Professional'); await p.waitForTimeout(300); await p.click('text=Thumb position too'); await p.waitForTimeout(300);
 await p.click('text=Tenor clef'); await p.waitForTimeout(200); await shot('03-clefs'); await p.click('text=Next →'); await p.waitForTimeout(300);
 await p.click('text=Shifting'); await p.click('text=Creativity'); await p.click('text=Next →'); await p.waitForTimeout(300);
 await p.click('text=45 min'); await p.waitForTimeout(300); await shot('04-ready');
 await p.click('text=Start practising'); await p.waitForTimeout(1200); await shot('05-home');
 await p.click('text=Begin →'); await p.waitForTimeout(800); await shot('06-chapter');
 for(let i=1;i<=6;i++){ await p.keyboard.press('ArrowRight'); await p.waitForTimeout(900); await shot('07-page'+i); }
 console.log(errs.join('\n')); await b.close();})();
