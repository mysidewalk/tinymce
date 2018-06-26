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
  var $_7zc2g49pjiwc8ibw = {
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
  var $_4phtwy9rjiwc8iby = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_7zc2g49pjiwc8ibw.getMinWidth(editor);
    var minHeight = $_7zc2g49pjiwc8ibw.getMinHeight(editor);
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
        $_4phtwy9rjiwc8iby.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_4phtwy9rjiwc8iby.getContent(editor));
  };
  var $_bxruun9ojiwc8ibv = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_bxruun9ojiwc8ibv.open(editor);
    });
  };
  var $_9mccrx9njiwc8ibt = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_bxruun9ojiwc8ibv.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_bxruun9ojiwc8ibv.open(editor);
      }
    });
  };
  var $_7oifot9sjiwc8ibz = { register: register$1 };

  global.add('code', function (editor) {
    $_9mccrx9njiwc8ibt.register(editor);
    $_7oifot9sjiwc8ibz.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
