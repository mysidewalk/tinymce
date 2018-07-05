(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_ce42zicnjj8uww21 = { register: register };

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
  var $_4kdmc1cojj8uww22 = { register: register$1 };

  global.add('hr', function (editor) {
    $_ce42zicnjj8uww21.register(editor);
    $_4kdmc1cojj8uww22.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
