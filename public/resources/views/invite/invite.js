(function() {

  'use strict';

  var subject = 'Try UppTalk!';
  subject = encodeURIComponent(subject);
  var body = 'Try UppTalk!, you can download it at http://upptalk.com/download';
  body = encodeURIComponent(body);

  var inviteEmail = document.getElementById('invite-email');
  inviteEmail.href = 'mailto:?subject=' + subject + '&body=' + body;
  var inviteSMS = document.getElementById('invite-sms');
  inviteSMS.href = 'sms:?body=' + body;

})();