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
  var $_fm4txea1jm9dk6ua = {
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
  var $_2fco3ka3jm9dk6uc = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_fm4txea1jm9dk6ua.getMinWidth(editor);
    var minHeight = $_fm4txea1jm9dk6ua.getMinHeight(editor);
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
        $_2fco3ka3jm9dk6uc.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_2fco3ka3jm9dk6uc.getContent(editor));
  };
  var $_7j4n18a0jm9dk6u9 = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_7j4n18a0jm9dk6u9.open(editor);
    });
  };
  var $_brfyyk9zjm9dk6u8 = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_7j4n18a0jm9dk6u9.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_7j4n18a0jm9dk6u9.open(editor);
      }
    });
  };
  var $_55bx5ia4jm9dk6ud = { register: register$1 };

  global.add('code', function (editor) {
    $_brfyyk9zjm9dk6u8.register(editor);
    $_55bx5ia4jm9dk6ud.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
