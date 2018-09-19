(function () {
var hr = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var register = function (editor) {
    editor.addCommand('InsertHorizontalRule', function () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    });
  };
  var $_28oibucmjm9dk7cx = { register: register };

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
  var $_cepcr3cnjm9dk7cy = { register: register$1 };

  global.add('hr', function (editor) {
    $_28oibucmjm9dk7cx.register(editor);
    $_cepcr3cnjm9dk7cy.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
