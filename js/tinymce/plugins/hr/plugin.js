(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_6st3a0cnjj8vl3os = { register: register };

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
  var $_9i23d3cojj8vl3ou = { register: register$1 };

  global.add('hr', function (editor) {
    $_6st3a0cnjj8vl3os.register(editor);
    $_9i23d3cojj8vl3ou.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
