(function(){
  const ids={site:'site',media:'media',comments:'comments'};
  window.adminTabs={select:function(name,button){const target=ids[name]||'site';Object.values(ids).forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('hidden',id!==target)});document.querySelectorAll('.tabs button').forEach(el=>el.classList.remove('active'));(button||document.querySelector('.tabs button[data-tab="'+target+'"]'))?.classList.add('active');if(target==='media'&&window.loadMedia)window.loadMedia();if(target==='comments'&&window.loadAdminComments)window.loadAdminComments();}};
  window.tab=function(name,button){window.adminTabs.select(name,button)};
})();
