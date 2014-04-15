(function() {

  'use strict';

  var register = document.getElementById('register');
  register.addEventListener('register', function(e) {
    e.preventDefault();

    //FIXME
    ILayout.show('contacts');
  });

})();