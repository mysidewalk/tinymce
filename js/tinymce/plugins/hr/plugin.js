(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_en8bw7c8jiwc0nhg = { register: register };

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
  var $_7e6oukc9jiwc0nhh = { register: register$1 };

  global.add('hr', function (editor) {
    $_en8bw7c8jiwc0nhg.register(editor);
    $_7e6oukc9jiwc0nhh.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
