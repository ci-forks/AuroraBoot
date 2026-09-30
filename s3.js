// full flow: base template -> extensions (pick EXT) -> ... -> review -> submit; print body
const L=require('./lib.js');
module.exports=async h=>{const port=process.env.PORT,tag=process.env.TAG,tpl=process.env.TPL,ext=process.env.EXT;
 await L.toExt(h,port,tpl,tag);
 if(ext)await L.check(h,ext);
 console.log('ext card:',JSON.stringify(await L.extCard(h)));
 await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');
 await h.shot(tag+'-review');
 console.log('review buttons:',await L.buttons(h));
 const sub=process.env.SUBMIT||'Start build';await h.click(sub,'button',true);await h.sleep(1500);
 console.log('CREATE BODY:',h.captured.map(b=>{const j=JSON.parse(b);return JSON.stringify({baseImage:j.baseImage,dockerfile:!!j.dockerfile,extensions:j.extensions,extensionsCatalogs:j.extensionsCatalogs});}));};
