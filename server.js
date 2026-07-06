#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const TYPES = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.yml':'text/yaml; charset=utf-8'};
function safePath(urlPath){
  const clean = decodeURIComponent((urlPath || '/').split('?')[0]);
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  const resolved = path.resolve(ROOT, rel);
  if(!resolved.startsWith(ROOT)) return null;
  return resolved;
}
http.createServer((req,res)=>{
  if(req.url === '/health'){
    res.writeHead(200, {'content-type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({ok:true,app:'EGX Pro Hub',mode:'static'}));
    return;
  }
  const file = safePath(req.url);
  if(!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
    res.writeHead(404, {'content-type':'text/plain; charset=utf-8'});
    res.end('Not found');
    return;
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {'content-type': TYPES[ext] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
}).listen(PORT, ()=>console.log(`EGX Pro Hub static server running on ${PORT}`));
