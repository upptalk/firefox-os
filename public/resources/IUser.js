(function(global) {

  'use strict';

  var settings = {
    default: {
      'notification-sound': true,
      'notification-vibrate': true,
      'notification-visual': true,
      'privacy-readreceipt': true,
      'privacy-iswriting': true
    },
    cache: {},
    get: function(key, fn) {
      localforage.getItem('settings', function(sets) {

        //default settings
        if (!sets || Object.keys(sets).length === 0) {
          sets = Object.create(null);
          for (var i in settings.default)
            sets[i] = settings.default[i];
        }

        settings.cache = sets;

        if (typeof key === 'string')
          fn(sets[key]);
        else if (key)
          key(sets);
      });
    },
    set: function(key, value, fn) {
      localforage.getItem('settings', function(sets) {

        //default settings
        if (!sets || Object.keys(sets).length === 0) {
          sets = Object.create(null);
          for (var i in settings.default)
            sets[i] = settings.default[i];
        }

        sets[key] = value;
        settings.cache = sets;
        localforage.setItem('settings', sets, function() {
          if (fn)
            fn();
        });
      });
    }
  };

  var profile = {
    get: function() {
      U.send('profile', function(err, profile) {
        if (err)
          return;

        ISidebar.onProfile(profile);
        IAccount.onProfile(profile);
      });
    },
    set: function() {

    }
  };

  global.IUser = {
    settings: settings,
    profile: profile
  };

})(this);