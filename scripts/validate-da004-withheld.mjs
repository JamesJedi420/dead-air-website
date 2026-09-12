import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
const root=process.cwd(), dist=path.join(root,"dist"), source=path.join(root,"src/content/stories/da-004-close-enough-to-recognize.md"), lockPath=path.join(root,"src/manuscripts/da-004/source-lock.json");
const preview=process.env.CONTEXT==="deploy-preview";
const slug="da-004-close-enough-to-recognize", title="Close Enough to Recognize";
const summary="Eli brings his father to the Kestrel Hotel hoping for one paranormal event they can share. Then they hear a knock pattern from an old family story.";
const alt="A small field recorder rests on a table beside rain-streaked windows overlooking dark pines; warm hotel lights lead down an empty corridor to a closed STAFF ONLY door.";
const expectedSourceSha="3ccd31348217394e176baa690b653a5c608ee8e5c2df72b0ad4a35df83c9be71";
const assets=[
["da-004-close-enough-to-recognize__story-hero-master__staff-threshold-corridor__16x9__rain-documentary__v1.0__20260908.webp","823307bfbbcf3c3b173ff31fda0b478a34bed2e493d9a587696d3c026841af54"],
["da-004-close-enough-to-recognize__key-art__staff-threshold-corridor__2x3__rain-documentary__v1.0__20260908.webp","0908bee942f2aab60d9445b0c199247614f167a9eca398f84c1dc9b646fe6097"],
["da-004-close-enough-to-recognize__story-card__staff-threshold-corridor__3x2__rain-documentary__v1.0__20260908.webp","6daeae68ef49d2cb74536981b25e7d8398e240fb536098c75d02352faa7b0aa7"],
["da-004-close-enough-to-recognize__square__staff-threshold-corridor__1x1__rain-documentary__v1.0__20260908.webp","597bfbdf9934e03a8b32d5fb64bb1d58f9ef72eeaaaae1bcbcee4b0d42243eb5"],
["da-004-close-enough-to-recognize__open-graph__staff-threshold-corridor__1200x630__rain-documentary__v1.0__20260908.webp","033213c7eec60eb1810ac984ebeaaf45ad310fe010e716f00a9328775fe8b467"],
["da-004-close-enough-to-recognize__social__staff-threshold-corridor__4x5__rain-documentary__v1.0__20260908.webp","219d68789b934204967f811d661a77f699fb3ff56bea9c52d6b4118ec5d7634b"]];
const exists=async(p)=>{try{await stat(p);return true}catch{return false}};
if(!(await exists(dist))||!(await exists(source))||!(await exists(lockPath))) throw new Error("DA-004 validation prerequisites missing.");
const lock=JSON.parse(await readFile(lockPath,"utf8")); if(lock.canonicalFragmentSha256!==expectedSourceSha||lock.publicReleaseAuthorized!==false||lock.lockStatus!=="IMMUTABLE_APPROVED_SOURCE") throw new Error("DA-004 source lock changed.");
const sourceText=await readFile(source,"utf8");
for(const value of [`slug: ${slug}`,`title: ${title}`,`summary: ${summary}`,"status: withheld","draft: true","previewOnly: true",`coverAlt: \"${alt}\"`,"## 1. Arrival","## 10. Raw Audio"]) if(!sourceText.includes(value)) throw new Error(`DA-004 materialized source missing ${value}`);
if(/publicationDate:/i.test(sourceText)) throw new Error("DA-004 must not have a publication date.");
const previewPage=path.join(dist,"preview",slug,"index.html"), publicPage=path.join(dist,"stories",slug,"index.html"), assetDir=path.join(dist,"images","da-004");
if(preview){
 if(!(await exists(previewPage))) throw new Error("DA-004 deploy-preview route missing.");
 if(await exists(publicPage)) throw new Error("DA-004 public story route generated during preview.");
 const html=await readFile(previewPage,"utf8");
 for(const value of [title,summary,alt,"noindex,nofollow,noarchive","fetchpriority=\"high\"","loading=\"eager\""]) if(!html.includes(value)) throw new Error(`DA-004 preview missing ${value}`);
 if(/article:published_time/.test(html)) throw new Error("DA-004 preview leaked publication time.");
 for(const [filename,expected] of assets){ const file=path.join(assetDir,filename); if(!(await exists(file))) throw new Error(`Missing preview asset ${filename}`); const actual=createHash("sha256").update(await readFile(file)).digest("hex"); if(actual!==expected) throw new Error(`Preview asset hash mismatch ${filename}`); }
 for(const relative of ["stories/index.html","feed.xml","sitemap-index.xml"]){ const file=path.join(dist,relative); if(await exists(file)){ const text=await readFile(file,"utf8"); if(text.includes(title)||text.includes(slug)) throw new Error(`DA-004 leaked into ${relative}`); } }
 console.log("DA-004 deploy-preview validation PASS: private route, six assets, noindex, no publication metadata, and archive/feed/sitemap isolation confirmed.");
}else{
 if(await exists(previewPage)||await exists(publicPage)||await exists(assetDir)) throw new Error("DA-004 reader-facing route/assets generated outside deploy-preview context.");
 const forbidden=[title,slug,summary,"By the time Eli turned the camera on","Neither of them named what had made the rhythm."];
 const files=[]; const walk=async(d)=>{for(const e of await readdir(d,{withFileTypes:true})){const p=path.join(d,e.name); if(e.isDirectory()) await walk(p); else if(e.isFile()&&/\.(html|xml|json|txt|js|css|map)$/i.test(e.name)) files.push(p);}}; await walk(dist);
 for(const file of files){const text=await readFile(file,"utf8"); for(const value of forbidden) if(text.includes(value)) throw new Error(`DA-004 leaked into ${path.relative(dist,file)}`);}
 console.log(`DA-004 withheld-output validation PASS across ${files.length} text outputs; no reader-facing leakage; publicReleaseAuthorized=false.`);
}
