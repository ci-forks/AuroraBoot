// usage: node cdp.js <scenario.js>  ; scenario exports async (h)=>{}
const fs=require('fs');
(async()=>{
  const tabs=await (await fetch('http://127.0.0.1:9223/json/new?about:blank',{method:'PUT'})).json();
  const ws=new WebSocket(tabs.webSocketDebuggerUrl);let id=0;const pend={};const net=[];const captured=[];const cons=[];
  ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend[d.id]){pend[d.id](d);delete pend[d.id];}
    if(d.method==='Network.requestWillBeSent'){net.push({url:d.params.request.url,method:d.params.request.method,body:d.params.request.postData});}
    if(d.method==='Fetch.requestPaused'){const rq=d.params.request;if(rq.method==='POST'){captured.push(rq.postData);ws.send(JSON.stringify({id:++id,method:'Fetch.fulfillRequest',params:{requestId:d.params.requestId,responseCode:500,responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from('{"error":"qa intercept"}').toString('base64')}}));}else{ws.send(JSON.stringify({id:++id,method:'Fetch.continueRequest',params:{requestId:d.params.requestId}}));}}
    if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')cons.push(d.params.args.map(a=>a.value||a.description).join(' '));
    if(d.method==='Runtime.exceptionThrown')cons.push('EXC '+JSON.stringify(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text));};
  await new Promise(r=>ws.onopen=r);
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend[i]=r;ws.send(JSON.stringify({id:i,method,params}));});
  await send('Network.enable');await send('Runtime.enable');await send('Page.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*/api/v1/artifacts',requestStage:'Request'}]});
  await send('Emulation.setDeviceMetricsOverride',{width:1400,height:1100,deviceScaleFactor:1,mobile:false});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const ev=async(expr)=>{const r=await send('Runtime.evaluate',{expression:expr,awaitPromise:true,returnByValue:true});if(r.result.exceptionDetails)throw new Error(JSON.stringify(r.result.exceptionDetails));return r.result.result.value;};
  const h={send,sleep,ev,net,cons,captured,
    goto:async(u)=>{await send('Page.navigate',{url:u});await sleep(2500);},
    shot:async(n)=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});fs.writeFileSync('/tmp/qa886/shots/'+n+'.png',Buffer.from(r.result.data,'base64'));},
    // click the last visible element whose trimmed text equals/starts with t
    click:async(t,sel='button,div,a,[role=tab],span',starts=false)=>{const ok=await ev(`(()=>{const t=${JSON.stringify(t)};const els=[...document.querySelectorAll(${JSON.stringify(sel)})].filter(e=>{const x=(e.textContent||'').trim();return (${starts}?x.startsWith(t)&&x.length<80:x===t)&&e.offsetParent!==null});const e=els[els.length-1];if(!e)return false;e.click();return true})()`);if(!ok)throw new Error('no click target '+t);await sleep(700);},
    clickLabel:async(l)=>{const ok=await ev(`(()=>{const e=document.querySelector('[aria-label='+JSON.stringify(${JSON.stringify(l)})+']');if(!e)return false;e.click();return true})()`);if(!ok)throw new Error('no aria '+l);await sleep(700);},
    setInput:async(sel,val)=>{await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});const p=e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(e,${JSON.stringify(val)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await sleep(400);},
    text:()=>ev(`document.querySelector('main')?.innerText||document.body.innerText`),
  };
  try{await require(process.argv[2])(h);}catch(e){console.log('SCENARIO ERROR',e.message);}
  console.log('CONSOLE ERRORS:',JSON.stringify(h.cons));
  await fetch('http://127.0.0.1:9223/json/close/'+tabs.id);process.exit(0);
})();
