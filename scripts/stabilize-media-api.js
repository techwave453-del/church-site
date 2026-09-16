import fs from 'node:fs';

const path = 'server.js';
let source = fs.readFileSync(path, 'utf8');

// The public Media API must expose only published media. Admins use the
// authenticated /api/admin/media endpoint so unpublished media URLs are never
// leaked through the public API.
const oldList = "async function listMedia(){if(useSupabase){const{data,error}=await supabase.from('media_items').select('id,title,type,category,description,url,published,created_at').order('created_at',{ascending:false});if(error)throw error;return data||[];}return sqlite.prepare('SELECT id,title,type,category,description,url,published,created_at FROM media_items ORDER BY created_at DESC').all();}";
const newList = "async function listMedia(){if(useSupabase){const{data,error}=await supabase.from('media_items').select('id,title,type,category,description,url,featured,published,created_at').order('created_at',{ascending:false});if(error)throw error;return data||[];}return sqlite.prepare('SELECT id,title,type,category,description,url,0 AS featured,published,created_at FROM media_items ORDER BY created_at DESC').all();}async function listPublicMedia(){if(useSupabase){const{data,error}=await supabase.from('media_items').select('id,title,type,category,description,url,featured,published,created_at').eq('published',true).order('created_at',{ascending:false});if(error)throw error;return data||[];}return sqlite.prepare('SELECT id,title,type,category,description,url,0 AS featured,published,created_at FROM media_items WHERE published=1 ORDER BY created_at DESC').all();}";
if (source.includes(oldList)) source = source.replace(oldList, newList);

// Preserve featured and publish state when an admin creates media through the API.
source = source.replace(
  "const{title,description,category,type}=req.body||{}",
  "const{title,description,category,type,featured,published}=req.body||{}"
);
source = source.replace(
  "addMedia({title:cleanTitle,description:cleanDescription,category:cleanCategory,type:mediaType,url,storage_path:storagePath,published:true})",
  "addMedia({title:cleanTitle,description:cleanDescription,category:cleanCategory,type:mediaType,url,storage_path:storagePath,published:published === undefined ? true : Boolean(published),featured:Boolean(featured)})"
);

const oldAdd = "supabase.from('media_items').insert(item).select('id,title,type,category,description,url,published,created_at').single()";
const newAdd = "supabase.from('media_items').insert(item).select('id,title,type,category,description,url,featured,published,created_at').single()";
if (source.includes(oldAdd)) source = source.replace(oldAdd, newAdd);

// updateMedia accepts metadata, publication state and featured state. Fields
// are applied only when supplied so partial edits remain safe.
const oldClean = "const clean={title:String(changes.title??'').trim().slice(0,200),description:String(changes.description??'').trim().slice(0,2000),category:String(changes.category??'general').trim().slice(0,100)||'general'};";
const newClean = "const clean={title:String(changes.title??'').trim().slice(0,200),description:String(changes.description??'').trim().slice(0,2000),category:String(changes.category??'general').trim().slice(0,100)||'general'};if(Object.prototype.hasOwnProperty.call(changes,'featured'))clean.featured=Boolean(changes.featured);if(Object.prototype.hasOwnProperty.call(changes,'published'))clean.published=Boolean(changes.published);";
if (source.includes(oldClean)) source = source.replace(oldClean, newClean);

const oldUpdate = "supabase.from('media_items').update(clean).eq('id',numericId).select('id,title,type,category,description,url,created_at').maybeSingle()";
const newUpdate = "supabase.from('media_items').update(clean).eq('id',numericId).select('id,title,type,category,description,url,featured,published,created_at').maybeSingle()";
if (source.includes(oldUpdate)) source = source.replace(oldUpdate, newUpdate);

// Add a permission-protected admin list endpoint and keep the public endpoint
// limited to published content.
const oldMediaListRoute = "app.get('/api/media',async(_req,res)=>{try{res.json(await listMedia());}catch(error){console.error(error);res.status(500).json({error:'Unable to load media.'});}});";
const newMediaListRoute = "app.get('/api/admin/media',requireAdmin,rbacRoutes?.requirePermission?.('media.view')||((_req,_res,next)=>next()),async(_req,res)=>{try{res.json(await listMedia());}catch(error){console.error(error);res.status(500).json({error:'Unable to load media.'});}});app.get('/api/media',async(_req,res)=>{try{res.json(await listPublicMedia());}catch(error){console.error(error);res.status(500).json({error:'Unable to load media.'});}});";
if (source.includes(oldMediaListRoute)) source = source.replace(oldMediaListRoute, newMediaListRoute);

if (!source.includes("app.get('/api/admin/media',requireAdmin")) {
  throw new Error('Media API stabilization did not create the protected admin media list.');
}
if (!source.includes(".eq('published',true)")) {
  throw new Error('Media API stabilization did not restrict public Supabase media to published items.');
}
if (!source.includes("select('id,title,type,category,description,url,featured,published,created_at')")) {
  throw new Error('Media API stabilization did not expose the featured field.');
}

fs.writeFileSync(path, source);
console.log('Stabilized Media API with protected admin media visibility and published-only public media.');
