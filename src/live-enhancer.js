/* Live-stream enhancer: works independently of the React page so the floating Live control
   is available after the public site loads and opens the configured YouTube broadcast. */
(function(){
  const getId = (value) => {
    const v = String(value || '').trim();
    if (!v) return '';
    const patterns = [
      /youtu\.be\/([A-Za-z0-9_-]{11})/,
      /[?&]v=([A-Za-z0-9_-]{11})/,
      /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
      /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/
    ];
    for (const p of patterns) { const m = v.match(p); if (m) return m[1]; }
    return '';
  };

  const addStyles = () => {
    if (document.getElementById('live-enhancer-styles')) return;
    const style = document.createElement('style');
    style.id = 'live-enhancer-styles';
    style.textContent = `
      #live-enhancer-button{position:fixed;right:24px;bottom:92px;z-index:9998;width:58px;height:58px;border:0;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#ff3030,#c90000);color:#fff;cursor:pointer;box-shadow:0 14px 36px rgba(0,0,0,.32);font:800 11px Arial,sans-serif;letter-spacing:.04em}
      #live-enhancer-button:hover{transform:translateY(-2px)}
      #live-enhancer-button span{position:relative}
      #live-enhancer-button span:before{content:"";display:inline-block;width:8px;height:8px;margin-right:5px;border-radius:50%;background:#fff;vertical-align:1px;animation:liveEnhancerPulse 1.4s infinite}
      @keyframes liveEnhancerPulse{50%{opacity:.45;transform:scale(.8)}}
      #live-enhancer-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.78);backdrop-filter:blur(5px)}
      #live-enhancer-modal.open{display:flex}
      #live-enhancer-card{width:min(100%,1000px);background:#111;color:#fff;border-radius:18px;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.55)}
      #live-enhancer-head{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 18px}
      #live-enhancer-head strong{font:800 18px Arial,sans-serif}
      #live-enhancer-close{border:0;background:transparent;color:#fff;font-size:30px;line-height:1;cursor:pointer;padding:0 4px}
      #live-enhancer-player{aspect-ratio:16/9;background:#000}
      #live-enhancer-player iframe{width:100%;height:100%;border:0;display:block}
      #live-enhancer-note{padding:10px 18px 15px;color:#bbb;font:14px Arial,sans-serif}
      @media(max-width:700px){#live-enhancer-button{right:14px;bottom:74px;width:52px;height:52px}#live-enhancer-modal{padding:10px}#live-enhancer-head strong{font-size:16px}}
    `;
    document.head.appendChild(style);
  };

  const mount = async () => {
    try {
      const response = await fetch('/api/site/content', {cache:'no-store'});
      if (!response.ok) return;
      const content = await response.json();
      const live = content && content.liveStream;
      if (!live || !live.enabled) return;
      const videoId = getId(live.url || live.videoUrl);
      if (!videoId) return;

      addStyles();
      let button = document.getElementById('live-enhancer-button');
      if (!button) {
        button = document.createElement('button');
        button.id = 'live-enhancer-button';
        button.type = 'button';
        button.setAttribute('aria-label', 'Open live worship service');
        button.innerHTML = '<span>LIVE</span>';
        document.body.appendChild(button);
      }

      let modal = document.getElementById('live-enhancer-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'live-enhancer-modal';
        modal.innerHTML = `<div id="live-enhancer-card" role="dialog" aria-modal="true" aria-label="Live worship service"><div id="live-enhancer-head"><strong></strong><button id="live-enhancer-close" type="button" aria-label="Close live player">&times;</button></div><div id="live-enhancer-player"></div><div id="live-enhancer-note">Live worship service</div></div>`;
        document.body.appendChild(modal);
      }

      const title = live.title || 'Live Worship Service';
      modal.querySelector('#live-enhancer-head strong').textContent = title;
      modal.querySelector('#live-enhancer-note').textContent = live.description || 'Join us live for worship, the Word of God and fellowship.';

      const open = () => {
        const player = modal.querySelector('#live-enhancer-player');
        player.innerHTML = `<iframe title="${title.replace(/"/g,'&quot;')}" src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>`;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      };
      const close = () => {
        modal.classList.remove('open');
        modal.querySelector('#live-enhancer-player').innerHTML = '';
        document.body.style.overflow = '';
      };
      button.onclick = open;
      modal.querySelector('#live-enhancer-close').onclick = close;
      modal.onclick = (event) => { if (event.target === modal) close(); };
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); }, {once:false});
    } catch (_) {}
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, {once:true});
  else mount();
})();
