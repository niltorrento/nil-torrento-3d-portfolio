// Home page: reel fallback + auto-moving carousels (Featured Projects and Projects)
(function () {
  // --- Reel ---
  // YouTube refuses embeds from pages opened as files (file://, "Error 153").
  // In that case show a thumbnail that opens the video on YouTube instead.
  var reel = document.getElementById('reel');
  if (reel && location.protocol === 'file:') {
    var id = 'zF50GhnikD0';
    reel.innerHTML = '<a class="reel-fallback" href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener" aria-label="Watch the reel on YouTube">' +
      '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="">' +
      '<span class="play" aria-hidden="true">&#9654;</span>' +
      '<span class="note">Local preview: opens on YouTube. The embedded player works once the site is online.</span></a>';
  }

  // --- Carousels ---
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }

  function initCarousel(block) {
    var track = block.querySelector('.carousel');
    var arrows = block.querySelectorAll('.car-btn[data-dir]');
    var toggle = block.querySelector('.car-toggle');
    var interval = Number(track.dataset.interval) || 4000;
    var playing = true;   // autoplay on by default
    var held = false;     // hover / focus / touch
    var raf = null;

    function maxScroll() { return track.scrollWidth - track.clientWidth; }
    function offsets() {
      var left = track.getBoundingClientRect().left;
      return Array.prototype.map.call(track.querySelectorAll('.slide'), function (s) {
        return Math.min(s.getBoundingClientRect().left - left + track.scrollLeft, maxScroll());
      });
    }
    function cancel() {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      track.style.scrollSnapType = '';
    }
    // Eased scroll: smoother than the browser's built-in smooth scrolling with snap points
    function glide(target, duration) {
      cancel();
      var start = track.scrollLeft, change = target - start, t0 = null;
      if (Math.abs(change) < 1) return;
      track.style.scrollSnapType = 'none';
      function frame(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / duration, 1);
        track.scrollLeft = start + change * ease(p);
        if (p < 1) raf = requestAnimationFrame(frame); else cancel();
      }
      raf = requestAnimationFrame(frame);
    }
    function next(loop) {
      var x = track.scrollLeft, o = offsets();
      if (x >= maxScroll() - 2) { if (loop) glide(0, 1100); return; }
      var t = o.filter(function (v) { return v > x + 2; })[0];
      glide(t === undefined ? maxScroll() : t, 850);
    }
    function prev() {
      var x = track.scrollLeft, o = offsets().filter(function (v) { return v < x - 2; });
      glide(o.length ? o[o.length - 1] : 0, 850);
    }
    function update() {
      var max = maxScroll() - 2;
      block.classList.toggle('no-scroll', max <= 0);
      arrows.forEach(function (b) {
        b.disabled = Number(b.dataset.dir) < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max;
      });
    }
    function label() {
      toggle.innerHTML = playing ? '&#10074;&#10074;' : '&#9654;';
      toggle.setAttribute('aria-label', playing ? 'Pause autoplay' : 'Play autoplay');
    }

    arrows.forEach(function (b) {
      b.addEventListener('click', function () { Number(b.dataset.dir) < 0 ? prev() : next(false); });
    });
    if (toggle) toggle.addEventListener('click', function () { playing = !playing; label(); });
    track.addEventListener('scroll', update, { passive: true });
    ['wheel', 'touchstart', 'pointerdown'].forEach(function (ev) { track.addEventListener(ev, cancel, { passive: true }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') next(false);
      if (e.key === 'ArrowLeft') prev();
    });
    ['mouseenter', 'focusin'].forEach(function (ev) { track.addEventListener(ev, function () { held = true; }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { track.addEventListener(ev, function () { held = false; }); });
    track.addEventListener('touchstart', function () { held = true; }, { passive: true });
    track.addEventListener('touchend', function () { setTimeout(function () { held = false; }, 5000); }, { passive: true });
    window.addEventListener('resize', update);

    label();
    update();
    setInterval(function () {
      if (playing && !held && !document.hidden && maxScroll() > 2) next(true);
    }, interval);
  }

  document.querySelectorAll('.carousel-block').forEach(initCarousel);
})();
