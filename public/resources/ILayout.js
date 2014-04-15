(function(global) {

  'use strict';

  var views = {
    welcome: {
      card: 0,
    },
    login: {
      card: 1,
      back: 'welcome',
    },
    register: {
      card: 2,
      back: 'welcome'
    },
    home: {
      card: 3,
      menu: true,
      newChat: true
    },
    contacts: {
      card: 4,
      menu: true,
      back: 'home',
      title: 'Contacts'
    },
    chat: {
      card: 5,
      back: 'home',
      title: ''
    },
    settings: {
      card: 6,
      back: 'home',
      menu: true,
      title: 'Settings'
    },
    account: {
      card: 7,
      back: 'home',
      menu: true,
      title: 'My account'
    },
    invite: {
      card: 8,
      menu: true,
      back: 'home',
      title: 'Invite'
    }
  };

  var back;
  var newChat;
  var menu;
  var title;
  var iconEl;
  var subtitleEl;
  var currentView;

  var deck = {
    el: null,
    selected: null,
    switch: function(s) {
      if (this.selected)
        this.selected.hidden = true;

      this.selected = this.el.children[s];
      this.selected.hidden = false;
    }
  };

  var show = function(view, t, icon, sub) {
    if (typeof view === 'string')
      view = views[view];

    if (currentView)
      delete currentView.active;

    deck.switch(view.card);
    if (t)
      title.textContent = t;
    else if (!('title' in view))
      title.textContent = 'UppTalk';
    else
      title.textContent = view.title;

    if (icon) {
      iconEl.firstChild.src = icon;
      iconEl.hidden = false;
    }
    else {
      iconEl.hidden = true;
    }

    if (typeof sub === 'string') {
      subtitleEl.parentNode.parentNode.classList.add('sub');
      subtitleEl.textContent = sub;
    }
    else {
      subtitleEl.parentNode.parentNode.classList.remove('sub');
      subtitleEl.textContent = '';
    }

    back.hidden = !!!view.back;
    menu.hidden = !!!view.menu;
    if (window.ISidebar)
      ISidebar.hide();
    newChat.hidden = !!!view.newChat;
    view.active = true;
    currentView = view;
  };

  global.ILayout = {
    show: show,
    views: views
  };

  document.addEventListener('DOMContentLoaded', function() {
    deck.el = document.getElementById('deck');
    back = document.getElementById('back');
    menu = document.getElementById('menu');
    newChat = document.getElementById('new-chat');
    title = document.getElementById('title');
    subtitleEl = document.getElementById('subtitle');
    iconEl = document.getElementById('title-icon');
    back.addEventListener('click', function() {
      show(currentView.back);
    });
    newChat.addEventListener('click', function() {
      show('contacts');
    });

    localforage.getItem('credentials', function(creds) {
      if (!creds)
        return show('welcome');

      show('home');

      var loga = function(creds) {
        IApp.login(creds, function(err) {
          if (!err)
            return;

          ILayout.show('login');
          alert('It seems your password has been changed, please relogin');
        });
      };


      if (U.readyState === 1)
        loga(creds);
      else {
        U.on('open', function() {
          loga(creds);
        });
      }

    });
  });
})(this);