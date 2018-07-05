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
  var $_205x2ia2jj8uwvmr = {
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
  var $_8d81bea4jj8uwvmt = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_205x2ia2jj8uwvmr.getMinWidth(editor);
    var minHeight = $_205x2ia2jj8uwvmr.getMinHeight(editor);
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
        $_8d81bea4jj8uwvmt.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_8d81bea4jj8uwvmt.getContent(editor));
  };
  var $_2a68qsa1jj8uwvmm = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_2a68qsa1jj8uwvmm.open(editor);
    });
  };
  var $_973k2oa0jj8uwvmj = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_2a68qsa1jj8uwvmm.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_2a68qsa1jj8uwvmm.open(editor);
      }
    });
  };
  var $_ata7vqa5jj8uwvmw = { register: register$1 };

  global.add('code', function (editor) {
    $_973k2oa0jj8uwvmj.register(editor);
    $_ata7vqa5jj8uwvmw.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
