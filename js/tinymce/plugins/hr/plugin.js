(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_7cy4kc8jiwlm6k5 = { register: register };

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
  var $_41m0axc9jiwlm6k6 = { register: register$1 };

  global.add('hr', function (editor) {
    $_7cy4kc8jiwlm6k5.register(editor);
    $_41m0axc9jiwlm6k6.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
