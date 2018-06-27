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
  var $_28x7pf9pjiwlm676 = {
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
  var $_1bjoz39rjiwlm679 = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_28x7pf9pjiwlm676.getMinWidth(editor);
    var minHeight = $_28x7pf9pjiwlm676.getMinHeight(editor);
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
        $_1bjoz39rjiwlm679.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_1bjoz39rjiwlm679.getContent(editor));
  };
  var $_2f7otf9ojiwlm674 = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_2f7otf9ojiwlm674.open(editor);
    });
  };
  var $_7sij1v9njiwlm673 = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_2f7otf9ojiwlm674.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_2f7otf9ojiwlm674.open(editor);
      }
    });
  };
  var $_3zauvo9sjiwlm67a = { register: register$1 };

  global.add('code', function (editor) {
    $_7sij1v9njiwlm673.register(editor);
    $_3zauvo9sjiwlm67a.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
