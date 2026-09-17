// Forwards webview console warnings/errors and uncaught exceptions into the
// desktop activity log (<app data>/logs/<day>/frontend.jsonl) during boot —
// before the bundled logger in src/shared/logging has started (e.g. a module
// that throws while loading). Stops forwarding once that logger is ready.
// No-ops in a plain browser.
(function () {
  var internals = window.__TAURI_INTERNALS__;
  if (!internals || typeof internals.invoke !== 'function') return;

  function safeJson(v) {
    try {
      return JSON.stringify(v);
    } catch (_) {
      return '[unserializable]';
    }
  }

  function send(level, message) {
    // Once the bundled logger (src/shared/logging) is running it captures the
    // console and errors itself; this script only covers the boot window.
    if (window.__SIMPLEBASH_LOGGER_READY__) return;
    try {
      internals.invoke('log_webview', { level: level, message: String(message).slice(0, 4000) });
    } catch (_) {
      /* ignore */
    }
  }

  ['error', 'warn'].forEach(function (level) {
    var original = console[level].bind(console);
    console[level] = function () {
      try {
        send(
          level,
          Array.prototype.map
            .call(arguments, function (a) {
              return a instanceof Error
                ? a.stack || a.message
                : typeof a === 'object'
                  ? safeJson(a)
                  : a;
            })
            .join(' ')
        );
      } catch (_) {
        /* ignore */
      }
      return original.apply(console, arguments);
    };
  });

  window.addEventListener('error', function (e) {
    send('error', (e.message || 'error') + ' @ ' + (e.filename || '?') + ':' + (e.lineno || 0));
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    send(
      'error',
      'unhandledrejection: ' + (r && (r.stack || r.message) ? r.stack || r.message : safeJson(r))
    );
  });
})();
