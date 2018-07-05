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
  var $_7cv8irhtjj8vl4pp = { insertNbsp: insertNbsp };

  var register = function (editor) {
    editor.addCommand('mceNonBreaking', function () {
      $_7cv8irhtjj8vl4pp.insertNbsp(editor, 1);
    });
  };
  var $_5vh441hsjj8vl4pn = { register: register };

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.VK');

  var getKeyboardSpaces = function (editor) {
    var spaces = editor.getParam('nonbreaking_force_tab', 0);
    if (typeof spaces === 'boolean') {
      return spaces === true ? 3 : 0;
    } else {
      return spaces;
    }
  };
  var $_7dik18hwjj8vl4pv = { getKeyboardSpaces: getKeyboardSpaces };

  var setup = function (editor) {
    var spaces = $_7dik18hwjj8vl4pv.getKeyboardSpaces(editor);
    if (spaces > 0) {
      editor.on('keydown', function (e) {
        if (e.keyCode === global$1.TAB && !e.isDefaultPrevented()) {
          if (e.shiftKey) {
            return;
          }
          e.preventDefault();
          e.stopImmediatePropagation();
          $_7cv8irhtjj8vl4pp.insertNbsp(editor, spaces);
        }
      });
    }
  };
  var $_2z0djshujj8vl4pr = { setup: setup };

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
  var $_600xe2hxjj8vl4px = { register: register$1 };

  global.add('nonbreaking', function (editor) {
    $_5vh441hsjj8vl4pn.register(editor);
    $_600xe2hxjj8vl4px.register(editor);
    $_2z0djshujj8vl4pr.setup(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
