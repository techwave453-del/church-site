(function(){
  const mount=document.getElementById('adminHeader');
  if(!mount)return;
  mount.innerHTML='<header class="admin-header"><strong class="admin-header__title">Kingdom Fellowship Christian Church — Admin</strong><div class="admin-header__actions"><span id="apiStatus" class="admin-header__status">Checking…</span><a class="secondary small admin-header__back" href="/" aria-label="Back to website">← Back to Website</a><button class="secondary small" type="button" onclick="logout()">Log out</button></div></header>';
  ['/admin/admin-utils.js','/admin/admin-session.js','/admin/admin-navigation.js','/admin/admin-theme.js','/admin/admin-media.js','/admin/admin-comments.js','/admin/admin-site-content.js','/admin/admin-services.js','/admin/admin-homepage-links.js','/admin/admin-classes.js','/admin/admin-gallery.js','/admin/admin-live.js','/admin/admin-bridge.js'].forEach(src=>{const script=document.createElement('script');script.src=src;script.defer=true;document.head.appendChild(script);});
})();
