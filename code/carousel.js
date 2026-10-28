// Projects carousel: arrow buttons + native swipe/scroll
(function () {
  var track = document.getElementById('carousel');
  if (!track) return;
  var btns = document.querySelectorAll('.car-btn');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function update() {
    var max = track.scrollWidth - track.clientWidth - 2;
    btns.forEach(function (b) {
      var dir = Number(b.dataset.dir);
      b.disabled = dir < 0 ? track.scrollLeft <= 2 : track.scrollLeft >= max;
    });
  }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      track.scrollBy({ left: Number(b.dataset.dir) * track.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') track.scrollBy({ left: 300, behavior: 'auto' });
    if (e.key === 'ArrowLeft') track.scrollBy({ left: -300, behavior: 'auto' });
  });
  window.addEventListener('resize', update);
  update();
})();
