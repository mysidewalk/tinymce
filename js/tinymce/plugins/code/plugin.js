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
  var $_e3141xa2jj8vl38g = {
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
  var $_2a4fwya4jj8vl38k = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_e3141xa2jj8vl38g.getMinWidth(editor);
    var minHeight = $_e3141xa2jj8vl38g.getMinHeight(editor);
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
        $_2a4fwya4jj8vl38k.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_2a4fwya4jj8vl38k.getContent(editor));
  };
  var $_cgsomea1jj8vl38f = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_cgsomea1jj8vl38f.open(editor);
    });
  };
  var $_f3dtnja0jj8vl38e = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_cgsomea1jj8vl38f.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_cgsomea1jj8vl38f.open(editor);
      }
    });
  };
  var $_c7iuspa5jj8vl38m = { register: register$1 };

  global.add('code', function (editor) {
    $_f3dtnja0jj8vl38e.register(editor);
    $_c7iuspa5jj8vl38m.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
