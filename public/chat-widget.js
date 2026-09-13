(() => {
  const state = { open: false, loading: false, messages: [] };
  const NAME_KEY = 'church_chat_name';
  const MAX_MESSAGE_LENGTH = 500;

  const style = document.createElement('style');
  style.textContent = `
    .church-chat-panel{position:fixed;right:22px;bottom:92px;width:min(380px,calc(100vw - 28px));height:min(560px,calc(100vh - 120px));z-index:99999;background:#fff;border-radius:20px;box-shadow:0 18px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(0,0,0,.08);font-family:inherit}
    .church-chat-header{padding:16px 18px;background:linear-gradient(135deg,#173f35,#286451);color:#fff;display:flex;align-items:center;justify-content:space-between}.church-chat-title{display:flex;align-items:center;gap:10px}.church-chat-title-icon{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:19px}.church-chat-title strong{display:block;font-size:15px}.church-chat-title small{display:block;opacity:.8;font-size:11px;margin-top:2px}.church-chat-close{border:0;background:transparent;color:#fff;font-size:25px;cursor:pointer;padding:5px}
    .church-chat-messages{flex:1;overflow:auto;padding:16px;background:#f6f8f7;display:flex;flex-direction:column;gap:9px}.church-chat-message{max-width:84%;padding:10px 12px;border-radius:16px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.07);align-self:flex-start}.church-chat-message.mine{align-self:flex-end;background:#dff2e9}.church-chat-message.bot{background:#fff;border:1px solid #e1e9e5}.church-chat-message .meta{font-size:10px;opacity:.58;margin-bottom:4px}.church-chat-message .body{font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}.church-chat-empty{text-align:center;margin:auto;color:#52635d;font-size:13px;line-height:1.5;padding:20px}.church-chat-status{padding:7px 14px;font-size:11px;color:#8a3f2e;background:#fff3ef;border-top:1px solid #f0ddd6}.church-chat-suggestions{display:flex;gap:6px;overflow:auto;padding:8px 10px 2px;background:#fff;border-top:1px solid #e7ebe9}.church-chat-suggestion{white-space:nowrap;border:1px solid #cbd9d3;background:#f7faf8;color:#235846;border-radius:999px;padding:7px 10px;font-size:11px;cursor:pointer}.church-chat-form{padding:10px;background:#fff;border-top:1px solid #e7ebe9}.church-chat-name{width:100%;box-sizing:border-box;border:1px solid #d9e0dd;border-radius:10px;padding:9px 10px;margin-bottom:8px;font:inherit;font-size:12px;outline:none}.church-chat-row{display:flex;gap:8px}.church-chat-input{flex:1;resize:none;min-height:42px;max-height:100px;border:1px solid #d9e0dd;border-radius:12px;padding:10px;font:inherit;font-size:13px;outline:none}.church-chat-input:focus,.church-chat-name:focus{border-color:#286451}.church-chat-send{width:44px;border:0;border-radius:12px;background:#286451;color:#fff;cursor:pointer;font-size:18px}.church-chat-send:disabled{opacity:.5;cursor:not-allowed}.church-chat-note{font-size:10px;color:#65736e;padding:6px 2px 0}@media(max-width:600px){.church-chat-panel{right:10px;bottom:82px;width:calc(100vw - 20px);height:min(620px,calc(100vh - 100px));border-radius:18px}.church-chat-messages{padding:13px}}
  `;
  document.head.appendChild(style);

  const esc = v => String(v ?? '');
  const getName = () => localStorage.getItem(NAME_KEY) || '';
  const setName = v => localStorage.setItem(NAME_KEY, v.trim().slice(0,60));

  function createPanel(){
    if(document.querySelector('.church-chat-panel')) return document.querySelector('.church-chat-panel');
    const panel=document.createElement('section'); panel.className='church-chat-panel'; panel.setAttribute('aria-label','Church assistant chat');
    panel.innerHTML=`<div class="church-chat-header"><div class="church-chat-title"><span class="church-chat-title-icon">🤖</span><div><strong>Church Assistant</strong><small>Answers from the latest church website information</small></div></div><button class="church-chat-close" type="button" aria-label="Close chat">×</button></div><div class="church-chat-messages"><div class="church-chat-empty">Welcome! 👋<br>I can help with services, visiting, prayer, ministries, giving, events, live worship and getting connected. 🙏</div></div><div class="church-chat-status" hidden></div><div class="church-chat-suggestions"><button class="church-chat-suggestion" data-question="When is the next church service and what time does it start?">Service times</button><button class="church-chat-suggestion" data-question="I'm visiting for the first time. What should I know?">I'm new here</button><button class="church-chat-suggestion" data-question="What's the best way to contact the church?">Contact</button><button class="church-chat-suggestion" data-question="What events are coming up?">Events</button></div><form class="church-chat-form"><input class="church-chat-name" maxlength="60" placeholder="Your name" autocomplete="name"><div class="church-chat-row"><textarea class="church-chat-input" maxlength="500" placeholder="Ask us a question…" rows="1" required></textarea><button class="church-chat-send" type="submit" aria-label="Send message">➤</button></div><div class="church-chat-note">Church-specific answers are taken from information published and controlled through the admin panel. 🙏</div></form>`;
    document.body.appendChild(panel); panel.querySelector('.church-chat-name').value=getName();
    panel.querySelector('.church-chat-close').onclick=close; panel.querySelector('.church-chat-form').onsubmit=sendMessage;
    panel.querySelectorAll('.church-chat-suggestion').forEach(b=>b.onclick=()=>ask(b.dataset.question));
    panel.querySelector('.church-chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();panel.querySelector('form').requestSubmit();}});
    return panel;
  }
  function setStatus(msg){const e=document.querySelector('.church-chat-status');if(e){e.textContent=msg||'';e.hidden=!msg;}}
  function addMessage(name,text,type='bot'){state.messages.push({name,text,type,created_at:new Date().toISOString()});render();}
  function render(){const p=createPanel(),b=p.querySelector('.church-chat-messages');if(!state.messages.length){b.innerHTML='<div class="church-chat-empty">Welcome! 👋</div>';return;}b.innerHTML='';state.messages.forEach(m=>{const i=document.createElement('div');i.className='church-chat-message'+(m.type==='user'?' mine':' bot');const meta=document.createElement('div');meta.className='meta';meta.textContent=`${esc(m.name)} · ${new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}`;const body=document.createElement('div');body.className='body';body.textContent=esc(m.text);i.append(meta,body);b.appendChild(i);});b.scrollTop=b.scrollHeight;}

  // Always request current public site content before answering. This intentionally avoids
  // a long-lived client cache so admin-panel changes are reflected in an open chat.
  async function loadSite(){
    const response=await fetch('/api/site/content',{method:'GET',headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok) throw new Error(`site-content-${response.status}`);
    const site=await response.json();
    if(!site||typeof site!=='object') throw new Error('invalid-site-content');
    return site;
  }

  function normalize(t){return String(t||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
  const topicWords={service:['service','services','worship','sunday','meeting','meet','gathering','schedule','service times'],newHere:['new here','first time','first visit','visitor','visiting','new to the church'],contact:['contact','phone','telephone','mobile','email','mail','call','reach','get in touch'],prayer:['pray','prayer','prayers','prayer request','need prayer'],giving:['give','giving','offering','tithe','donate','donation','contribute'],ministry:['ministry','ministries','serve','serving','volunteer','team','department','get involved'],live:['live','live stream','livestream','online service','watch live','broadcast','stream'],event:['event','events','program','programs','calendar','upcoming','activity','activities','what is happening'],membership:['membership','member','join the church','class','classes','course','registration'],about:['about','belief','beliefs','vision','mission','history','who are you'],location:['location','where are you','where is the church','address','directions','branch','find the church'],pastor:['pastor','pastors','minister','ministers','bishop','leader','leaders','leadership'],youth:['youth','young people','teen','teenagers','young adults'],children:['children','child','kids','kid','sunday school','kids church'],counselling:['counselling','counseling','counsellor','counselor','guidance'],baptism:['baptism','baptize','baptised','baptized'],salvation:['salvation','saved','accept jesus','accept christ','born again']};
  const has=(q,a)=>a.some(x=>q===x||q.includes(x));
  function topic(q){let best=null,score=0;for(const [k,words] of Object.entries(topicWords)){const s=words.reduce((n,w)=>n+(q.includes(w)?(w.includes(' ')?3:1):0),0);if(s>score){score=s;best=k;}}return best;}

  function listValue(value,mapper){return Array.isArray(value)?value.map(mapper).filter(Boolean):[];}
  function services(site){const rows=listValue(site.services,s=>`• ${s.title||'Service'}: ${s.time||s.schedule||s.description||'See the website for details'}`);return rows.length?`Here are the current service times:\n\n${rows.join('\n')}\n\nWe'd love to worship with you! 🙏`:'I could not find a published service schedule right now. Please check the Service Times section of the website.';}
  function contact(site,church){const parts=[];if(site.phone)parts.push(`📞 ${site.phone}`);if(site.email)parts.push(`✉️ ${site.email}`);if(site.address)parts.push(`📍 ${site.address}`);return parts.length?`You can contact ${church} through:\n\n${parts.join('\n')}\n\nWe'll be happy to help you. 😊`:`I could not find the church's current contact details in the published website information. Please use the Contact section of the website.`;}
  function genericList(label,value){const rows=listValue(value,x=>{if(typeof x==='string')return `• ${x}`;return `• ${x.title||x.name||x.label||x.description||''}`;});return rows.length?`Here is the current published ${label}:\n\n${rows.join('\n')}`:null;}

  function answer(q,site){
    const n=normalize(q), church=site.churchName||'our church'; if(!n)return 'Please type a question and I’ll do my best to help. 😊';
    if(has(n,['hello','hi','hey','good morning','good afternoon','good evening']))return `Hello! 👋 Welcome to ${church}. How can I help you today?`;
    const t=topic(n);
    if(t==='service')return services(site);
    if(t==='newHere')return `Welcome! ❤️ ${site.aboutText||`We’re glad you’re considering visiting ${church}.`}\n\nFor a first visit, please use the “I’m New Here” information published on the website. If you need anything else, ${site.phone?`call ${site.phone}`:'contact the church'} and we’ll be happy to help.`;
    if(t==='contact')return contact(site,church);
    if(t==='about')return site.aboutText||`Please see the About section of the website for the church's current published information.`;
    if(t==='location')return site.address?`📍 The church's published address is:\n\n${site.address}`:'I could not find a published address in the current website information. Please use the Find a Branch/Contact section.';
    if(t==='live'){const l=site.liveStream||{};return l.enabled&&l.url?`${l.title||'Live Worship Service'} is available here:\n${l.url}\n\n${l.description||'Join us online for worship, the Word and fellowship. 🙏'}`:'The live stream is not currently available according to the published website settings. Please check the Live page when a service is scheduled.';}
    if(t==='membership'){const r=genericList('membership and faith classes',site.membershipClasses);return r?`${r}\n\nPlease use the published registration/contact option to get started. 🙌`:'No current membership classes are published. Please check the Faith & Membership section.';}
    if(t==='event'){const r=genericList('upcoming events and programmes',site.events||site.upcomingEvents||site.programs);return r?`${r}\n\nFor dates and details, please use the published Events section. 📅`:'I could not find current event details in the published site content. Please check the Events section for the latest schedule. 📅';}
    if(t==='ministry'){const r=genericList('ministries',site.ministries||site.ministry);return r?`${r}\n\nIf you want to serve, I can help you find the relevant ministry. 🤝`:'No ministry list is currently exposed in the public site content. Please check the Ministries section or contact the church.';}
    if(t==='youth'||t==='children'){const r=genericList(t==='youth'?'youth information':'children’s ministry information',t==='youth'?(site.youth||site.youthMinistry):(site.children||site.childrenMinistry));return r||`Please check the Ministries and Events sections for the current ${t==='youth'?'youth':'children’s'} programme, or contact the church.`;}
    if(t==='giving')return `Thank you for your heart to give. ❤️ Please use the Giving information published on the website for the church's current instructions. If the published giving details are not available right now, please contact the church directly rather than relying on an outdated method.`;
    if(t==='prayer')return 'We would be honoured to pray with you. 🙏 Please use the prayer/contact option published on the website or contact the church directly.';
    if(t==='pastor')return 'Please check the current About/Leadership information published on the website. I will not guess a leader’s name when it is not available in the published site data.';
    if(t==='counselling')return 'For pastoral counselling or guidance, please use the current contact information published on the website so a suitable church leader can speak with you privately. 🙏';
    if(t==='baptism')return 'Please check the current baptism/ministry information published on the website or contact the church for the latest preparation and next steps. 🙏';
    if(t==='salvation')return 'If you want to know more about following Jesus, we’d be glad to walk with you. ❤️ Please contact the church or join a published service so someone can speak with you personally.';
    if(has(n,['where'])&&has(n,['service','worship']))return `${services(site)}\n\nFor location, ${site.address?`the published address is ${site.address}.`:'please use the Find a Branch/Contact section.'}`;
    return `I’m sorry, I don’t have a reliable church-specific answer for that in the information currently published on the website. 🙏 I can help with service times, visiting, contact details, prayer, ministries, giving, live worship, membership classes, events and location.\n\nPlease contact ${church} directly for anything not published on the website.`;
  }

  async function ask(question){
    if(state.loading)return; const clean=String(question||'').trim().slice(0,MAX_MESSAGE_LENGTH);if(!clean)return;
    const p=createPanel(),nameEl=p.querySelector('.church-chat-name'),name=nameEl.value.trim()||'Visitor';setName(name);state.loading=true;p.querySelector('.church-chat-send').disabled=true;const input=p.querySelector('.church-chat-input');addMessage(name,clean,'user');input.value='';setStatus('Checking the latest church information…');
    try{const site=await loadSite();await new Promise(r=>setTimeout(r,200));addMessage('Church Assistant',answer(clean,site),'bot');setStatus('');}
    catch(e){addMessage('Church Assistant','I’m having trouble loading the latest church information right now. Please try again or contact the church directly. 🙏');setStatus('');}
    finally{state.loading=false;p.querySelector('.church-chat-send').disabled=false;input.focus();}
  }
  function sendMessage(e){e.preventDefault();if(state.loading)return;const i=createPanel().querySelector('.church-chat-input');if(i.value.trim())ask(i.value);}
  function open(){const p=createPanel();p.style.display='flex';state.open=true;}
  function close(){const p=document.querySelector('.church-chat-panel');if(p)p.style.display='none';state.open=false;}
  document.addEventListener('click',e=>{const bubble=e.target.closest?.('.chat');if(!bubble)return;e.preventDefault();e.stopPropagation();open();},true);
})();
