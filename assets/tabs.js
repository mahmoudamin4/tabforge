/* Turns the tab strip into an accessible tab switcher. Without JS, every pane stays visible and tabs work as anchors. */
(function () {
  'use strict';
  var strip = document.querySelector('[data-tabs]');
  if (!strip) return;
  document.documentElement.classList.add('js');

  var tabs = Array.prototype.slice.call(strip.querySelectorAll('.tab'));
  var rtl = document.documentElement.dir === 'rtl';

  strip.setAttribute('role', 'tablist');
  tabs.forEach(function (tab) {
    var pane = document.getElementById(tab.getAttribute('href').slice(1));
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', pane.id);
    tab.id = 'tab-' + pane.id;
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', tab.id);
    pane.setAttribute('tabindex', '0');
  });

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    // Center the active tab inside the strip only; never scroll the page. Works for LTR and RTL.
    var s = strip.getBoundingClientRect();
    var t = tab.getBoundingClientRect();
    strip.scrollLeft += (t.left + t.width / 2) - (s.left + s.width / 2);
    if (focus) tab.focus({ preventScroll: true });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function (e) {
      e.preventDefault();
      select(tab, false);
      if (history.replaceState) history.replaceState(null, '', tab.getAttribute('href'));
    });
    tab.addEventListener('keydown', function (e) {
      var next = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
      var target = null;
      if (next) target = tabs[(i + next + tabs.length) % tabs.length];
      if (e.key === 'Home') target = tabs[0];
      if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) { e.preventDefault(); select(target, true); }
    });
  });

  var fromHash = tabs.filter(function (t) { return t.getAttribute('href') === location.hash; })[0];
  select(fromHash || tabs[0], false);
})();
