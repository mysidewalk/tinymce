(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_2xtktacmjm8lds1b = { register: register };

  var register$1 = function (editor) {
    editor.addButton('hr', {
      icon: 'hr',
      tooltip: 'Horizontal line',
      cmd: 'InsertHorizontalRule'
    });
    editor.addMenuItem('hr', {
      icon: 'hr',
      text: 'Horizontal line',
      cmd: 'InsertHorizontalRule',
      context: 'insert'
    });
  };
  var $_6vhqoacnjm8lds1c = { register: register$1 };

  global.add('hr', function (editor) {
    $_2xtktacmjm8lds1b.register(editor);
    $_6vhqoacnjm8lds1c.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
