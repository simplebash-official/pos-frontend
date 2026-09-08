// Forwards webview console warnings/errors and uncaught exceptions into the
// Tauri app log (~/Library/Logs/<id>/… on macOS, %LOCALAPPDATA% on Windows),
// so a problem that only shows up in the packaged desktop app is diagnosable
// without attaching a web inspector. No-ops in a plain browser.
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
