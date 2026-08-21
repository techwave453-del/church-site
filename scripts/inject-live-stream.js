import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const file = path.join(root, 'src', 'main.jsx');
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(from, to, label) {
  if (!source.includes(from)) throw new Error(`Live stream injection failed: pattern not found (${label})`);
  source = source.replace(from, to);
}

replaceOnce('import{DEFAULT_SITE_CONTENT}from"../site-config.js";', 'import{DEFAULT_SITE_CONTENT}from"../site-config.js";\nimport LiveStream from"./LiveStream.jsx";', 'import');
replaceOnce('const navTargets={Home:"home",About:"about",Events:"events","Visit Us":"visit",Media:"media",Resources:"resources",Give:"give",Contact:"contact"};', 'const navTargets={Home:"home",Live:"live",About:"about",Events:"events","Visit Us":"visit",Media:"media",Resources:"resources",Give:"give",Contact:"contact"};', 'navigation');
replaceOnce('<section className="homeSection servicesSection" id="events">', '<LiveStream liveStream={church.liveStream}/><section className="homeSection servicesSection" id="events">', 'live section');
replaceOnce('<form onSubmit={saveSite}><h2>Site content</h2><label>Background Audio URL', '<form onSubmit={saveSite}><h2>Site content</h2><section className="adminLiveCard"><h3>Live Streaming</h3><label><input type="checkbox" checked={Boolean(siteContent.liveStream?.enabled)} onChange={e=>setSiteContent({...siteContent,liveStream:{...(siteContent.liveStream||{}),enabled:e.target.checked}})}/> Enable live stream</label><label>YouTube Live URL<input type="url" value={siteContent.liveStream?.url||""} onChange={e=>setSiteContent({...siteContent,liveStream:{...(siteContent.liveStream||{}),url:e.target.value}})} placeholder="https://www.youtube.com/live/..."/></label><label>Live service title<input value={siteContent.liveStream?.title||""} onChange={e=>setSiteContent({...siteContent,liveStream:{...(siteContent.liveStream||{}),title:e.target.value}})} placeholder="Sunday Worship Service"/></label><label>Live service description<textarea value={siteContent.liveStream?.description||""} onChange={e=>setSiteContent({...siteContent,liveStream:{...(siteContent.liveStream||{}),description:e.target.value}})} placeholder="Join us live for worship..."/></label><small>Start the broadcast on YouTube, paste its Live URL here, then enable the switch. Turn it off after the service.</small></section><label>Background Audio URL', 'admin fields');

fs.writeFileSync(file, source);
