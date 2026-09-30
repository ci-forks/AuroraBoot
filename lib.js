module.exports.toExt=async(h,port,tpl,tag)=>{
  await h.goto(`http://127.0.0.1:${port}/`);await h.ev(`localStorage.setItem('auroraboot_token','pw')`);
  await h.goto(`http://127.0.0.1:${port}/artifacts/new`);
  await h.setInput('main input:not([type=file])','qa886-'+tag);
  await h.click(tpl,'div',true);
  await h.click('Next: System','button',true);await h.sleep(800);
  await h.click('Next: Extensions','button',true);await h.sleep(3000);
};
module.exports.extCard=h=>h.ev(`(()=>{const inp=document.querySelector('[aria-label="Extension catalog URL"]');const card=inp?.closest('[class*=rounded]')?.parentElement?.closest('div');
 const c=[...document.querySelectorAll('div')].filter(d=>d.textContent.includes('Catalog')&&d.contains(inp)).pop();
 return {catalogValue:inp?.value,placeholder:inp?.placeholder,cardText:(inp?.closest('.space-y-4')||c)?.innerText}})()`);
module.exports.catReqs=h=>h.net.filter(r=>/releases\.json|8133/.test(r.url)).map(r=>r.method+' '+r.url);
module.exports.next=async(h,label)=>{await h.click('Next: '+label,'button',true);await h.sleep(900);};
module.exports.check=async(h,name)=>{const ok=await h.ev(`(()=>{const e=document.getElementById('extension-${name}');if(!e)return false;e.click();return true})()`);if(!ok)throw new Error('no ext '+name);await h.sleep(500);};
module.exports.buttons=h=>h.ev(`[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()).filter(Boolean).join(' | ')`);
// intercept artifact create, capture the body, answer 500 so no build runs
module.exports.capture=async(h)=>{h.captured=[];await h.send('Fetch.enable',{patterns:[{urlPattern:'*/api/v1/artifacts*',requestStage:'Request'}]});
  const orig=h.send;};
