(function() {

  'use strict';

  var loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', function() {
    ILayout.show('login');
  });
  var registerButton = document.getElementById('register-button');
  registerButton.addEventListener('click', function() {
    ILayout.show('register');
  });
  var installButton = document.getElementById('install-button');
  installButton.addEventListener('click', function() {
    IApp.install();
  });

  IApp.init();

})();