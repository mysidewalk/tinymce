(function () {
var anchor = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var isValidId = function (id) {
    return /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);
  };
  var getId = function (editor) {
    var selectedNode = editor.selection.getNode();
    var isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';
    return isAnchor ? selectedNode.id || selectedNode.name : '';
  };
  var insert = function (editor, id) {
    var selectedNode = editor.selection.getNode();
    var isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';
    if (isAnchor) {
      selectedNode.removeAttribute('name');
      selectedNode.id = id;
      editor.undoManager.add();
    } else {
      editor.focus();
      editor.selection.collapse(true);
      editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', { id: id }));
    }
  };
  var $_gd19uv8cjiwlm622 = {
    isValidId: isValidId,
    getId: getId,
    insert: insert
  };

  var insertAnchor = function (editor, newId) {
    if (!$_gd19uv8cjiwlm622.isValidId(newId)) {
      editor.windowManager.alert('Id should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.');
      return true;
    } else {
      $_gd19uv8cjiwlm622.insert(editor, newId);
      return false;
    }
  };
  var open = function (editor) {
    var currentId = $_gd19uv8cjiwlm622.getId(editor);
    editor.windowManager.open({
      title: 'Anchor',
      body: {
        type: 'textbox',
        name: 'id',
        size: 40,
        label: 'Id',
        value: currentId
      },
      onsubmit: function (e) {
        var newId = e.data.id;
        if (insertAnchor(editor, newId)) {
          e.preventDefault();
        }
      }
    });
  };
  var $_ac214a8bjiwlm620 = { open: open };

  var register = function (editor) {
    editor.addCommand('mceAnchor', function () {
      $_ac214a8bjiwlm620.open(editor);
    });
  };
  var $_58tf8z8ajiwlm61z = { register: register };

  var isAnchorNode = function (node) {
    return !node.attr('href') && (node.attr('id') || node.attr('name')) && !node.firstChild;
  };
  var setContentEditable = function (state) {
    return function (nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (isAnchorNode(nodes[i])) {
          nodes[i].attr('contenteditable', state);
        }
      }
    };
  };
  var setup = function (editor) {
    editor.on('PreInit', function () {
      editor.parser.addNodeFilter('a', setContentEditable('false'));
      editor.serializer.addNodeFilter('a', setContentEditable(null));
    });
  };
  var $_1wvlnt8djiwlm624 = { setup: setup };

  var register$1 = function (editor) {
    editor.addButton('anchor', {
      icon: 'anchor',
      tooltip: 'Anchor',
      cmd: 'mceAnchor',
      stateSelector: 'a:not([href])'
    });
    editor.addMenuItem('anchor', {
      icon: 'anchor',
      text: 'Anchor',
      context: 'insert',
      cmd: 'mceAnchor'
    });
  };
  var $_aii1rx8ejiwlm625 = { register: register$1 };

  global.add('anchor', function (editor) {
    $_1wvlnt8djiwlm624.setup(editor);
    $_58tf8z8ajiwlm61z.register(editor);
    $_aii1rx8ejiwlm625.register(editor);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
