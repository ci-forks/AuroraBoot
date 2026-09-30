const L=require('./lib.js');
module.exports=async h=>{const port=process.env.PORT,tag=process.env.TAG,mode=process.env.MODE;
 await L.toExt(h,port,'Hadron',tag);await L.check(h,'drbd');
 await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');
 await h.click('Base','button',true);await h.sleep(800);
 await h.click('Ubuntu 24.04','div',true);await h.sleep(800);
 if(mode==='revisit'){await L.next(h,'System');await L.next(h,'Extensions');await h.sleep(1500);
   console.log('ext card after switch:',JSON.stringify(await L.extCard(h)));await h.shot(tag+'-ext');
   await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');}
 else {await h.click('Review','button',true);await h.sleep(1000);}
 const txt=await h.text();const i=txt.indexOf('EXTENSIONS');console.log('review summary:',JSON.stringify(txt.slice(i,i+160)));
 await h.shot(tag+'-review');
 await h.click('Start build','button',true);await h.sleep(1500);
 console.log('CREATE BODY:',h.captured.map(b=>{const j=JSON.parse(b);return JSON.stringify({baseImage:j.baseImage,dockerfile:!!j.dockerfile,extensions:j.extensions,extensionsCatalogs:j.extensionsCatalogs});}).join());};
