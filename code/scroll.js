// Smooth, eased scrolling for in-page links (down arrow, "Back to top")
(function () {
  var raf = null;
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }
  function glide(target) {
    stop();
    var start = window.pageYOffset, change = target - start;
    if (Math.abs(change) < 2) return;
    var dur = Math.min(1500, Math.max(700, Math.abs(change) * 0.6));
    var t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      window.scrollTo(0, start + change * ease(p));
      raf = p < 1 ? requestAnimationFrame(frame) : null;
    }
    raf = requestAnimationFrame(frame);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1), y = 0;
    if (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var header = document.querySelector('.site-header');
      y = el.getBoundingClientRect().top + window.pageYOffset - (header ? header.offsetHeight : 0);
    }
    e.preventDefault();
    glide(Math.max(0, y));
  });
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stop, { passive: true }); });
})();
