(function() {

  'use strict';

  var defaultFields = {
    timestamp: Date.now(),
    id: '',
    state: 'sending',
    text: '',
    group: '',
    user: '',
    dir: 'in',
    location: null,
    file: null
  };

  var template = (function() {
    var el = document.createElement('div');
    el.classList.add('message');
    var m = document.createElement('a');
    m.target = '_blank';

    //content
    var content = document.createElement('div');
    content.classList.add('content');
    //time
    var time = document.createElement('time');

    el.appendChild(m);
    m.appendChild(content);
    m.appendChild(time);
    return el;
  })();

  var save = function() {
    var foo = {};
    for (var i in cache) {
      var e = cache[i];
      foo[i] = {};
      for (var j in e) {
        var m = e[j];
        foo[i][j] = {
          id: m.id,
          state: m.state,
          text: m.text,
          location: m.location,
          file: m.file,
          user: m.user,
          group: m.group,
          dir: m.dir,
          timestamp: m.timestamp
        };
      }
    }
    localforage.setItem('messages', foo);
  };
  var cache = {};
  var handle = function(obj) {
    var m = Object.create(null);
    for (var i in defaultFields) {
      m[i] = i in obj ? obj[i] : defaultFields[i];
    }

    var e = m.group || m.user;
    if (!cache[e])
      cache[e] = {};
    cache[e][m.id] = m;

    save();

    build(m);
    return m;
  };
  var ofEndpoint = function(e, fn) {
    if (typeof e === 'object')
      e = e.id;
    localforage.getItem('messages', function(messages) {
      if (!messages)
        return fn({});

      fn(messages[e] || {});
    });
  };
  var upload = function(m) {
    U.HTTPRequest({
      username: U.username,
      password: U.password,
      method: 'post',
      path: '/media',
      body: m.file.blob,
      host: 'happy.ym.ms',
      port: 443,
      secure: true,
      headers: {
        'Content-Type': m.file.type,
        'Content-Length': m.file.size
      }
    },
    //
    function(err, res) {
      if (err)
        return onUploadFail(m);

      var body = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
      if (!body)
        return onUploadFail(m);

      delete m.file.progress;

      if (!m.file.thumbnail)
        m.file.thumbnail = {};

      m.file.url = body.file.url;
      m.file.size = body.file.size;
      m.file.type = body.file.type;
      if (body.thumbnail) {
        m.file.thumbnail.url = body.thumbnail.url;
        m.file.thumbnail.size = body.thumbnail.size;
        m.file.thumbnail.type = body.thumbnail.type;
      }

      onUploaded(m);
    });
  };
  var onUploaded = function(m) {
    var el = m.view.firstChild;
    var ct = m.view.querySelector('.content');
    el.href = m.file.url;
    var progress = el.querySelector('progress');
    var thumbnail = document.createElement('img');
    thumbnail.src = m.file.thumbnail.url;
    ct.replaceChild(thumbnail, progress);

    IChat.sendFile(m);
  };
  var onUploadFail = function(m) {
    console.log(m);
  };
  var build = function(m) {
    var el = template.cloneNode(true);
    el = el.firstChild;

    var ct = el.querySelector('.content');
    var thumbnail;
    if (m.location) {
      thumbnail = document.createElement('img');
      thumbnail.src = m.location.thumbnail.url;
      ct.appendChild(thumbnail);
      el.href = m.location.url;
    }
    else if (m.file) {
      if (m.file.progress) {
        var progress = document.createElement('progress');
        progress.max = 100;
        ct.appendChild(progress);
      }
      else {
        thumbnail = document.createElement('img');
        thumbnail.src = m.file.thumbnail.url;
        ct.appendChild(thumbnail);
        el.href = m.file.url;
      }
    }
    else {
      ct.textContent = m.text;
    }

    if (m.dir === 'out') {
      //state
      var state = document.createElement('div');
      var img = document.createElement('img');
      img.src = '/resources/images/message-state-' + m.state + '.png';
      state.appendChild(img);
      state.classList.add('state');
      el.appendChild(state);
    }

    var p = el.parentNode;
    p.classList.add(m.dir);
    m.view = p;
    return m.view;
  };
  var receipt = function(m, type) {
    var p = {
      id: m.id,
      type: type,
      user: m.user
    };
    if (m.group)
      p.group = m.group;

    U.send('receipt', p);
  };

  var states = {
    'error': 0,
    'sent': 1,
    'received': 2,
    'read': 3
  };

  var state = function(m, state) {
    //make sure a message can't downgrad its state
    if (m.state && states[m.state] > state)
      return;

    m.state = state;
    save();
    if (!m.view)
      return;

    m.view.querySelector('.state img').src = '/resources/images/message-state-' + m.state + '.png';
  };
  var exists = function(e, id) {
    if (typeof e === 'object')
      e = e.id;

    if (!cache[e])
      return false;

    return (id in cache[e]);
  };
  var get = function(e, id) {
    if (typeof e === 'object')
      e = e.id;
    return cache[e][id] || {};
  };

  document.addEventListener('DOMContentLoaded', function() {
    localforage.getItem('messages', function(messages) {
      if (!messages)
        return;

      for (var i in messages) {
        handle(messages[i]);
      }
    });
  });


  window.IMessages = {
    new: handle,
    cache: cache,
    build: build,
    receipt: receipt,
    state: state,
    exists: exists,
    get: get,
    ofEndpoint: ofEndpoint,
    upload: upload
  };

})();