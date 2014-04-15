(function() {

  'use strict';

  var Chatstate = function(el) {
    this.el = el;
    this.typing = false;
    this.intervalId = null;
    el.addEventListener('input', this.oninput.bind(this));
    el.addEventListener('submit', this.onsubmit.bind(this));
  };
  Chatstate.prototype.onsubmit = function() {
    if (this.typing)
      this.paused();
  };
  Chatstate.prototype.oninput = function(e) {
    if (this.typing && e.target.value === '')
      return this.paused();

    this.lastComposing = Date.now();

    if (!this.intervalId && !this.typing) {
      this.composing();
      this.intervalId = setInterval((function() {
        var delta = Date.now() - this.lastComposing;
        if (delta >= 2000 && this.typing)
          this.paused();
      }).bind(this), 2000);
    }

    if (!this.typing)
      return this.composing();
  };
  Chatstate.prototype.composing = function() {
    this.typing = true;
    var event = new CustomEvent('compose', {'detail': 'composing'});
    this.el.dispatchEvent(event);
  };
  Chatstate.prototype.paused = function() {
    this.typing = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
    var event = new CustomEvent('compose', {'detail': 'paused'});
    this.el.dispatchEvent(event);
  };

  var chatstate = function(form) {
    return new Chatstate(form);
  };

  chatstate(document.querySelector('#chat form'));


})();