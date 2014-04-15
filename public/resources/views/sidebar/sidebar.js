(function(global) {

  'use strict';

  var sidebarEl = document.getElementById('sidebar');
  var avatarEl = document.getElementById('sidebar-avatar');
  var nameEl = document.getElementById('profile-name');
  // var creditEl = document.getElementById('profile-credit');
  var menu = document.getElementById('menu');

  var conversationsItem = document.getElementById('sidebar-item-conversations');
  var contactsItem = document.getElementById('sidebar-item-contacts');
  var inviteItem = document.getElementById('sidebar-item-invite');
  var accountItem = document.getElementById('sidebar-item-account');
  // var creditItem = document.getElementById('sidebar-item-credit');
  // var ratesItem = document.getElementById('sidebar-item-rates');
  var settingsItem = document.getElementById('sidebar-item-settings');
  var logoutItem = document.getElementById('sidebar-item-logout');

  conversationsItem.addEventListener('click', function() {
    ILayout.show('home');
  });
  contactsItem.addEventListener('click', function() {
    ILayout.show('contacts');
  });
  inviteItem.addEventListener('click', function() {
    ILayout.show('invite');
    // alert('foo')
    // var invite = new global.MozActivity({
    //   name: 'new',
    //   date: {
    //     type: "websms/sms",
    //     number: "+46777888999"
    //   }
    //   // type: 'mail',
    //   // data: 'foo'
    //   // text: 'foo',
    //   // type: 'text/plain',
    //   // date: 'foo'
    // });
    // invite.onsuccess = function() {
    //   console.log('success');
    //   console.log(arguments);
    // };
    // invite.onerror = function() {
    //   console.log('error');
    //   console.log(arguments);
    // };
    // alert('foo');
  });
  accountItem.addEventListener('click', function() {
    ILayout.show('account');
  });
  // creditItem.addEventListener('click', function() {
  //   alert('bar');
  // });
  settingsItem.addEventListener('click', function() {
    ILayout.show('settings');
  });

  logoutItem.addEventListener('click', function() {
    IApp.logout();
  });

  menu.addEventListener('click', function() {
    toggle();
  });

  var show = function() {
    sidebarEl.classList.remove('hide');
  };

  var hide = function() {
    sidebarEl.classList.add('hide');
  };

  var toggle = function() {
    if (sidebarEl.classList.contains('hide'))
      show();
    else
      hide();
  };

  var onProfile = function(profile) {
    if (profile.avatar)
      avatarEl.children[0].src = profile.avatar;
    if (profile.nickname)
      nameEl.textContent = profile.nickname;
  };

  sidebarEl.addEventListener('transitionend', function() {
    if (sidebarEl.classList.contains('hide'))
      return;

    IUser.profile.get();
  });

  global.ISidebar = {hide: hide, show: show, onProfile: onProfile};

  IApp.init();

})(this);