(function() {

  'use strict';

  //no chats
  var noChats = document.getElementById('no-chats');

  //chats
  var yesChats = document.getElementById('chats');
  var card = document.getElementById('home').parentNode.parentNode;

  card.addEventListener('show', function() {
    yesChats.scrollTop = 0;
  });

  // var doIt = function() {
    // localforage.getItem('chats', function(chats) {
    //   if (!chats) {
    //     noChats.hidden = false;
    //     yesChats.hidden = true;
    //     return;
    //   }

    //   var frag = document.createDocumentFragment();
    //   for (var i in chats) {
    //     var contact = new Contact({name: i, username: i});
    //     frag.appendChild(contact.buildView());

    //     // el.addEventListener('click', function() {
    //     //   chat.setEndpoint(i);
    //     // });
    //   }
    //   yesChats.innerHTML = '';
    //   yesChats.appendChild(frag);

    //   noChats.hidden = true;
    //   yesChats.hidden = false;
    // });
  // }

  // var deck = document.getElementById('deck');


  // if (deck.selectedCard === card)
  //   doIt();
  // card.addEventListener('show', function(e) {
  //   doIt();
  // });

  var update = function() {
    if (yesChats.children.length > 0) {
      yesChats.hidden = false;
      noChats.hidden = true;
    }
    else {
      yesChats.hidden = true;
      noChats.hidden = false;
    }
  };

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function() {
      update();
    });
  });
  var config = { attributes: false, childList: true, characterData: false};
  observer.observe(yesChats, config);

  update();

  IGroups.init();
  IContacts.init();

})();