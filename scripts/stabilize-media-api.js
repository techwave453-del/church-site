import fs from 'node:fs';

const path = 'server.js';
let source = fs.readFileSync(path, 'utf8');

// The public Media API must expose the Supabase featured flag. Without this,
// the database can correctly contain featured=true while the public Media
// page can never see it.
const oldList = "supabase.from('media_items').select('id,title,type,category,description,url,published,created_at').order('created_at',{ascending:false})";
const newList = "supabase.from('media_items').select('id,title,type,category,description,url,featured,published,created_at').order('created_at',{ascending:false})";
if (source.includes(oldList)) source = source.replace(oldList, newList);

// Keep the SQLite fallback compatible with its older schema while exposing a
// stable featured=false value to the frontend.
const oldSqliteList = "sqlite.prepare('SELECT id,title,type,category,description,url,published,created_at FROM media_items ORDER BY created_at DESC').all()";
const newSqliteList = "sqlite.prepare('SELECT id,title,type,category,description,url,0 AS featured,published,created_at FROM media_items ORDER BY created_at DESC').all()";
if (source.includes(oldSqliteList)) source = source.replace(oldSqliteList, newSqliteList);

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

// updateMedia previously discarded featured and published from PATCH requests.
// Add either field only when it is actually supplied, preserving existing values otherwise.
const oldClean = "const clean={title:String(changes.title??'').trim().slice(0,200),description:String(changes.description??'').trim().slice(0,2000),category:String(changes.category??'general').trim().slice(0,100)||'general'};";
const newClean = "const clean={title:String(changes.title??'').trim().slice(0,200),description:String(changes.description??'').trim().slice(0,2000),category:String(changes.category??'general').trim().slice(0,100)||'general'};if(Object.prototype.hasOwnProperty.call(changes,'featured'))clean.featured=Boolean(changes.featured);if(Object.prototype.hasOwnProperty.call(changes,'published'))clean.published=Boolean(changes.published);";
if (source.includes(oldClean)) source = source.replace(oldClean, newClean);

const oldUpdate = "supabase.from('media_items').update(clean).eq('id',numericId).select('id,title,type,category,description,url,created_at').maybeSingle()";
const newUpdate = "supabase.from('media_items').update(clean).eq('id',numericId).select('id,title,type,category,description,url,featured,published,created_at').maybeSingle()";
if (source.includes(oldUpdate)) source = source.replace(oldUpdate, newUpdate);

if (!source.includes("select('id,title,type,category,description,url,featured,published,created_at')")) {
  throw new Error('Media API stabilization did not expose the featured field.');
}

fs.writeFileSync(path, source);
console.log('Stabilized Media API to expose and persist featured/published state.');
