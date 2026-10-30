// Home page: reel fallback + auto-moving carousels (Featured Projects and Projects)
(function () {
  // --- Reel ---
  // YouTube refuses embeds from pages opened as files (file://, "Error 153").
  // In that case show a thumbnail that opens the video on YouTube instead.
  var reel = document.getElementById('reel');
  var frame = reel && reel.querySelector('iframe');
  var fallback = null;
  var placeholder = null;
  var reelChoices = document.querySelectorAll('.reel-choice');
  var selectedGeneralist = true;
  var reelVisible = false;
  var player = null;
  var started = false;
  var pausedByUs = false;

  if (reel && frame && location.protocol === 'file:') {
    var id = 'zF50GhnikD0';
    frame.hidden = true;
    fallback = document.createElement('a');
    fallback.className = 'reel-fallback';
    fallback.href = 'https://www.youtube.com/watch?v=' + id;
    fallback.target = '_blank';
    fallback.rel = 'noopener';
    fallback.setAttribute('aria-label', 'Watch the reel on YouTube');
    fallback.innerHTML =
      '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="">' +
      '<span class="play" aria-hidden="true">&#9654;</span>' +
      '<span class="note">Local preview: opens on YouTube. The embedded player works once the site is online.</span>';
    reel.appendChild(fallback);
  }

  if (reel && frame) {
    placeholder = document.createElement('div');
    placeholder.className = 'reel-placeholder';
    placeholder.hidden = true;
    placeholder.setAttribute('role', 'status');
    placeholder.setAttribute('aria-live', 'polite');
    reel.appendChild(placeholder);

    reelChoices.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedGeneralist = button.dataset.reel === '3D Generalist';
        reelChoices.forEach(function (choice) {
          choice.setAttribute('aria-pressed', String(choice === button));
        });

        frame.hidden = !selectedGeneralist || location.protocol === 'file:';
        if (fallback) fallback.hidden = !selectedGeneralist;
        placeholder.hidden = selectedGeneralist;
        if (!selectedGeneralist) {
          placeholder.textContent = button.dataset.reel + ' reel coming soon.';
          if (player && started && player.getPlayerState() === 1) {
            player.pauseVideo();
            pausedByUs = true;
          }
        } else if (player && reelVisible) {
          if (!started) {
            started = true;
            player.mute();
            player.playVideo();
          } else if (pausedByUs) {
            pausedByUs = false;
            player.playVideo();
          }
        }
      });
    });
  }

  // Autoplay the reel (muted) the first time it is fully visible; pause when it leaves the screen
  if (frame && location.protocol !== 'file:') {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player(frame, {
        events: {
          onReady: function () {
            var io = new IntersectionObserver(function (entries) {
              var r = entries[0].intersectionRatio;
              reelVisible = r >= 0.7;
              if (r >= 0.7) {
                if (selectedGeneralist && !started) {
                  started = true;
                  player.mute();
                  player.playVideo();
                } else if (selectedGeneralist && pausedByUs) {
                  pausedByUs = false;
                  player.playVideo();
                }
              } else if (r < 0.2 && selectedGeneralist && started && player.getPlayerState() === 1) {
                player.pauseVideo(); pausedByUs = true;
              }
            }, { threshold: [0.2, 0.7] });
            io.observe(reel);
          }
        }
      });
    };
  }

  // --- Project cards (shared data from code/projects.js) ---
  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
    });
  }

  function projectCard(project, featured, pageIndex) {
    var title = escapeHTML(project.title);
    var meta = escapeHTML(project.meta);
    var summary = escapeHTML(project.summary || project.description || '');
    var description = escapeHTML(project.description || project.summary || '');
    var thumb = project.thumb
      ? '<div class="thumb"><img src="' + escapeHTML(project.thumb) + '" alt="' + title + '" loading="lazy"></div>'
      : '<div class="thumb" role="img" aria-label="' + title + '"></div>';
    var info = '<div class="info"><h3>' + title + '</h3><p class="meta">' + meta + '</p><p>' +
      (featured ? description : summary) + '</p>' +
      (featured ? '<span class="more">View project &rarr;</span>' : '') + '</div>';
    var href = String(project.href || '').trim();
    var className = pageIndex ? 'project' + (pageIndex === 1 ? ' featured' : '') : 'slide' + (featured ? ' feature' : '');
    var content = thumb + info;
    return href
      ? '<a class="' + className + '" href="' + escapeHTML(href) + '">' + content + '</a>'
      : '<div class="' + className + '">' + content + '</div>';
  }

  function renderProjects() {
    var projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
    var featuredTrack = document.getElementById('featured-projects');
    var allTrack = document.getElementById('all-projects');
    var projectsPage = document.getElementById('all-projects-page');

    if (featuredTrack) {
      featuredTrack.innerHTML = projects.filter(function (project) {
        return project.featured === true;
      }).map(function (project) {
        return projectCard(project, true, false);
      }).join('');
    }
    if (allTrack) {
      allTrack.innerHTML = projects.map(function (project) {
        return projectCard(project, false, false);
      }).join('');
    }
    if (projectsPage) {
      projectsPage.innerHTML = projects.map(function (project, index) {
        return projectCard(project, false, index + 1);
      }).join('');
    }
  }

  renderProjects();

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
