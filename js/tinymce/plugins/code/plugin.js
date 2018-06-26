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
  var $_55tybl9ojgyjxx9h = {
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
  var $_cdrkkk9qjgyjxx9n = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_55tybl9ojgyjxx9h.getMinWidth(editor);
    var minHeight = $_55tybl9ojgyjxx9h.getMinHeight(editor);
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
        $_cdrkkk9qjgyjxx9n.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_cdrkkk9qjgyjxx9n.getContent(editor));
  };
  var $_a7nuh59njgyjxx9c = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_a7nuh59njgyjxx9c.open(editor);
    });
  };
  var $_639y2e9mjgyjxx94 = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_a7nuh59njgyjxx9c.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_a7nuh59njgyjxx9c.open(editor);
      }
    });
  };
  var $_9ub3hg9rjgyjxx9s = { register: register$1 };

  global.add('code', function (editor) {
    $_639y2e9mjgyjxx94.register(editor);
    $_9ub3hg9rjgyjxx9s.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
