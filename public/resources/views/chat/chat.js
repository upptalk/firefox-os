(function(global) {

  'use strict';

  if (global.MozActivity) {
    document.getElementById('media-photo').hidden = false;
    document.getElementById('media-video').hidden = false;
  }

  var sendText = function(t) {
    var id = Math.random().toString();

    var m;
    if (IEndpoints.isUser(IChat.endpoint)) {
      m = IMessages.new({id: id, text: t, user: IChat.endpoint.username, dir: 'out'});
      U.send('chat', {user: m.user, id: m.id, text: m.text});
    }
    else if (IEndpoints.isGroup(IChat.endpoint)) {
      m = IMessages.new({id: id, text: t, group: IChat.endpoint.id, dir: 'out'});
      U.send('chat', {group: m.group, id: m.id, text: m.text});
    }
    IEndpoints.onmessage(IChat.endpoint, m);
  };

  var conversationsEl = document.getElementById('conversations');
  window.addEventListener('resize', function() {
    //FIXME use a throttler https://developer.mozilla.org/en-US/docs/Web/Reference/Events/resize
    scrollToBottom();
  });
  var scrollToBottom = function() {
    //FIXME only scrollBottom if was scrollBottom was 0 before adding the new element
    //FIXME only if conversations is on screen
    // if (conversationsEl.scrollHeight - conversationsEl.offsetHeight >= conversationsEl.scrollTop)
    conversationsEl.scrollTop = conversationsEl.scrollHeight;
  };

  var sendPosition = function() {
    navigator.geolocation.getCurrentPosition(
      //success
      function(p) {
        var lat  = p.coords.latitude;
        var lng = p.coords.longitude;
        var thumbnail = 'https://maps.google.com/maps/api/staticmap?zoom=' + 10 + '&size=200x200&maptype=roadmap&markers=' + lat + ',' + lng +'&sensor=false';
        var url = 'https://maps.google.com/maps?q=loc:' + lat + ',' + lng;
        var id = Math.random().toString();
        var props = {
          id: id,
          location: {
            latitude: lat,
            longitude: lng,
            url: url,
            thumbnail: {
              url: thumbnail
            }
          },
          dir: 'out'
        };

        var m;
        if (IEndpoints.isUser(IChat.endpoint)) {
          props.user = IChat.endpoint.username;
          m = IMessages.new(props);
          U.send('chat', {user: m.user, id: m.id, location: m.location});
        }
        else if (IEndpoints.isGroup(IChat.endpoint)) {
          props.group = IChat.endpoint.id;
          m = IMessages.new(props);
          U.send('chat', {group: m.group, id: m.id, location: m.location});
        }
        IEndpoints.onmessage(IChat.endpoint, m);
      },
      //error
      function() {}
    );
  };

  var sendFile = function(m) {
    var file = {
      size: m.file.size,
      type: m.file.type,
      url: m.file.url
    };
    if (m.file.thumbnail) {
      file.thumbnail = {
        size: m.file.thumbnail.size,
        type: m.file.thumbnail.type,
        url: m.file.thumbnail.url
      };
    }

    if (IEndpoints.isUser(IChat.endpoint))
      U.send('chat', {user: m.user, id: m.id, file: file});
    else if (IEndpoints.isGroup(IChat.endpoint))
      U.send('chat', {group: m.group, id: m.id, file: file});

    IEndpoints.onmessage(IChat.endpoint, m);
  };

  var setEndpoint = function(e) {
    if (IChat.endpoint)
      IChat.endpoint.views.conversation.hidden = true;

    IChat.endpoint = e;
    e.views.conversation.hidden = false;
    // localforage.getItem('chats', function(chats) {
      // chats = chats || {};

      // chats[e] = {};
      // localforage.setItem('chats', chats);
    // });
    if (e.username)
      IContacts.updateStatus(e);
    ILayout.show('chat', e.name, e.avatar, e.status);
    scrollToBottom();
  };

  // var Message = function(p) {
  //   var el = document.createElement('div');
  //   el.textContent = p.text;
  //   el.classList.add('message');
  //   if (!p.from)
  //     el.classList.add('out');
  //   else
  //     el.classList.add('in');

  //   this.view = el;
  // };

  var chatEl = document.getElementById('chat');
  var formEl = chatEl.querySelector('form');

  formEl.addEventListener('compose', function(e) {
    if (IEndpoints.isGroup(IChat.endpoint) || !IUser.settings.cache['privacy-iswriting'])
      return;

    U.send('chatstate', {user: IChat.endpoint.username, type: e.detail === 'composing' ? 'composing' : 'paused'});
  });

  formEl.addEventListener('submit', function(e) {
    e.preventDefault();

    var input = e.target.elements['text'];
    sendText(input.value);
    formEl.reset();
    //on mobile, keyboard will be lost so we do
    input.focus();
  });

  var mediaLocation = document.getElementById('media-location');
  mediaLocation.addEventListener('click', function() {
    sendPosition();
  });

  var mediaVideo = document.getElementById('media-video');
  mediaVideo.addEventListener('click', function() {
    var activity = new MozActivity({
      name: "record",
      data: {
        type: 'videos'
      }
    });

    activity.onsuccess = function() {
      var file = {
        blob: this.result.blob,
        size: this.result.blob.size,
        type: this.result.type
      };
      sendMedia(file);
    };

    activity.onerror = function() {
    };
  });

  var mediaPhoto = document.getElementById('media-photo');
  mediaPhoto.addEventListener('click', function() {
    var activity = new MozActivity({
      name: "record",
      data: {
        type: 'photos'
      }
    });

    activity.onsuccess = function() {
      var file = {
        blob: this.result.blob,
        size: this.result.blob.size,
        type: this.result.type
      };
      sendMedia(file);
    };

    activity.onerror = function() {
    };
  });

  var sendMedia = function(file) {
    var id = Math.random().toString();
    file.progress = true;
    var m;

    if (IEndpoints.isUser(IChat.endpoint))
      m = IMessages.new({id: id, file: file, user: IChat.endpoint.username, dir: 'out'});
    else
      m = IMessages.new({id: id, file: file, group: IChat.endpoint.id, dir: 'out'});

    IMessages.upload(m);
    IEndpoints.onmessage(IChat.endpoint, m);
  };

  var mediaGallery = document.getElementById('media-gallery');
  mediaGallery.addEventListener('click', function() {
    if (window.MozActivity) {
      var activity = new MozActivity({
        name: 'pick',
        data: {
          type: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/3gpp']
        }
      });

      activity.onsuccess = function() {
        var file = {
          blob: this.result.blob,
          size: this.result.blob.size,
          type: this.result.type
        };
        sendMedia(file);
      };
      activity.onerror = function() {
      };
    }
    else {
      var input = document.createElement('input');
      input.type = 'file';
      input.click();
      input.addEventListener('change', function() {
        var file = {
          blob: this.files[0],
          size: this.files[0].size,
          type: this.files[0].type
        };
        sendMedia(file);
      });
    }
  });

  var mediaEl = document.getElementById('media');
  var mediaMenu = document.getElementById('media-menu');
  mediaEl.addEventListener('click', function() {
    mediaMenu.hidden = !mediaMenu.hidden;
  });

  window.IChat = {
    sendText: sendText,
    setEndpoint: setEndpoint,
    sendFile: sendFile,
    scrollToBottom: scrollToBottom
  };

})(this);
