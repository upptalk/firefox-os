(function() {

  'use strict';

  var list = document.getElementById('contacts');
  var card = list.parentNode.parentNode;
  var form = document.getElementById('search-contact');
  // form.addEventListener('submit', function(e) {
  //   e.preventDefault();

  //   var 
  // });
  var button = card.querySelector('input[type="submit"]');

  var input = form.elements['username'];
  input.addEventListener('input', function() {
    if (this.value === '')
      return reset();

    filter(this.value);
  });

  var reset = function() {
    var contacts = IContacts.cache;
    for (var i in contacts) {
      if (!contacts[i].views)
        continue;

      contacts[i].views.contact.hidden = false;
    }
  };

  var filter = function(s) {
    //escape the string for regex
    s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    //matches toto twice in 'toto titi toto'
    var re = new RegExp('(^|\\s)' + s, 'i');

    var contacts = IContacts.cache;

    for (var i in contacts) {
      if (!contacts[i].views)
        continue;

      contacts[i].views.contact.hidden = !!!contacts[i].name.match(re);
    }
    // for (var i in Y.groupchats) {
    //   var groupchat = Y.groupchats[i];
    //   if (groupchat.view && groupchat.view.tab) {
    //     var tab = groupchat.view.tab;
    //     if (groupchat.name.match(re))
    //       tab.hidden = false;
    //     else
    //       tab.hidden = true;
    //   }
    // }
  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var username = this.elements.username.value.toLowerCase();

    if (IContacts.exists(username)) {
      var contact = IContacts.get(username);
      IEndpoints.chat(contact);
      e.target.reset();
      return;
    }

    button.classList.add('loading');
    button.disabled = true;

    U.send('sync', {username: username}, function(err, res) {
      button.classList.remove('loading');
      button.disabled = false;
      if (err)
        return alert('Sorry, something went wrong');

      if (!res.username[username])
        return alert('This user doesn\'t exit');

      var contact = IContacts.new(username, true);
      IEndpoints.chat(contact);
      e.target.reset();
    });


  });

  card.addEventListener('hide', function() {
    form.reset();
    reset();
  });

  card.addEventListener('show', function() {
    document.getElementById('contacts').scrollTop = 0;

    // if (navigator.moz)
    var allContacts = navigator.mozContacts.getAll({sortBy: "familyName", sortOrder: "descending"});

    var sync = {
      email: [],
      phone: []
    };

    allContacts.onsuccess = function(event) {
      alert('success');
      var cursor = event.target;
      var i;
      if (cursor.result) {
        var c = cursor.result;

        if (c.emails) {
          for (i = 0; i < c.emails.length; i++) {
            sync.email.push(c.emails[i].value);
          }
        }
        if (c.tel) {
          for (i = 0; i < c.tel.length; i++) {
            sync.phone.push(c.tel[i].value);
          }
        }

        cursor.continue();
      }
      else {
        var T = 0;
        for (i in sync) {
          console.log(i + ' platform contacts found: ' + sync[i].length);
          T += sync[i].length;
        }
        console.log('total platform contacts found: ' + T);
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
            console.log(i + ' platform contacts matched: ' + c);
          }
          console.log('total platform contacts matched: ' + t);
        });
      }
    };

    allContacts.onerror = function() {
      alert('error');
      console.log('error');
      // list.innerHTML = 'Could\'nt get contacts';
    };
  });

})();