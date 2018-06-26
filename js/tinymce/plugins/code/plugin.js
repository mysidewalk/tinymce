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
  var $_1o09dg9pjiwaaex0 = {
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
  var $_a6rzj09rjiwaaex1 = {
    setContent: setContent,
    getContent: getContent
  };

  var open = function (editor) {
    var minWidth = $_1o09dg9pjiwaaex0.getMinWidth(editor);
    var minHeight = $_1o09dg9pjiwaaex0.getMinHeight(editor);
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
        $_a6rzj09rjiwaaex1.setContent(editor, e.data.code);
      }
    });
    win.find('#code').value($_a6rzj09rjiwaaex1.getContent(editor));
  };
  var $_e5fmyh9ojiwaaewy = { open: open };

  var register = function (editor) {
    editor.addCommand('mceCodeEditor', function () {
      $_e5fmyh9ojiwaaewy.open(editor);
    });
  };
  var $_9b5jky9njiwaaewx = { register: register };

  var register$1 = function (editor) {
    editor.addButton('code', {
      icon: 'code',
      tooltip: 'Source code',
      onclick: function () {
        $_e5fmyh9ojiwaaewy.open(editor);
      }
    });
    editor.addMenuItem('code', {
      icon: 'code',
      text: 'Source code',
      onclick: function () {
        $_e5fmyh9ojiwaaewy.open(editor);
      }
    });
  };
  var $_3dtg659sjiwaaex2 = { register: register$1 };

  global.add('code', function (editor) {
    $_9b5jky9njiwaaewx.register(editor);
    $_3dtg659sjiwaaex2.register(editor);
    return {};
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
