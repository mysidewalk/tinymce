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
  var $_7sp0dfa2jj91awu0 = {
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
  var $_3bh4kwa4jj91awu4 = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_7sp0dfa2jj91awu0.getMinWidth(editor);
    var minHeight = $_7sp0dfa2jj91awu0.getMinHeight(editor);
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
        $_3bh4kwa4jj91awu4.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_3bh4kwa4jj91awu4.getContent(editor));
  };
  var $_7ny1sca1jj91awtx = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_7ny1sca1jj91awtx.open(editor);
    });
  };
  var $_28a57oa0jj91awtu = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_7ny1sca1jj91awtx.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_7ny1sca1jj91awtx.open(editor);
      }
    });
  };
  var $_5utdw8a5jj91awub = { register: register$1 };

  global.add('code', function (editor) {
    $_28a57oa0jj91awtu.register(editor);
    $_5utdw8a5jj91awub.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
