const http=require('http');const fs=require('fs');
const cat={generated:"2026-09-30T00:00:00Z",repo:"qa/ubuntu-catalog",layers:[{name:"qa-ubuntu-ext",title:"QA Ubuntu extension",description:"Fake extension served by the QA catalog",image:"example.invalid/qa",latest:"1.0.0",tags:[{tag:"1.0.0",sysext:{amd64:{url:"http://127.0.0.1:8133/qa.raw"},arm64:{url:"http://127.0.0.1:8133/qa.raw"}}}]}]};
http.createServer((q,r)=>{fs.appendFileSync('/tmp/qa886/catsrv.log',new Date().toISOString()+' '+q.method+' '+q.url+' origin='+(q.headers.origin||'-')+'\n');
r.setHeader('Access-Control-Allow-Origin','*');r.setHeader('Content-Type','application/json');r.end(JSON.stringify(cat));}).listen(8133,'127.0.0.1');
