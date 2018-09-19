(function () {
var code = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var global$1 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var getMinWidth = function (editor) {
    return editor.getParam('code_dialog_width', 600);
  };
  var getMinHeight = function (editor) {
    return editor.getParam('code_dialog_height', Math.min(global$1.DOM.getViewPort().h - 200, 500));
  };
  var $_2085xza1jm8ldrmy = {
    getMinWidth: getMinWidth,
    getMinHeight: getMinHeight
  };

  var setContent = function (editor, html) {
    editor.focus();
    editor.undoManager.transact(function () {
      editor.setContent(html);
    });
    editor.selection.setCursorLocation();
    editor.nodeChanged();
  };
  var getContent = function (editor) {
    return editor.getContent({ source_view: true });
  };
  var $_fjyahra3jm8ldrn1 = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_2085xza1jm8ldrmy.getMinWidth(editor);
    var minHeight = $_2085xza1jm8ldrmy.getMinHeight(editor);
    var win = editor.windowManager.open({
      title: 'Source code',
      body: {
        type: 'textbox',
        name: 'code',
        multiline: true,
        minWidth: minWidth,
        minHeight: minHeight,
        spellcheck: false,
        style: 'direction: ltr; text-align: left'
      },
      onSubmit: function (e) {
        $_fjyahra3jm8ldrn1.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_fjyahra3jm8ldrn1.getContent(editor));
  };
  var $_4bxybda0jm8ldrmx = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_4bxybda0jm8ldrmx.open(editor);
    });
  };
  var $_es9t6c9zjm8ldrmv = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_4bxybda0jm8ldrmx.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_4bxybda0jm8ldrmx.open(editor);
      }
    });
  };
  var $_rcfnaa4jm8ldrn3 = { register: register$1 };

  global.add('code', function (editor) {
    $_es9t6c9zjm8ldrmv.register(editor);
    $_rcfnaa4jm8ldrn3.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
