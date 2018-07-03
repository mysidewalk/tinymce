(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_g1vagjcnjj68z5h2 = { register: register };

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
  var $_3891i3cojj68z5h5 = { register: register$1 };

  global.add('hr', function (editor) {
    $_g1vagjcnjj68z5h2.register(editor);
    $_3891i3cojj68z5h5.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
