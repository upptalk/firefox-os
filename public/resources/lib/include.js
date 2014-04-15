(function(global) {

  var go = function() {
    var includes = document.querySelectorAll('x-include');
    for (var i = 0; i < includes.length; i++) {
      include(includes[i]);
    }
  };

  var include = function(el) {
    imp(el.getAttribute('src'), function(err, frag) {
      if (err)
        return console.error(err);

      el.appendChild(frag);
    });
  };

  var imp = function(src, fn) {
    var req = new XMLHttpRequest();
    req.open('GET', src);
    req.onerror = function(err) {
      fn(err);
    };
    req.onload = function() {
      console.log(this.response);
      var dummy = document.createElement('dummy');
      dummy.innerHTML = this.response;

      var frag = document.createDocumentFragment();

      var base = src.substr(0, src.lastIndexOf('/') + 1);
      var file;
      var path;

      while (dummy.firstChild) {
        var child = dummy.firstChild;
        if (child.nodeName.toLowerCase() === 'script') {

          file = child.getAttribute('src');
          path = base + file;
          var script = document.createElement('script');
          script.src = path;
          document.head.appendChild(script);
          dummy.removeChild(dummy.firstChild);
        }
        else if (child.nodeName.toLowerCase() === 'link' && child.getAttribute('rel') === 'stylesheet') {
          file = child.getAttribute('href');
          path = base + file;
          var link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = path;
          document.head.appendChild(link);
          dummy.removeChild(dummy.firstChild);
        }
        else {
          frag.appendChild(child);
        }
      }

      fn(undefined, frag);
    };
    req.send();
  };


  if (document.readyState === 'complete')
    go();
  else {
    document.addEventListener('DOMContentLoaded', function() {
      go();
    });
  }

})(this);