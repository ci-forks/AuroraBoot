const L=require('./lib.js');
module.exports=async h=>{const port=process.env.PORT;
 if(process.env.MODE==='net'){await L.toExt(h,port,'Ubuntu 24.04','net');console.log('catalog requests:',JSON.stringify(h.net.filter(r=>/releases\.json|8133/.test(r.url)).map(r=>r.url)));return;}
 await L.toExt(h,port,'Hadron','warn');await L.check(h,'drbd');await L.next(h,'Access');await L.next(h,'Output');await L.next(h,'Review');
 await h.click('Base','button',true);await h.sleep(800);await h.click('Ubuntu 24.04','div',true);await h.sleep(800);await h.click('Review','button',true);await h.sleep(1000);
 const t=await h.text();console.log('review mentions publishes nothing:',/publishes nothing/.test(t),' any warning:',JSON.stringify((t.match(/[^\n]*(fail|warn|nothing|not be baked)[^\n]*/gi)||[])));await h.shot('warn-review');};
