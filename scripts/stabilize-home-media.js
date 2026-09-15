import fs from 'node:fs';

// Keep the public homepage carousel compatible with admin gallery records.
const mainPath = 'src/main.jsx';
let main = fs.readFileSync(mainPath, 'utf8');
const oldActive = "const activeImage=items[index]?.type==='video'?fallbackImage:items[index]?.src||fallbackImage;";
const newActive = "const activeItem=items[index]||{};const activeImage=activeItem.type==='video'?'':activeItem.src||fallbackImage;";
if (main.includes(oldActive)) main = main.replace(oldActive, newActive);

const oldBackdrop = '<div className="carousel-backdrop" style={{\'--carousel-image\':`url(${JSON.stringify(activeImage)})`}} aria-hidden="true"/>';
const newBackdrop = "{activeItem.type==='video'&&activeItem.src?<video className=\"carousel-backdrop-video\" src={activeItem.src} autoPlay loop muted playsInline aria-hidden=\"true\" onError={e=>{e.currentTarget.style.display='none'}}/>:<div className=\"carousel-backdrop\" style={{'--carousel-image':`url(${JSON.stringify(activeImage)})`}} aria-hidden=\"true\"/>}";
if (main.includes(oldBackdrop)) main = main.replace(oldBackdrop, newBackdrop);

if (!main.includes('carousel-backdrop-video')) {
  throw new Error('Homepage media stabilization could not find the hero carousel.');
}
fs.writeFileSync(mainPath, main);

// Make admin gallery records usable by the React carousel. Existing records that
// use `url` continue to work; new records can explicitly choose image/video.
const adminPath = 'admin/admin-site-content.js';
let admin = fs.readFileSync(adminPath, 'utf8');
const oldSchema = "gallery:{title:'Gallery Image',empty:{title:'',url:'',category:''},fields:[['title','Photo title','text'],['url','Image URL','url'],['category','Category','text']]}";
const newSchema = "gallery:{title:'Gallery Media',empty:{title:'',url:'',category:'',type:'image'},fields:[['title','Media title','text'],['url','Media URL','url'],['type','Media type (image/video)','text'],['category','Category','text']]}";
if (admin.includes(oldSchema)) admin = admin.replace(oldSchema, newSchema);
fs.writeFileSync(adminPath, admin);

console.log('Stabilized homepage hero/video gallery media support.');
