// Erzeugt icon.png (512x512, ohne Rundung: iOS rundet selbst) aus Dewis Vektorgrafik der App.
// Aufruf: node data/make_icon.js   (benötigt playwright)
const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:1});
await p.addInitScript(()=>{window.__test=true;});
await p.goto('file:///home/claude/kata/index.html');
const svg=await p.evaluate(()=>{const h=__run("dwSvg('shades')");const m=h.match(/<svg[\s\S]*<\/svg>/);return m[0];});
await p.setContent(`<!doctype html><style>
html,body{margin:0;background:#000}
.ic{position:relative;width:512px;height:512px;overflow:hidden;
 background:radial-gradient(90% 80% at 50% 38%,#6a2a9c 0%,#3b1766 48%,#1e0c38 100%)}
.ic::before{content:"";position:absolute;inset:0;background:radial-gradient(46% 40% at 50% 50%,rgba(255,92,172,.55),rgba(255,92,172,0) 72%)}
.ic::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 65%,rgba(10,2,24,.35))}
svg{position:absolute;left:34px;top:52px;width:444px;height:auto;z-index:2;filter:drop-shadow(0 14px 14px rgba(10,0,30,.55))}
</style><div class="ic">${svg.replace('<svg ','<svg ')}</div>`);
await p.waitForTimeout(200);
await p.locator('.ic').screenshot({path:'/home/claude/kata/icon.png'});
await b.close();
})();
