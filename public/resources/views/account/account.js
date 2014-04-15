(function() {

  'use strict';

  var form = document.getElementById('form-profile');
  var avatarEl = document.getElementById('account-avatar');
  var nameEl = form.elements.name;
  var emailEl = form.elements.email;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
  });

  var onProfile = function(profile) {
    if (profile.nickname)
      nameEl.value = profile.nickname;
    if (profile.avatar)
      avatarEl.querySelector('img').src = profile.avatar;
    if (profile.email)
      emailEl.value = profile.email;
  };

  window.IAccount = {
    onProfile: onProfile
  };

})();