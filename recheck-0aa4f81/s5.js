const L=require('./lib.js');
const body=h=>h.captured.map(b=>{const j=JSON.parse(b);return JSON.stringify({baseImage:j.baseImage,extensions:j.extensions,extensionsCatalogs:j.extensionsCatalogs});}).join();
const review=async(h,tag)=>{const txt=await h.text();const i=txt.indexOf('EXTENSIONS');console.log('review summary:',JSON.stringify(txt.slice(i,i+80)));await h.shot(tag+'-review');
 await h.click('Start build','button',true);await h.sleep(1500);console.log('CREATE BODY:',body(h));};
const toBaseJump=async(h,tpl)=>{await h.click('Base','button',true);await h.sleep(800);await h.click(tpl,'div',true);await h.sleep(800);await h.click('Review','button',true);await h.sleep(1000);};
module.exports=async h=>{const port=process.env.PORT,tag=process.env.TAG,mode=process.env.MODE;
 if(mode==='override-hadron'){ // Hadron, pick flag catalog explicitly, tick qa-ubuntu-ext, switch to Ubuntu, jump
  await L.toExt(h,port,'Hadron',tag);await h.click('http://127.0.0.1:8133/flag-catalog.json','button',false);await h.sleep(2000);
  await L.check(h,'qa-ubuntu-ext');await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');
  await toBaseJump(h,'Ubuntu 24.04');await review(h,tag);}
 if(mode==='override-use'){ // Ubuntu no catalog, operator clicks Use on hadron-layers, ticks drbd, jump to review via Base->Fedora
  await L.toExt(h,port,'Ubuntu 24.04',tag);await h.click('Use','button',false);await h.sleep(3000);
  await L.check(h,'drbd');await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');
  await toBaseJump(h,'Fedora');await review(h,tag);}
 if(mode==='roundtrip'){ // Hadron drbd -> Ubuntu (jump) -> Hadron (jump)
  await L.toExt(h,port,'Hadron',tag);await L.check(h,'drbd');await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');
  await toBaseJump(h,'Ubuntu 24.04');let t=await h.text();let i=t.indexOf('EXTENSIONS');console.log('mid (ubuntu) summary:',JSON.stringify(t.slice(i,i+80)));
  await toBaseJump(h,'Hadron');await review(h,tag);}
 if(mode==='typed'){ // Hadron, type a new URL: picker should empty until Load
  await L.toExt(h,port,'Hadron',tag);console.log('before:',JSON.stringify((await L.extCard(h)).cardText.slice(0,60)));
  await h.setInput('[aria-label="Extension catalog URL"]','http://127.0.0.1:8133/typed.json');await h.sleep(800);
  console.log('typed, not loaded:',JSON.stringify(await L.extCard(h)));
  await h.click('Load','button',false);await h.sleep(2000);console.log('after Load:',JSON.stringify(await L.extCard(h)));
  await L.check(h,'qa-ubuntu-ext');await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');await review(h,tag);}
 if(mode==='clone'){ await h.goto(`http://127.0.0.1:${port}/`);await h.ev(`localStorage.setItem('auroraboot_token','pw')`);
  await h.goto(`http://127.0.0.1:${port}/artifacts/new?clone=${process.env.CLONE}`);await h.sleep(2000);
  console.log('buttons:',(await L.buttons(h)).slice(0,300));
  const t=await h.text();console.log('page head:',JSON.stringify(t.slice(0,200)));
  await h.click('Review','button',false).catch(e=>console.log(e.message));await h.sleep(1000);await review(h,tag);}
};
