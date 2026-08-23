(function(){
  const mount=document.getElementById('adminHeader');
  if(!mount)return;
  mount.innerHTML='<header><strong>Kingdom Fellowship Christian Church — Admin</strong><div class="actions"><span id="apiStatus" class="status">Checking…</span><a class="secondary small admin-back-link" href="/" aria-label="Back to website" style="display:inline-flex;align-items:center;text-decoration:none">← Back to Website</a><button class="secondary small" type="button" onclick="logout()">Log out</button></div></header>';
  ['/admin/admin-navigation.js','/admin/admin-theme.js','/admin/admin-media.js','/admin/admin-comments.js'].forEach(src=>{const script=document.createElement('script');script.src=src;script.defer=true;document.head.appendChild(script);});
})();
