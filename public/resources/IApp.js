(function(global) {

  'use strict';

  var hidden, visibilityChange;
  if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.mozHidden !== 'undefined') {
    hidden = 'mozHidden';
    visibilityChange = 'mozvisibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }

  document.addEventListener(visibilityChange, function() {
    IApp.visible = !document[hidden];
  });

  var onmessage = function(e, m) {
    console.log(IEndpoints.isVisible(e));
    if (IEndpoints.isVisible(e))
      return;

    notify({
      vibrate: true,
      sound: true,
      desktop: (IApp.visible || (!ILayout.views.chat.active || IChat.endpoint !== e)),
      body: m.text,
      title: 'New message from ' + e.name
    });
  };

  var notif;
  //FIXME close notifications when user show contact view
  //when there are 2 new messages for a contact, close the first one and create a new notification
  //2 new messages
  if ('Notification' in window) {
    notif = function(opts) {
      new window.Notification(opts.title, {
        dir: 'auto',
        lang: '',
        body: opts.body,
        tag: opts.tag,
        icon: opts.icon || 'app://upptalk/resources/images/icons/60.png'
      });
    };
  }
  else if (navigator.mozNotification) {
    notif = function(opts) {
      navigator.mozNotification.createNotification(
        opts.title,
        opts.body,
        opts.icon || 'app://upptalk/resources/images/icons/60.png'
      ).show();
    };
  }

  var notify = function(opts) {
    if (opts.vibrate && navigator.vibrate && IUser.settings.cache['notification-vibrate'] === true)
      navigator.vibrate(200);
    if (opts.desktop && IUser.settings.cache['notification-visual'] === true)
      notif(opts);
    //desktop notifications will play a sound
    else if (opts.sound && IUser.settings.cache['notification-sound'] === true)
      document.querySelector('audio').play();
  };

  var logout = function() {
    localforage.clear();
    localStorage.clear();
    document.location.reload();
  };

  var login = function(creds, fn) {
    U.send('authenticate', creds, function(err) {
      if (err)
        return fn(err);

      U.username = creds.username;
      U.password = creds.password;
      U.send('presence');
      U.send('groups', function(err, groups) {
        if (err)
          return console.log('where are groups');

        IGroups.get(groups, true);
      });

      fn();

      //FIXME, we have to make sure those contacts are upptalk

      var sync = {
        email: [],
        phone: [],
        username: []
      };

      IUser.profile.get();

      U.send('contacts', function(err, contacts) {
        var c = 0;
        for (var i in contacts) {
          c++;
          for (var j = 0; j < contacts[i].ids.length; j++) {
            var id = contacts[i].ids[j];
            if (!id.value || typeof id.value !== 'string')
              continue;

            if (id.type === 'username')
              sync.username.push(id.value);
            else if (id.type === 'phone')
              sync.phone.push(id.value);
            else if (id.type === 'email')
              sync.username.push(id.value);

          }
        }
        console.log(c + ' cloud contacts found');
        console.log('cloud email ids found: ' + sync.email.length);
        console.log('cloud phone ids found: ' + sync.phone.length);
        console.log('cloud username ids found: ' + sync.username.length);
        console.log('total cloud ids found: ' + (sync.email.length + sync.phone.length + sync.username.length));

        U.send('sync', sync, function(err, synced) {
          if (err)
            return;

          var t = 0;

          for (var i in synced) {
            var c = 0;
            for (var u in synced[i]) {
              if (typeof synced[i][u] === 'string') {
                c++;
                IContacts.get(synced[i][u], true);
              }
            }
            t+= c;
            console.log(i + ' cloud ids matched: ' + c);
          }
          console.log('total cloud ids matched: ' + t);
        });
      });
    });
  };

  var install = function() {
    var base = window.location.protocol + '//' + window.location.host;
    var request;
    //FIXME dirty hack to detect Firefox OS
    if (window.mozActivity === 'undefined')
      request = window.navigator.mozApps.install(base + '/manifest.webapp');
    else
      request = window.navigator.mozApps.installPackage(base + '/package.manifest');

    request.onsuccess = function () {
      console.log(this.result);
      alert('Installation successful!');
    };
    request.onerror = function () {
      if (this.error.name === 'MULTIPLE_APPS_PER_ORIGIN_FORBIDDEN')
        return alert('It seems UppTalk is already installed on this device');

      alert('Install failed, error: ' + this.error.name);
    };
  };

  var init = function() {
    if (navigator.mozApps) {
      var request = window.navigator.mozApps.getSelf();
      request.onsuccess = function() {
        if (this.result) {
          console.log('is an app');
          this.result.checkUpdate();
          console.log(this.result);
        }
        else {
          console.log('not an app');
          document.getElementById('install-button').hidden = false;
        }
      };
      request.onerror = function() {
        alert('Error: ' + request.error.name);
      };
    }
  };

  global.IApp = {
    notify: notify,
    onmessage: onmessage,
    visible: !document[hidden],
    login: login,
    logout: logout,
    install: install,
    init: init
  };


})(this);