(function() {

  'use strict';

  var login = document.getElementById('login-form');
  var button = login.querySelector('input[type=submit]');
  login.addEventListener('submit', function(e) {
    e.preventDefault();

    button.classList.add('loading');
    button.disabled = true;

    var username = this.elements['username'].value;
    var password = this.elements['password'].value;

    var creds = {
      username: username,
      password: password
    };

    IApp.login(creds, function(err) {
      button.classList.remove('loading');
      button.disabled = false;

      if (err)
        return alert('Login failed');

      localforage.setItem('credentials', creds);
      ILayout.show('home');
    });
  });

})();