(function() {

  'use strict';

  var defaultFields = {
    name: '',
    avatar: '/resources/images/avatar-contact.png',
    username: '',
    id: '',
    status: '',
    online: false,
    writing: false,
    last: null,
    active: false,
    unread: false
  };

  var templates = {};
  (function() {
    var el = document.createElement('li');
    el.classList.add('contact');
    var avatar = document.createElement('div');
    avatar.classList.add('avatar');
    var img = document.createElement('img');
    img.src = defaultFields.avatar;
    avatar.appendChild(img);
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
      IEndpoints.chat(obj);
    });
  };

  var IContacts = {
    reset: function() {
      for (var i in IContacts.cache) {
        IContacts[i].online = false;
        IContacts[i].writing = false;
        IContacts[i].last = null;
        IContacts[i].updateStatus();
      }
    },
    cache: {},
    save: function() {
      var foo = {};
      for (var i in IContacts.cache) {
        var c = IContacts.cache[i];
        foo[i] = {
          name: c.name,
          avatar: c.avatar,
          username: c.username,
          id: c.id,
          unread: c.unread,
          active: c.active ? true : false
        };
      }
      localforage.setItem('contacts', foo);
    },
    updateStatus: function(c) {
      if (c.writing)
        c.status = 'is writing';
      else if (c.online)
        c.status = 'online';
      else if (c.last) {
        c.status = 'last seen ' + moment(Date.now() - c.last).fromNow();
      }
      else {
        c.status = '';
        U.send('last-activity', c.username, function(err, last) {
          if (err)
            return;

          c.last = last;

          IContacts.updateStatus(c);
        });
      }
      if (ILayout.views.chat.active && IChat.endpoint === c)
        document.getElementById('subtitle').textContent = c.status;
    },
    new: function(p, draw) {
      if (typeof p === 'string')
        p = {username: p, id: p};

      var obj = Object.create(null);
      for (var i in defaultFields) {
        obj[i] = i in p ? p[i] : defaultFields[i];
      }

      if (obj.username)
        obj.id = obj.username;
      else if (obj.id)
        obj.username = obj.id;
      else
        throw 'Username or id required';

      if (!obj.name)
        obj.name = obj.username;

      IContacts.cache[obj.id] = obj;

      IContacts.save();

      if (draw)
        IContacts.draw(obj);

      if (obj.active)
        IEndpoints.setActive(obj);

      if (obj.unread)
        IEndpoints.setUnread(obj);

      if (U.readyState === 1)
        IContacts.getProfile(obj);

      return obj;
    },
    buildChatView: function(obj) {
      if (obj.views.chat)
        return;

      obj.views.chat = templates.item.cloneNode(true);
      itemPointerHandle(obj.views.chat, obj);
      IContacts.update(obj);
    },
    onchat: function(obj) {
      IEndpoints.setActive(obj);
    },
    build: function(obj) {
      obj.views = {};
      obj.views.contact = templates.item.cloneNode(true);
      itemPointerHandle(obj.views.contact, obj);
      obj.views.conversation = templates.conversation.cloneNode(true);

      IMessages.ofEndpoint(obj.id, function(ms) {
        var fragMessages = document.createDocumentFragment();
        for (var i in ms) {
          var m = IMessages.new(ms[i]);
          fragMessages.appendChild(m.view);
        }
        obj.views.conversation.appendChild(fragMessages);
        IChat.scrollToBottom();
      });
      IContacts.update(obj);
      return obj.views;
    },
    draw: function(obj) {
      if (!obj.views)
        IContacts.build(obj);
      document.getElementById('conversations').appendChild(obj.views.conversation);
      document.getElementById('contacts').appendChild(obj.views.contact);
    },
    getProfile: function(c) {
      U.send('profile', c.username, function(err, profile) {
        if (err)
          return;

        if (profile.nickname)
          c.name = profile.nickname;
        if (profile.avatar)
          c.avatar = profile.avatar;
        IContacts.update(c);
        IContacts.save();
      });
    },
    update: function(obj) {
      if (obj.views.contact) {
        obj.views.contact.firstChild.firstChild.src = obj.avatar;
        obj.views.contact.children[1].textContent = obj.name;
      }
      if (obj.views.chat) {
        obj.views.chat.firstChild.firstChild.src = obj.avatar;
        obj.views.chat.children[1].textContent = obj.name;
      }
      if (IEndpoints.isVisible(obj)) {
        document.getElementById('title').textContent = obj.name;
        document.getElementById('title-icon').firstChild.src = obj.avatar;
      }
    },
    //get and/or create contact
    get: function(c, create) {
      if (typeof c === 'string')
        c = {id: c};

      if (IContacts.cache[c.id])
        return IContacts.cache[c.id];
      else if (create) {
        var contact = IContacts.new(c, true);
        return contact;
      }
    },
    //exist
    exists: function(id) {
      return id in IContacts.cache;
    },
    init: function() {
      localforage.getItem('contacts', function(contacts) {
        if (!contacts)
          return;

        for (var i in contacts) {
          IContacts.get(contacts[i], true);
        }
      });
    }
  };

  window.IContacts = IContacts;

})();