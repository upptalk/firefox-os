(function() {

  'use strict';

  var settingsForm = document.getElementById('settings');
  settingsForm.addEventListener('change', function(e) {
    var key = e.target.name;
    var value = e.target.checked;

    IUser.settings.set(key, value);
  });

  IUser.settings.get(function(sets) {
    for (var i in sets) {
      var el = settingsForm.querySelector('input[name=' + i + ']');
      if (typeof sets[i] === 'boolean')
        el.checked = sets[i];
    }
  });

})();