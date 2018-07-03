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
  var $_3qorc5a2jj68z4ii = {
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
  var $_d5qoy0a4jj68z4in = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_3qorc5a2jj68z4ii.getMinWidth(editor);
    var minHeight = $_3qorc5a2jj68z4ii.getMinHeight(editor);
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
        $_d5qoy0a4jj68z4in.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_d5qoy0a4jj68z4in.getContent(editor));
  };
  var $_gbyg3aa1jj68z4if = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_gbyg3aa1jj68z4if.open(editor);
    });
  };
  var $_a893gba0jj68z4id = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_gbyg3aa1jj68z4if.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_gbyg3aa1jj68z4if.open(editor);
      }
    });
  };
  var $_8w6nyoa5jj68z4is = { register: register$1 };

  global.add('code', function (editor) {
    $_a893gba0jj68z4id.register(editor);
    $_8w6nyoa5jj68z4is.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
