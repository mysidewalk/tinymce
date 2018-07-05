(function () {
var print = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('mcePrint', function () {
      editor.getWin().print();
    });
  };
  var $_6wzxgojljj8vl519 = { register: register };

  var register$1 = function (editor) {
    editor.addButton('print', {
      title: 'Print',
      cmd: 'mcePrint'
    });
    editor.addMenuItem('print', {
      text: 'Print',
      cmd: 'mcePrint',
      icon: 'print'
    });
  };
  var $_fmpc55jmjj8vl51b = { register: register$1 };

  global.add('print', function (editor) {
    $_6wzxgojljj8vl519.register(editor);
    $_fmpc55jmjj8vl51b.register(editor);
    editor.addShortcut('Meta+P', '', 'mcePrint');
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
