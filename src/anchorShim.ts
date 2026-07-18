const SHIM_MARKER = '<!-- hyouji-anchor-shim -->';

export function injectAnchorShim(html: string): string {
  if (html.includes(SHIM_MARKER)) return html;

  const shimScript = `
<script>
(function () {
  'use strict';

  function rewriteFragmentHrefs(root) {
    var links = root.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href');
      if (!href || href.length <= 1) continue;
      var id = href.slice(1);
      if (/[\\x00-\\x1F\\x22\\x27\\x3C\\x3E]/.test(id)) continue;
      link.setAttribute('href', 'about:srcdoc#' + id);
    }
  }

  function isFragmentLink(element) {
    if (!element || element.tagName !== 'A' || !element.hasAttribute('href')) return false;
    var href = element.getAttribute('href');
    if (typeof href !== 'string' || href.length === 0) return false;
    return href.indexOf('#') > 0 || href[0] === '#';
  }

  function findTarget(id) {
    return document.getElementById(id) || document.querySelector('[name="' + id + '"]');
  }

  function scrollToId(id) {
    var target = findTarget(id);
    if (!target) return false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  function handleClick(event) {
    var anchor = event.target;
    while (anchor && anchor.tagName !== 'A') {
      anchor = anchor.parentElement;
    }
    if (!anchor || !isFragmentLink(anchor)) return;

    var href = anchor.getAttribute('href');
    var hashIndex = href.indexOf('#');
    var id = href.slice(hashIndex + 1);
    if (!id) return;

    event.preventDefault();
    event.stopPropagation();

    scrollToId(id);
    try {
      history.replaceState(null, '', href);
    } catch (e) {}
  }

  function handleHashChange() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      scrollToId(hash.slice(1));
    }
  }

  function init() {
    rewriteFragmentHrefs(document);
    document.body.addEventListener('click', handleClick, true);
    window.addEventListener('hashchange', handleHashChange, false);

    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType === Node.ELEMENT_NODE) {
            rewriteFragmentHrefs(node);
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>`;

  const marked = shimScript + SHIM_MARKER;
  const lower = html.toLowerCase();
  const headIndex = lower.indexOf('</head>');
  if (headIndex >= 0) {
    return html.slice(0, headIndex) + marked + html.slice(headIndex);
  }
  const bodyIndex = lower.indexOf('<body');
  if (bodyIndex >= 0) {
    const closeAngle = lower.indexOf('>', bodyIndex);
    if (closeAngle >= 0) {
      return html.slice(0, closeAngle + 1) + marked + html.slice(closeAngle + 1);
    }
  }
  return marked + html;
}

export function removeAnchorShim(html: string): string {
  return html.replace(new RegExp(`\\s?<script>.*?${SHIM_MARKER}.*?</script>`, 's'), '');
}
