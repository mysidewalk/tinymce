(function () {
var visualblocks = (function () {
  'use strict';

  var Cell = function (initial) {
    var value = initial;
    var get = function () {
      return value;
    };
    var set = function (v) {
      value = v;
    };
    var clone = function () {
      return Cell(get());
    };
    return {
      get: get,
      set: set,
      clone: clone
    };
  };

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var fireVisualBlocks = function (editor, state) {
    editor.fire('VisualBlocks', { state: state });
  };
  var $_cgb6d8sjjj8ux02c = { fireVisualBlocks: fireVisualBlocks };

  var isEnabledByDefault = function (editor) {
    return editor.getParam('visualblocks_default_state', false);
  };
  var getContentCss = function (editor) {
    return editor.settings.visualblocks_content_css;
  };
  var $_8xz4k2skjj8ux02d = {
    isEnabledByDefault: isEnabledByDefault,
    getContentCss: getContentCss
  };

  var global$1 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

  var global$2 = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var cssId = global$1.DOM.uniqueId();
  var load = function (doc, url) {
    var linkElements = global$2.toArray(doc.getElementsByTagName('link'));
    var matchingLinkElms = global$2.grep(linkElements, function (head) {
      return head.id === cssId;
    });
    if (matchingLinkElms.length === 0) {
      var linkElm = global$1.DOM.create('link', {
        id: cssId,
        rel: 'stylesheet',
        href: url
      });
      doc.getElementsByTagName('head')[0].appendChild(linkElm);
    }
  };
  var $_8ejqdcsljj8ux02f = { load: load };

  var toggleVisualBlocks = function (editor, pluginUrl, enabledState) {
    var dom = editor.dom;
    var contentCss = $_8xz4k2skjj8ux02d.getContentCss(editor);
    $_8ejqdcsljj8ux02f.load(editor.getDoc(), contentCss ? contentCss : pluginUrl + '/css/visualblocks.css');
    dom.toggleClass(editor.getBody(), 'mce-visualblocks');
    enabledState.set(!enabledState.get());
    $_cgb6d8sjjj8ux02c.fireVisualBlocks(editor, enabledState.get());
  };
  var $_6vo79zsijj8ux02b = { toggleVisualBlocks: toggleVisualBlocks };

  var register = function (editor, pluginUrl, enabledState) {
    editor.addCommand('mceVisualBlocks', function () {
      $_6vo79zsijj8ux02b.toggleVisualBlocks(editor, pluginUrl, enabledState);
    });
  };
  var $_af8rtyshjj8ux02a = { register: register };

  var setup = function (editor, pluginUrl, enabledState) {
    editor.on('PreviewFormats AfterPreviewFormats', function (e) {
      if (enabledState.get()) {
        editor.dom.toggleClass(editor.getBody(), 'mce-visualblocks', e.type === 'afterpreviewformats');
      }
    });
    editor.on('init', function () {
      if ($_8xz4k2skjj8ux02d.isEnabledByDefault(editor)) {
        $_6vo79zsijj8ux02b.toggleVisualBlocks(editor, pluginUrl, enabledState);
      }
    });
    editor.on('remove', function () {
      editor.dom.removeClass(editor.getBody(), 'mce-visualblocks');
    });
  };
  var $_apji8zsojj8ux02h = { setup: setup };

  var toggleActiveState = function (editor, enabledState) {
    return function (e) {
      var ctrl = e.control;
      ctrl.active(enabledState.get());
      editor.on('VisualBlocks', function (e) {
        ctrl.active(e.state);
      });
    };
  };
  var register$1 = function (editor, enabledState) {
    editor.addButton('visualblocks', {
      active: false,
      title: 'Show blocks',
      cmd: 'mceVisualBlocks',
      onPostRender: toggleActiveState(editor, enabledState)
    });
    editor.addMenuItem('visualblocks', {
      text: 'Show blocks',
      cmd: 'mceVisualBlocks',
      onPostRender: toggleActiveState(editor, enabledState),
      selectable: true,
      context: 'view',
      prependToContext: true
    });
  };
  var $_5qqwbdspjj8ux02i = { register: register$1 };

  global.add('visualblocks', function (editor, pluginUrl) {
    var enabledState = Cell(false);
    $_af8rtyshjj8ux02a.register(editor, pluginUrl, enabledState);
    $_5qqwbdspjj8ux02i.register(editor, enabledState);
    $_apji8zsojj8ux02h.setup(editor, pluginUrl, enabledState);
  });
  function Plugin () {
  }

  return Plugin;

}());
})();
