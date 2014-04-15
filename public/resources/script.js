(function(global) {

  'use strict';

  var client = new global.UppTalk({host: 'upptalk.sonny.io', port: 9595, secure: false, apikey: 'foobar'});
  client.on('open', function() {
    console.log('OPEN');
  });
  client.on('close', function() {
    console.log('CLOSE');
    IContacts.reset();
  });
  client.on('error', function(err) {
    console.log('ERROR', err);
  });
  client.on('message', function(m) {
    if (pings.indexOf(m.id) > 0)
      return;
    console.log('IN', m);
  });
  var pings = [];
  client.on('send', function(m) {
    if (m.method === 'ping') {
      pings.push(m.id);
      return;
    }
    console.log('OUT', m);
  });
  client.on('chat', function(m) {
    m.dir = 'in';
    var e;

    if (m.group)
      e = IGroups.get(m.group, true);
    else if (m.user)
      e = IContacts.get(m.user, true);

    m = IMessages.new(m);
    IEndpoints.onmessage(e, m);
  });
  client.on('presence', function(p) {
    var c = IContacts.get(p.user);
    if (!c)
      return;

    c.online = p.type !== 'offline' ? true : false;
    if (p.type === 'offline')
      c.last = null;

    IContacts.updateStatus(c);
  });
  client.on('chatstate', function(p) {
    var c = IContacts.get(p.user);
    if (!c)
      return;

    c.writing = p.type !== 'paused' ? true : false;
    IContacts.updateStatus(c);
  });
  client.on('receipt', function(r) {
    var e = r.group || r.user;

    if (!IMessages.exists(e, r.id))
      return;

    var m = IMessages.get(e, r.id);
    IMessages.state(m, r.type);
  });
  client.open();
  global.U = client;

  if (navigator.mozSetMessageHandler) {
    navigator.mozSetMessageHandler('activity', function(activityRequest) {
      var option = activityRequest.source;
      // console.log(activityRequest);
      console.log(option);

      if (option.name === 'share') {
        ILayout.show('contacts', 'Share with');
        if (option.data.type === 'url') {
          IContacts.onPick = function() {
            IChat.sendText(option.data.url);
            activityRequest.postResult();
            IContacts.onPick = function() {};
          };
        }
        else {
          activityRequest.postError('Sorry we can\'t share this');
        }
      }
      // if (option.name === "pick") {
      //   // Do something to handle the activity
      //   ...

      //   // Send back the result
      //   if (picture) {
      //     activityRequest.postResult(picture);
      //   } else {
      //     activityRequest.postError("Unable to provide a picture");
      //   }
      // }
    });
  }

  // var request = window.navigator.mozApps.getSelf();
  // request.onsuccess = function() {
  //   if (request.result) {
  //     // Pull the name of the app out of the App object
  //     alert("Name of current app: " + request.result.manifest.name);
  //   } else {
  //     alert("Called from outside of an app");
  //   }
  // };
  // request.onerror = function() {
  //   // Display error name from the DOMError object
  //   alert("Error: " + request.error.name);
  // };

})(this);