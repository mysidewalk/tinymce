(function () {
var nonbreaking = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var stringRepeat = function (string, repeats) {
    var str = '';
    for (var index = 0; index < repeats; index++) {
      str += string;
    }
    return str;
  };
  var isVisualCharsEnabled = function (editor) {
    return editor.plugins.visualchars ? editor.plugins.visualchars.isEnabled() : false;
  };
  var insertNbsp = function (editor, times) {
    var nbsp = isVisualCharsEnabled(editor) ? '<span class="mce-nbsp">&nbsp;</span>' : '&nbsp;';
    editor.insertContent(stringRepeat(nbsp, times));
    editor.dom.setAttrib(editor.dom.select('span.mce-nbsp'), 'data-mce-bogus', '1');
  };
  var $_cgz4qhhsjm8ldswp = { insertNbsp: insertNbsp };

  var register = function (editor) {
    editor.addCommand('mceNonBreaking', function () {
      $_cgz4qhhsjm8ldswp.insertNbsp(editor, 1);
    });
  };
  var $_4c8jl3hrjm8ldswn = { register: register };

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.VK');

  var getKeyboardSpaces = function (editor) {
    var spaces = editor.getParam('nonbreaking_force_tab', 0);
    if (typeof spaces === 'boolean') {
      return spaces === true ? 3 : 0;
    } else {
      return spaces;
    }
  };
  var $_8lxx99hvjm8ldsws = { getKeyboardSpaces: getKeyboardSpaces };

  var setup = function (editor) {
    var spaces = $_8lxx99hvjm8ldsws.getKeyboardSpaces(editor);
    if (spaces > 0) {
      editor.on('keydown', function (e) {
        if (e.keyCode === global$1.TAB && !e.isDefaultPrevented()) {
          if (e.shiftKey) {
            return;
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          $_cgz4qhhsjm8ldswp.insertNbsp(editor, spaces);
        }
      });
    }
  };
  var $_g0wq6jhtjm8ldswq = { setup: setup };

  var register$1 = function (editor) {
    editor.addButton('nonbreaking', {
      title: 'Nonbreaking space',
      cmd: 'mceNonBreaking'
    });
    editor.addMenuItem('nonbreaking', {
      icon: 'nonbreaking',
      text: 'Nonbreaking space',
      cmd: 'mceNonBreaking',
      context: 'insert'
    });
  };
  var $_5f9jiuhwjm8ldswt = { register: register$1 };

  global.add('nonbreaking', function (editor) {
    $_4c8jl3hrjm8ldswn.register(editor);
    $_5f9jiuhwjm8ldswt.register(editor);
    $_g0wq6jhtjm8ldswq.setup(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
