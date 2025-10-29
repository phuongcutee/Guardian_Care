// Automatically rewrite social links across pages based on window.SOCIAL_LINKS
(function(){
  function patchLightDOM(){
    var cfg = (window && window.SOCIAL_LINKS) ? window.SOCIAL_LINKS : {};
    if (!cfg) return;
    var map = [
      {host:'facebook.com', url: cfg.facebook},
      {host:'instagram.com', url: cfg.instagram},
      {host:'zalo.me', url: cfg.zalo}
    ];
    // 1) by aria-label
    ['Facebook', 'Instagram', 'Zalo'].forEach(function(lbl){
      var a = document.querySelectorAll('a[aria-label="'+lbl+'"]');
      a.forEach(function(el){
        var key = lbl.toLowerCase();
        var target = cfg[key];
        if (target) el.setAttribute('href', target);
      });
    });
    // 2) by known host in href
    document.querySelectorAll('a[href]').forEach(function(a){
      var href = a.getAttribute('href')||'';
      map.forEach(function(entry){
        if (href.includes(entry.host) && entry.url) a.setAttribute('href', entry.url);
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchLightDOM);
  } else {
    patchLightDOM();
  }
})();