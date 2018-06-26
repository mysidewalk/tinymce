(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_5gy1czc8jiwaaf7u = { register: register };

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
  var $_8ohqqc9jiwaaf7v = { register: register$1 };

  global.add('hr', function (editor) {
    $_5gy1czc8jiwaaf7u.register(editor);
    $_8ohqqc9jiwaaf7v.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
