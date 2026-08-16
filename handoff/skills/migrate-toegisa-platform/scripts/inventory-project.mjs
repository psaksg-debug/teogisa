#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root=path.resolve(process.argv[2]||process.cwd());
const output=process.argv[3]?path.resolve(process.argv[3]):null;
const excludedDirs=new Set([".git","node_modules",".next",".vinext","dist",".wrangler","coverage"]);
const excludedFiles=[/^\.DS_Store$/,/^\.env(?:\.|$)/,/^\.dev\.vars$/,/^\.npmrc$/,/^\.pypirc$/,/^\.netrc$/,/^(?:credentials|secrets?)(?:[._-].*)?$/i,/^service-account.*\.json$/i,/\.(?:pem|key|p12|pfx|sqlite|sqlite3|db|log|zip|tar|tgz|gz)$/i];
const files=[];

async function walk(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  for(const entry of entries){
    if(excludedDirs.has(entry.name))continue;
    const absolute=path.join(dir,entry.name);
    const relative=path.relative(root,absolute).split(path.sep).join("/");
    if(entry.isDirectory())await walk(absolute);
    else if(entry.isFile()&&!excludedFiles.some(pattern=>pattern.test(entry.name))){
      const stat=await fs.stat(absolute);files.push({path:relative,size:stat.size});
    }
  }
}

function git(args){try{return execFileSync("git",args,{cwd:root,encoding:"utf8",stdio:["ignore","pipe","ignore"]}).trim();}catch{return null;}}
await walk(root);
files.sort((a,b)=>a.path.localeCompare(b.path));
const required=["package.json","app/page.tsx","lib/repository.ts","db/schema.ts","TOEGISA_AGENT_CONTEXT.md"];
const report={
  schemaVersion:1,generatedAt:new Date().toISOString(),root,
  git:{head:git(["rev-parse","HEAD"]),branch:git(["branch","--show-current"]),status:git(["status","--short"])},
  detected:{sites:files.some(f=>f.path===".openai/hosting.json"),agentConfigs:files.filter(f=>f.path.startsWith(".codex/agents/")).map(f=>f.path),migrations:files.filter(f=>f.path.startsWith("drizzle/")&&f.path.endsWith(".sql")).map(f=>f.path)},
  required:required.map(file=>({file,present:files.some(item=>item.path===file)})),
  secretLikeFilesExcluded:true,fileCount:files.length,totalBytes:files.reduce((sum,file)=>sum+file.size,0),files
};
const json=JSON.stringify(report,null,2)+"\n";
if(output)await fs.writeFile(output,json,"utf8");else process.stdout.write(json);
