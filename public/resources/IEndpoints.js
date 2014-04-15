(function(global) {

  'use strict';

  var isUser = function(e) {
    return !!e.username;
  };
  var isGroup = function(e) {
    return !e.username;
  };
  var onmessage = function(e, m) {
    e.views.conversation.appendChild(m.view);
    IChat.scrollToBottom();

    setActive(e);

    if (!isVisible(e))
      setUnread(e);

    if (m.dir === 'out')
      return;

    IApp.onmessage(e, m);

    //FIXME when user click a contact, send receipts for pending messages
    if (isUser(e) && isVisible(e) && IUser.settings.cache['privacy-readreceipt'])
      IMessages.receipt(m, 'read');
    else
      IMessages.receipt(m, 'received');
  };
  var setUnread = function(e) {
    e.views.chat.classList.add('unread');
    e.unread = true;
    if (isUser)
      IContacts.save();
    else
      IGroups.save();
  };
  var setRead = function(e) {
    e.views.chat.classList.remove('unread');
    e.unread = false;
    if (isUser)
      IContacts.save();
    else
      IGroups.save();
  };
  var setActive = function(e) {
    if (isUser(e)) {
      IContacts.buildChatView(e);
      e.active = true;
      IContacts.save(e);
    }

    var chatsEl = document.getElementById('chats');
    if (chatsEl.firstChild)
      chatsEl.insertBefore(e.views.chat, chatsEl.firstChild);
    else
      chatsEl.appendChild(e.views.chat);
  };
  var isVisible = function(e) {
    return !!(IApp.visible && ILayout.views.chat.active && IChat.endpoint === e);
  };
  var chat = function(e) {
    IChat.setEndpoint(e);
    if (isUser(e))
      IContacts.onchat(e);

    setRead(e);
  };

  global.IEndpoints = {
    isUser: isUser,
    isGroup: isGroup,
    onmessage: onmessage,
    isVisible: isVisible,
    chat: chat,
    setActive: setActive,
    setUnread: setUnread,
    setRead: setRead
  };

})(this);