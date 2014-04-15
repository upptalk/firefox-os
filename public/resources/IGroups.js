(function() {

  'use strict';

  var defaultFields = {
    name: '',
    id: '',
    unread: false
  };

  var templates = {};
  (function() {
    var el = document.createElement('li');
    el.classList.add('contact');
    var avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = '/resources/images/avatar-group.png';
    el.appendChild(avatar);
    var name = document.createElement('span');
    name.classList.add('name');
    name.textContent = '';
    el.appendChild(name);
    templates.item = el;
  })();
  (function() {
    var el = document.createElement('div');
    el.hidden = true;
    el.classList.add('conversation');
    templates.conversation = el;
  })();

  var itemPointerHandle = function(el, obj) {
    el.addEventListener('click', function() {
      IGroups.chat(obj);
    });
  };

  var cache = {};

  var save = function() {
    var foo = {};
    for (var i in cache) {
      var g = cache[i];
      foo[i] = {
        name: g.name,
        id: g.id,
        unread: g.unread
      };
    }
    localforage.setItem('groups', foo);
  };
  var createGroup = function(o, d) {
    if (typeof o === 'string')
      o = {id: o};

    var g = Object.create(null);
    for (var i in defaultFields) {
      g[i] = i in o ? o[i] : defaultFields[i];
    }
    g.name = g.name || g.id;

    cache[g.id] = g;

    if (d)
      draw(g);

    save();

    if (g.unread)
      IEndpoints.setUnread(g);

    return g;
  };
  var update = function(g) {
    if (g.views.chat)
      g.views.chat.children[1].textContent = g.name;
    if (ILayout.views['chat'].active && IChat.endpoint === g)
      document.getElementById('title').textContent = g.name;
  };
  var build = function(g) {
    g.views = {};
    g.views.chat = templates.item.cloneNode(true);
    itemPointerHandle(g.views.chat, g);
    g.views.conversation = templates.conversation.cloneNode(true);

    IMessages.ofEndpoint(g.id, function(ms) {
      var fragMessages = document.createDocumentFragment();
      for (var i in ms) {
        var m = IMessages.new(ms[i]);
        fragMessages.appendChild(m.view);
      }
      g.views.conversation.appendChild(fragMessages);
      IChat.scrollToBottom();
    });

    update(g);
    return g.views;
  };
  var exists =  function(id) {
    return id in IContacts.cache;
  };
  var draw = function(g) {
    if (!g.views)
      build(g);
    document.getElementById('conversations').appendChild(g.views.conversation);
    document.getElementById('chats').appendChild(g.views.chat);
  };
  var chat = function(g) {
    IChat.setEndpoint(g);
  };
  var get = function(g, create) {
    //convert to array
    if (typeof g === 'string')
      g = [{id: g}];
    else if (!Array.isArray(g))
      g = [g];

    var r = {};

    for (var i = 0; i < g.length; i++) {
      //check if exists
      var group = cache[g[i].id];
      //if group exists, update with new information and save
      if (group) {
        for (var j in g[i]) {
          group[j] = g[i][j];
        }
        update(group);
        save();
      }
      //otherwise create it
      else if (!group && create)
        group = createGroup(g[i], true);

      if (g.length === 1)
        return group;
      else
        r[group.id] = group;
    }
    return r;
  };
  var handle = function(obj, d) {
    if (Array.isArray(obj))
      for (var i = 0; i < obj.length; i++)
        createGroup(obj[i], d);
  };

  var init = function() {
    localforage.getItem('groups', function(groups) {
      if (!groups)
        return;

      for (var i in groups) {
        IGroups.get(groups[i], true);
      }
    });
  };

  window.IGroups = {
    handle: handle,
    chat: chat,
    exists: exists,
    update: update,
    get: get,
    cache: cache,
    init: init
  };

})();