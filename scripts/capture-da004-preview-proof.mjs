import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium, devices } from "playwright";
const baseUrl=process.env.VISUAL_BASE_URL??"http://127.0.0.1:4175";
const slug="da-004-close-enough-to-recognize";
const storyPath=`/preview/${slug}/`;
const title="Close Enough to Recognize";
const summary="Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const alt="A small field recorder rests on a table beside rain-streaked windows overlooking dark pines; warm hotel lights lead down an empty corridor to a closed STAFF ONLY door.";
const heroFile="da-004-close-enough-to-recognize__story-hero-master__staff-threshold-corridor__16x9__rain-documentary__v1.0__20260908.webp";
const keyFile="da-004-close-enough-to-recognize__key-art__staff-threshold-corridor__2x3__rain-documentary__v1.0__20260908.webp";
const ogFile="da-004-close-enough-to-recognize__open-graph__staff-threshold-corridor__1200x630__rain-documentary__v1.0__20260908.webp";
const allFiles=[heroFile,keyFile,"da-004-close-enough-to-recognize__story-card__staff-threshold-corridor__3x2__rain-documentary__v1.0__20260908.webp","da-004-close-enough-to-recognize__square__staff-threshold-corridor__1x1__rain-documentary__v1.0__20260908.webp",ogFile,"da-004-close-enough-to-recognize__social__staff-threshold-corridor__4x5__rain-documentary__v1.0__20260908.webp"];
const out=path.join(process.cwd(),"artifacts","da004-preview-proof"); await mkdir(out,{recursive:true});
const open=async(page,url)=>{const r=await page.goto(url,{waitUntil:"networkidle",timeout:30000}); assert(r?.ok(),`${url} returned ${r?.status()}`); await page.evaluate(()=>document.fonts.ready);};
const noOverflow=async(page,label)=>{const d=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));assert(d.s<=d.w+1,`${label} horizontal overflow ${d.s}/${d.w}`);};
const verify=async(page,label,mobile)=>{
 await open(page,`${baseUrl}${storyPath}`);
 assert.equal(await page.title(),`${title} | The Dead Air Archive`);
 assert.equal(await page.locator('meta[name="description"]').getAttribute("content"),summary);
 assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"),"noindex,nofollow,noarchive");
 assert.equal(await page.locator('meta[property="article:published_time"]').count(),0);
 const og=await page.locator('meta[property="og:image"]').getAttribute("content"); const tw=await page.locator('meta[name="twitter:image"]').getAttribute("content");
 assert(og?.includes(ogFile),"OG image is not the dedicated 1200x630 derivative"); assert(tw?.includes(ogFile),"Twitter image is not the dedicated OG derivative");
 const img=page.locator(`#story-hero-image`); assert.equal(await img.count(),1); assert.equal(await img.getAttribute("alt"),alt); assert.equal(await img.getAttribute("loading"),"eager"); assert.equal(await img.getAttribute("fetchpriority"),"high");
 const current=await img.evaluate((el)=>({src:el.currentSrc,nw:el.naturalWidth,nh:el.naturalHeight,complete:el.complete})); assert(current.complete&&current.nw>0);
 if(mobile){assert(current.src.includes(keyFile)); assert.equal(current.nw,240); assert.equal(current.nh,360);} else {assert(current.src.includes(heroFile)); assert.equal(current.nw,480); assert.equal(current.nh,270);}
 const preload=page.locator(`link[rel="preload"][as="image"][href*="${mobile?keyFile:heroFile}"]`); assert.equal(await preload.count(),1,`${label} responsive preload missing`);
 const resource=await page.evaluate((src)=>performance.getEntriesByName(src).map((e)=>({name:e.name,initiatorType:e.initiatorType,startTime:e.startTime,responseEnd:e.responseEnd})),current.src); assert(resource.length>0,`${label} hero resource timing missing`);
 assert.equal(await page.locator("main").count(),1); assert.equal(await page.getByRole("heading",{level:1,name:title,exact:true}).count(),1);
 const h2=page.getByRole("heading",{level:2}); let numbered=0; for(let i=0;i<await h2.count();i++){if(/^\d+\.\s/.test((await h2.nth(i).innerText()).trim())) numbered++;} assert.equal(numbered,10);
 await noOverflow(page,label); await page.evaluate(()=>scrollTo(0,0)); await page.screenshot({path:path.join(out,`${mobile?"mobile-iphone13":"desktop-1440"}-top.png`),fullPage:false});
 const art=page.locator('[data-story-art]'); assert.equal(await art.count(),1); await art.scrollIntoViewIfNeeded(); await art.screenshot({path:path.join(out,`${mobile?"mobile-iphone13":"desktop-1440"}-hero.png`)});
};
const verifyLeakage=async(page)=>{
 const publicResponse=await page.goto(`${baseUrl}/stories/${slug}/`,{waitUntil:"domcontentloaded"}); assert.equal(publicResponse?.status(),404,"Public DA-004 story route must remain unavailable");
 for(const route of ["/stories/","/feed.xml","/sitemap-index.xml"]){const r=await page.goto(`${baseUrl}${route}`,{waitUntil:"domcontentloaded"}); if(r?.ok()){const text=await page.locator("body").innerText().catch(()=>""); const html=await page.content(); assert(!text.includes(title)&&!html.includes(slug),`DA-004 leaked into ${route}`);}}
 for(const file of allFiles){const r=await page.request.get(`${baseUrl}/images/da-004/${file}`); assert(r.ok(),`Missing WebP ${file}`); assert.match(r.headers()["content-type"]??"",/image\/webp/);}
};
const browser=await chromium.launch({headless:true}); let desktop,mobile;
try{
 desktop=await browser.newContext({viewport:{width:1440,height:1200},deviceScaleFactor:1}); const dp=await desktop.newPage(); await verify(dp,"Desktop",false); await verifyLeakage(dp);
 mobile=await browser.newContext({...devices["iPhone 13"]}); const mp=await mobile.newPage(); await verify(mp,"iPhone 13",true);
 console.log("DA-004 private-preview proof PASS: desktop/mobile responsive art and hero captures, exact alt, WebP delivery, noindex, OG/Twitter, withheld leakage controls, semantics, eager/high-priority hero, resource timing, and ten story sections verified.");
} finally {await mobile?.close();await desktop?.close();await browser.close();}
