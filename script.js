(function () {
    'use strict';

    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('nav-toggle');
    var navMenu = document.getElementById('nav-menu');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------------
       Navbar: solid background once the page is scrolled
       --------------------------------------------------------------- */
    function updateNavbar() {
        if (!navbar) return;
        navbar.classList.toggle('scrolled', window.scrollY > 8);
    }
    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    /* ---------------------------------------------------------------
       Mobile navigation drawer
       --------------------------------------------------------------- */
    function closeMenu() {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });

        window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
            if (e.matches) closeMenu();
        });
    }

    /* ---------------------------------------------------------------
       Highlight the nav link for the section currently in view
       --------------------------------------------------------------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a[href^="#"]'));
    var sections = navLinks
        .map(function (link) { return document.querySelector(link.getAttribute('href')); })
        .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
        var current = null;
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) current = entry.target.id;
            });
            navLinks.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + current);
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach(function (section) { sectionObserver.observe(section); });
    }

    /* ---------------------------------------------------------------
       Reveal-on-scroll animations
       --------------------------------------------------------------- */
    var revealEls = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
    }

    /* ---------------------------------------------------------------
       Play muted preview videos only while they are on screen
       --------------------------------------------------------------- */
    var videos = document.querySelectorAll('video[data-autoplay]');
    if (videos.length) {
        var playSafely = function (video) {
            var p = video.play();
            if (p && typeof p.catch === 'function') p.catch(function () {});
        };

        if ('IntersectionObserver' in window) {
            var videoObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        playSafely(entry.target);
                    } else {
                        entry.target.pause();
                    }
                });
            }, { threshold: 0.35 });

            videos.forEach(function (video) { videoObserver.observe(video); });
        } else {
            videos.forEach(playSafely);
        }
    }
})();
