(function () {
var table = (function () {
  'use strict';

  var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var noop = function () {
    var x = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      x[_i] = arguments[_i];
    }
  };

  var compose = function (fa, fb) {
    return function () {
      var x = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        x[_i] = arguments[_i];
      }
      return fa(fb.apply(null, arguments));
    };
  };
  var constant = function (value) {
    return function () {
      return value;
    };
  };
  var identity = function (x) {
    return x;
  };

  var curry = function (f) {
    var x = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      x[_i - 1] = arguments[_i];
    }
    var args = new Array(arguments.length - 1);
    for (var i = 1; i < arguments.length; i++)
      args[i - 1] = arguments[i];
    return function () {
      var x = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        x[_i] = arguments[_i];
      }
      var newArgs = new Array(arguments.length);
      for (var j = 0; j < newArgs.length; j++)
        newArgs[j] = arguments[j];
      var all = args.concat(newArgs);
      return f.apply(null, all);
    };
  };
  var not = function (f) {
    return function () {
      var x = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        x[_i] = arguments[_i];
      }
      return !f.apply(null, arguments);
    };
  };
  var die = function (msg) {
    return function () {
      throw new Error(msg);
    };
  };
  var apply = function (f) {
    return f();
  };

  var never = constant(false);
  var always = constant(true);

  var never$1 = never;
  var always$1 = always;
  var none = function () {
    return NONE;
  };
  var NONE = function () {
    var eq = function (o) {
      return o.isNone();
    };
    var call$$1 = function (thunk) {
      return thunk();
    };
    var id = function (n) {
      return n;
    };
    var noop$$1 = function () {
    };
    var nul = function () {
      return null;
    };
    var undef = function () {
      return undefined;
    };
    var me = {
      fold: function (n, s) {
        return n();
      },
      is: never$1,
      isSome: never$1,
      isNone: always$1,
      getOr: id,
      getOrThunk: call$$1,
      getOrDie: function (msg) {
        throw new Error(msg || 'error: getOrDie called on none.');
      },
      getOrNull: nul,
      getOrUndefined: undef,
      or: id,
      orThunk: call$$1,
      map: none,
      ap: none,
      each: noop$$1,
      bind: none,
      flatten: none,
      exists: never$1,
      forall: always$1,
      filter: none,
      equals: eq,
      equals_: eq,
      toArray: function () {
        return [];
      },
      toString: constant('none()')
    };
    if (Object.freeze)
      Object.freeze(me);
    return me;
  }();
  var some = function (a) {
    var constant_a = function () {
      return a;
    };
    var self = function () {
      return me;
    };
    var map = function (f) {
      return some(f(a));
    };
    var bind = function (f) {
      return f(a);
    };
    var me = {
      fold: function (n, s) {
        return s(a);
      },
      is: function (v) {
        return a === v;
      },
      isSome: always$1,
      isNone: never$1,
      getOr: constant_a,
      getOrThunk: constant_a,
      getOrDie: constant_a,
      getOrNull: constant_a,
      getOrUndefined: constant_a,
      or: self,
      orThunk: self,
      map: map,
      ap: function (optfab) {
        return optfab.fold(none, function (fab) {
          return some(fab(a));
        });
      },
      each: function (f) {
        f(a);
      },
      bind: bind,
      flatten: constant_a,
      exists: bind,
      forall: bind,
      filter: function (f) {
        return f(a) ? me : NONE;
      },
      equals: function (o) {
        return o.is(a);
      },
      equals_: function (o, elementEq) {
        return o.fold(never$1, function (b) {
          return elementEq(a, b);
        });
      },
      toArray: function () {
        return [a];
      },
      toString: function () {
        return 'some(' + a + ')';
      }
    };
    return me;
  };
  var from = function (value) {
    return value === null || value === undefined ? NONE : some(value);
  };
  var Option = {
    some: some,
    none: none,
    from: from
  };

  var typeOf = function (x) {
    if (x === null)
      return 'null';
    var t = typeof x;
    if (t === 'object' && Array.prototype.isPrototypeOf(x))
      return 'array';
    if (t === 'object' && String.prototype.isPrototypeOf(x))
      return 'string';
    return t;
  };
  var isType = function (type) {
    return function (value) {
      return typeOf(value) === type;
    };
  };
  var isString = isType('string');

  var isArray = isType('array');

  var isBoolean = isType('boolean');

  var isFunction = isType('function');
  var isNumber = isType('number');

  var rawIndexOf = function () {
    var pIndexOf = Array.prototype.indexOf;
    var fastIndex = function (xs, x) {
      return pIndexOf.call(xs, x);
    };
    var slowIndex = function (xs, x) {
      return slowIndexOf(xs, x);
    };
    return pIndexOf === undefined ? slowIndex : fastIndex;
  }();

  var contains = function (xs, x) {
    return rawIndexOf(xs, x) > -1;
  };
  var exists = function (xs, pred) {
    return findIndex(xs, pred).isSome();
  };


  var map = function (xs, f) {
    var len = xs.length;
    var r = new Array(len);
    for (var i = 0; i < len; i++) {
      var x = xs[i];
      r[i] = f(x, i, xs);
    }
    return r;
  };
  var each = function (xs, f) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      f(x, i, xs);
    }
  };
  var eachr = function (xs, f) {
    for (var i = xs.length - 1; i >= 0; i--) {
      var x = xs[i];
      f(x, i, xs);
    }
  };

  var filter = function (xs, pred) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        r.push(x);
      }
    }
    return r;
  };

  var foldr = function (xs, f, acc) {
    eachr(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var foldl = function (xs, f, acc) {
    each(xs, function (x) {
      acc = f(acc, x);
    });
    return acc;
  };
  var find = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return Option.some(x);
      }
    }
    return Option.none();
  };
  var findIndex = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; i++) {
      var x = xs[i];
      if (pred(x, i, xs)) {
        return Option.some(i);
      }
    }
    return Option.none();
  };
  var slowIndexOf = function (xs, x) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (xs[i] === x) {
        return i;
      }
    }
    return -1;
  };
  var push = Array.prototype.push;
  var flatten = function (xs) {
    var r = [];
    for (var i = 0, len = xs.length; i < len; ++i) {
      if (!Array.prototype.isPrototypeOf(xs[i]))
        throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
      push.apply(r, xs[i]);
    }
    return r;
  };
  var bind = function (xs, f) {
    var output = map(xs, f);
    return flatten(output);
  };
  var forall = function (xs, pred) {
    for (var i = 0, len = xs.length; i < len; ++i) {
      var x = xs[i];
      if (pred(x, i, xs) !== true) {
        return false;
      }
    }
    return true;
  };

  var slice = Array.prototype.slice;
  var reverse = function (xs) {
    var r = slice.call(xs, 0);
    r.reverse();
    return r;
  };





  var last = function (xs) {
    return xs.length === 0 ? Option.none() : Option.some(xs[xs.length - 1]);
  };
  var from$1 = isFunction(Array.from) ? Array.from : function (x) {
    return slice.call(x);
  };

  var keys = Object.keys;
  var each$1 = function (obj, f) {
    var props = keys(obj);
    for (var k = 0, len = props.length; k < len; k++) {
      var i = props[k];
      var x = obj[i];
      f(x, i, obj);
    }
  };
  var map$1 = function (obj, f) {
    return tupleMap(obj, function (x, i, obj) {
      return {
        k: i,
        v: f(x, i, obj)
      };
    });
  };
  var tupleMap = function (obj, f) {
    var r = {};
    each$1(obj, function (x, i) {
      var tuple = f(x, i, obj);
      r[tuple.k] = tuple.v;
    });
    return r;
  };

  var Immutable = function () {
    var fields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      fields[_i] = arguments[_i];
    }
    return function () {
      var values = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
      }
      if (fields.length !== values.length) {
        throw new Error('Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments');
      }
      var struct = {};
      each(fields, function (name, i) {
        struct[name] = constant(values[i]);
      });
      return struct;
    };
  };

  var sort$1 = function (arr) {
    return arr.slice(0).sort();
  };
  var reqMessage = function (required, keys) {
    throw new Error('All required keys (' + sort$1(required).join(', ') + ') were not specified. Specified keys were: ' + sort$1(keys).join(', ') + '.');
  };
  var unsuppMessage = function (unsupported) {
    throw new Error('Unsupported keys for object: ' + sort$1(unsupported).join(', '));
  };
  var validateStrArr = function (label, array) {
    if (!isArray(array))
      throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
    each(array, function (a) {
      if (!isString(a))
        throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
    });
  };
  var invalidTypeMessage = function (incorrect, type) {
    throw new Error('All values need to be of type: ' + type + '. Keys (' + sort$1(incorrect).join(', ') + ') were not.');
  };
  var checkDupes = function (everything) {
    var sorted = sort$1(everything);
    var dupe = find(sorted, function (s, i) {
      return i < sorted.length - 1 && s === sorted[i + 1];
    });
    dupe.each(function (d) {
      throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
    });
  };

  var MixedBag = function (required, optional) {
    var everything = required.concat(optional);
    if (everything.length === 0)
      throw new Error('You must specify at least one required or optional field.');
    validateStrArr('required', required);
    validateStrArr('optional', optional);
    checkDupes(everything);
    return function (obj) {
      var keys$$1 = keys(obj);
      var allReqd = forall(required, function (req) {
        return contains(keys$$1, req);
      });
      if (!allReqd)
        reqMessage(required, keys$$1);
      var unsupported = filter(keys$$1, function (key) {
        return !contains(everything, key);
      });
      if (unsupported.length > 0)
        unsuppMessage(unsupported);
      var r = {};
      each(required, function (req) {
        r[req] = constant(obj[req]);
      });
      each(optional, function (opt) {
        r[opt] = constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]) : Option.none());
      });
      return r;
    };
  };

  var dimensions = Immutable('width', 'height');
  var grid = Immutable('rows', 'columns');
  var address = Immutable('row', 'column');
  var coords = Immutable('x', 'y');
  var detail = Immutable('element', 'rowspan', 'colspan');
  var detailnew = Immutable('element', 'rowspan', 'colspan', 'isNew');
  var extended = Immutable('element', 'rowspan', 'colspan', 'row', 'column');
  var rowdata = Immutable('element', 'cells', 'section');
  var elementnew = Immutable('element', 'isNew');
  var rowdatanew = Immutable('element', 'cells', 'section', 'isNew');
  var rowcells = Immutable('cells', 'section');
  var rowdetails = Immutable('details', 'section');
  var bounds = Immutable('startRow', 'startCol', 'finishRow', 'finishCol');
  var $_18gj1tlbjm8ldtd1 = {
    dimensions: dimensions,
    grid: grid,
    address: address,
    coords: coords,
    extended: extended,
    detail: detail,
    detailnew: detailnew,
    rowdata: rowdata,
    elementnew: elementnew,
    rowdatanew: rowdatanew,
    rowcells: rowcells,
    rowdetails: rowdetails,
    bounds: bounds
  };

  var fromHtml = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    if (!div.hasChildNodes() || div.childNodes.length > 1) {
      console.error('HTML does not have a single root node', html);
      throw 'HTML must have a single root node';
    }
    return fromDom(div.childNodes[0]);
  };
  var fromTag = function (tag, scope) {
    var doc = scope || document;
    var node = doc.createElement(tag);
    return fromDom(node);
  };
  var fromText = function (text, scope) {
    var doc = scope || document;
    var node = doc.createTextNode(text);
    return fromDom(node);
  };
  var fromDom = function (node) {
    if (node === null || node === undefined)
      throw new Error('Node cannot be null or undefined');
    return { dom: constant(node) };
  };
  var fromPoint = function (docElm, x, y) {
    var doc = docElm.dom();
    return Option.from(doc.elementFromPoint(x, y)).map(fromDom);
  };
  var Element$$1 = {
    fromHtml: fromHtml,
    fromTag: fromTag,
    fromText: fromText,
    fromDom: fromDom,
    fromPoint: fromPoint
  };

  var $_clccx0lhjm8ldtes = {
    ATTRIBUTE: Node.ATTRIBUTE_NODE,
    CDATA_SECTION: Node.CDATA_SECTION_NODE,
    COMMENT: Node.COMMENT_NODE,
    DOCUMENT: Node.DOCUMENT_NODE,
    DOCUMENT_TYPE: Node.DOCUMENT_TYPE_NODE,
    DOCUMENT_FRAGMENT: Node.DOCUMENT_FRAGMENT_NODE,
    ELEMENT: Node.ELEMENT_NODE,
    TEXT: Node.TEXT_NODE,
    PROCESSING_INSTRUCTION: Node.PROCESSING_INSTRUCTION_NODE,
    ENTITY_REFERENCE: Node.ENTITY_REFERENCE_NODE,
    ENTITY: Node.ENTITY_NODE,
    NOTATION: Node.NOTATION_NODE
  };

  var ELEMENT = $_clccx0lhjm8ldtes.ELEMENT;
  var DOCUMENT = $_clccx0lhjm8ldtes.DOCUMENT;
  var is = function (element, selector) {
    var elem = element.dom();
    if (elem.nodeType !== ELEMENT)
      return false;
    else if (elem.matches !== undefined)
      return elem.matches(selector);
    else if (elem.msMatchesSelector !== undefined)
      return elem.msMatchesSelector(selector);
    else if (elem.webkitMatchesSelector !== undefined)
      return elem.webkitMatchesSelector(selector);
    else if (elem.mozMatchesSelector !== undefined)
      return elem.mozMatchesSelector(selector);
    else
      throw new Error('Browser lacks native selectors');
  };
  var bypassSelector = function (dom) {
    return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT || dom.childElementCount === 0;
  };
  var all = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? [] : map(base.querySelectorAll(selector), Element$$1.fromDom);
  };
  var one = function (selector, scope) {
    var base = scope === undefined ? document : scope.dom();
    return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map(Element$$1.fromDom);
  };
  var $_eqepc2lejm8ldte5 = {
    all: all,
    is: is,
    one: one
  };

  var toArray = function (target, f) {
    var r = [];
    var recurse = function (e) {
      r.push(e);
      return f(e);
    };
    var cur = f(target);
    do {
      cur = cur.bind(recurse);
    } while (cur.isSome());
    return r;
  };
  var $_fivbhuljjm8ldtf9 = { toArray: toArray };

  var Global = typeof window !== 'undefined' ? window : Function('return this;')();

  var path = function (parts, scope) {
    var o = scope !== undefined && scope !== null ? scope : Global;
    for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
      o = o[parts[i]];
    return o;
  };
  var resolve = function (p, scope) {
    var parts = p.split('.');
    return path(parts, scope);
  };

  var unsafe = function (name, scope) {
    return resolve(name, scope);
  };
  var getOrDie = function (name, scope) {
    var actual = unsafe(name, scope);
    if (actual === undefined || actual === null)
      throw name + ' not available on this browser';
    return actual;
  };
  var $_cqw3a6lmjm8ldtfq = { getOrDie: getOrDie };

  var node = function () {
    var f = $_cqw3a6lmjm8ldtfq.getOrDie('Node');
    return f;
  };
  var compareDocumentPosition = function (a, b, match) {
    return (a.compareDocumentPosition(b) & match) !== 0;
  };
  var documentPositionPreceding = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
  };
  var documentPositionContainedBy = function (a, b) {
    return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
  };
  var $_58d4cplljm8ldtfp = {
    documentPositionPreceding: documentPositionPreceding,
    documentPositionContainedBy: documentPositionContainedBy
  };

  var cached = function (f) {
    var called = false;
    var r;
    return function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (!called) {
        called = true;
        r = f.apply(null, args);
      }
      return r;
    };
  };

  var firstMatch = function (regexes, s) {
    for (var i = 0; i < regexes.length; i++) {
      var x = regexes[i];
      if (x.test(s))
        return x;
    }
    return undefined;
  };
  var find$2 = function (regexes, agent) {
    var r = firstMatch(regexes, agent);
    if (!r)
      return {
        major: 0,
        minor: 0
      };
    var group = function (i) {
      return Number(agent.replace(r, '$' + i));
    };
    return nu(group(1), group(2));
  };
  var detect = function (versionRegexes, agent) {
    var cleanedAgent = String(agent).toLowerCase();
    if (versionRegexes.length === 0)
      return unknown();
    return find$2(versionRegexes, cleanedAgent);
  };
  var unknown = function () {
    return nu(0, 0);
  };
  var nu = function (major, minor) {
    return {
      major: major,
      minor: minor
    };
  };
  var $_3c7po4ltjm8ldtg5 = {
    nu: nu,
    detect: detect,
    unknown: unknown
  };

  var edge = 'Edge';
  var chrome = 'Chrome';
  var ie = 'IE';
  var opera = 'Opera';
  var firefox = 'Firefox';
  var safari = 'Safari';
  var isBrowser = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$1 = function () {
    return nu$1({
      current: undefined,
      version: $_3c7po4ltjm8ldtg5.unknown()
    });
  };
  var nu$1 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isEdge: isBrowser(edge, current),
      isChrome: isBrowser(chrome, current),
      isIE: isBrowser(ie, current),
      isOpera: isBrowser(opera, current),
      isFirefox: isBrowser(firefox, current),
      isSafari: isBrowser(safari, current)
    };
  };
  var $_d98zo2lsjm8ldtg2 = {
    unknown: unknown$1,
    nu: nu$1,
    edge: constant(edge),
    chrome: constant(chrome),
    ie: constant(ie),
    opera: constant(opera),
    firefox: constant(firefox),
    safari: constant(safari)
  };

  var windows = 'Windows';
  var ios = 'iOS';
  var android = 'Android';
  var linux = 'Linux';
  var osx = 'OSX';
  var solaris = 'Solaris';
  var freebsd = 'FreeBSD';
  var isOS = function (name, current) {
    return function () {
      return current === name;
    };
  };
  var unknown$2 = function () {
    return nu$2({
      current: undefined,
      version: $_3c7po4ltjm8ldtg5.unknown()
    });
  };
  var nu$2 = function (info) {
    var current = info.current;
    var version = info.version;
    return {
      current: current,
      version: version,
      isWindows: isOS(windows, current),
      isiOS: isOS(ios, current),
      isAndroid: isOS(android, current),
      isOSX: isOS(osx, current),
      isLinux: isOS(linux, current),
      isSolaris: isOS(solaris, current),
      isFreeBSD: isOS(freebsd, current)
    };
  };
  var $_6zjzbxlujm8ldtg6 = {
    unknown: unknown$2,
    nu: nu$2,
    windows: constant(windows),
    ios: constant(ios),
    android: constant(android),
    linux: constant(linux),
    osx: constant(osx),
    solaris: constant(solaris),
    freebsd: constant(freebsd)
  };

  function DeviceType (os, browser, userAgent) {
    var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
    var isiPhone = os.isiOS() && !isiPad;
    var isAndroid3 = os.isAndroid() && os.version.major === 3;
    var isAndroid4 = os.isAndroid() && os.version.major === 4;
    var isTablet = isiPad || isAndroid3 || isAndroid4 && /mobile/i.test(userAgent) === true;
    var isTouch = os.isiOS() || os.isAndroid();
    var isPhone = isTouch && !isTablet;
    var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
    return {
      isiPad: constant(isiPad),
      isiPhone: constant(isiPhone),
      isTablet: constant(isTablet),
      isPhone: constant(isPhone),
      isTouch: constant(isTouch),
      isAndroid: os.isAndroid,
      isiOS: os.isiOS,
      isWebView: constant(iOSwebview)
    };
  }

  var detect$1 = function (candidates, userAgent) {
    var agent = String(userAgent).toLowerCase();
    return find(candidates, function (candidate) {
      return candidate.search(agent);
    });
  };
  var detectBrowser = function (browsers, userAgent) {
    return detect$1(browsers, userAgent).map(function (browser) {
      var version = $_3c7po4ltjm8ldtg5.detect(browser.versionRegexes, userAgent);
      return {
        current: browser.name,
        version: version
      };
    });
  };
  var detectOs = function (oses, userAgent) {
    return detect$1(oses, userAgent).map(function (os) {
      var version = $_3c7po4ltjm8ldtg5.detect(os.versionRegexes, userAgent);
      return {
        current: os.name,
        version: version
      };
    });
  };
  var $_fijdgulwjm8ldtgd = {
    detectBrowser: detectBrowser,
    detectOs: detectOs
  };

  var checkRange = function (str, substr, start) {
    if (substr === '')
      return true;
    if (str.length < substr.length)
      return false;
    var x = str.substr(start, start + substr.length);
    return x === substr;
  };





  var contains$1 = function (str, substr) {
    return str.indexOf(substr) !== -1;
  };


  var endsWith = function (str, suffix) {
    return checkRange(str, suffix, str.length - suffix.length);
  };
  var trim = function (str) {
    return str.replace(/^\s+|\s+$/g, '');
  };

  var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
  var checkContains = function (target) {
    return function (uastring) {
      return contains$1(uastring, target);
    };
  };
  var browsers = [
    {
      name: 'Edge',
      versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
      search: function (uastring) {
        var monstrosity = contains$1(uastring, 'edge/') && contains$1(uastring, 'chrome') && contains$1(uastring, 'safari') && contains$1(uastring, 'applewebkit');
        return monstrosity;
      }
    },
    {
      name: 'Chrome',
      versionRegexes: [
        /.*?chrome\/([0-9]+)\.([0-9]+).*/,
        normalVersionRegex
      ],
      search: function (uastring) {
        return contains$1(uastring, 'chrome') && !contains$1(uastring, 'chromeframe');
      }
    },
    {
      name: 'IE',
      versionRegexes: [
        /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
        /.*?rv:([0-9]+)\.([0-9]+).*/
      ],
      search: function (uastring) {
        return contains$1(uastring, 'msie') || contains$1(uastring, 'trident');
      }
    },
    {
      name: 'Opera',
      versionRegexes: [
        normalVersionRegex,
        /.*?opera\/([0-9]+)\.([0-9]+).*/
      ],
      search: checkContains('opera')
    },
    {
      name: 'Firefox',
      versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
      search: checkContains('firefox')
    },
    {
      name: 'Safari',
      versionRegexes: [
        normalVersionRegex,
        /.*?cpu os ([0-9]+)_([0-9]+).*/
      ],
      search: function (uastring) {
        return (contains$1(uastring, 'safari') || contains$1(uastring, 'mobile/')) && contains$1(uastring, 'applewebkit');
      }
    }
  ];
  var oses = [
    {
      name: 'Windows',
      search: checkContains('win'),
      versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'iOS',
      search: function (uastring) {
        return contains$1(uastring, 'iphone') || contains$1(uastring, 'ipad');
      },
      versionRegexes: [
        /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
        /.*cpu os ([0-9]+)_([0-9]+).*/,
        /.*cpu iphone os ([0-9]+)_([0-9]+).*/
      ]
    },
    {
      name: 'Android',
      search: checkContains('android'),
      versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
    },
    {
      name: 'OSX',
      search: checkContains('os x'),
      versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
    },
    {
      name: 'Linux',
      search: checkContains('linux'),
      versionRegexes: []
    },
    {
      name: 'Solaris',
      search: checkContains('sunos'),
      versionRegexes: []
    },
    {
      name: 'FreeBSD',
      search: checkContains('freebsd'),
      versionRegexes: []
    }
  ];
  var $_cq1fj7lxjm8ldtgh = {
    browsers: constant(browsers),
    oses: constant(oses)
  };

  var detect$2 = function (userAgent) {
    var browsers = $_cq1fj7lxjm8ldtgh.browsers();
    var oses = $_cq1fj7lxjm8ldtgh.oses();
    var browser = $_fijdgulwjm8ldtgd.detectBrowser(browsers, userAgent).fold($_d98zo2lsjm8ldtg2.unknown, $_d98zo2lsjm8ldtg2.nu);
    var os = $_fijdgulwjm8ldtgd.detectOs(oses, userAgent).fold($_6zjzbxlujm8ldtg6.unknown, $_6zjzbxlujm8ldtg6.nu);
    var deviceType = DeviceType(os, browser, userAgent);
    return {
      browser: browser,
      os: os,
      deviceType: deviceType
    };
  };
  var $_jib5jlrjm8ldtg1 = { detect: detect$2 };

  var detect$3 = cached(function () {
    var userAgent = navigator.userAgent;
    return $_jib5jlrjm8ldtg1.detect(userAgent);
  });
  var $_cpch3zlpjm8ldtfu = { detect: detect$3 };

  var eq = function (e1, e2) {
    return e1.dom() === e2.dom();
  };
  var isEqualNode = function (e1, e2) {
    return e1.dom().isEqualNode(e2.dom());
  };
  var member = function (element, elements) {
    return exists(elements, curry(eq, element));
  };
  var regularContains = function (e1, e2) {
    var d1 = e1.dom(), d2 = e2.dom();
    return d1 === d2 ? false : d1.contains(d2);
  };
  var ieContains = function (e1, e2) {
    return $_58d4cplljm8ldtfp.documentPositionContainedBy(e1.dom(), e2.dom());
  };
  var browser = $_cpch3zlpjm8ldtfu.detect().browser;
  var contains$2 = browser.isIE() ? ieContains : regularContains;
  var $_ak7uzflkjm8ldtfb = {
    eq: eq,
    isEqualNode: isEqualNode,
    member: member,
    contains: contains$2,
    is: $_eqepc2lejm8ldte5.is
  };

  var owner = function (element) {
    return Element$$1.fromDom(element.dom().ownerDocument);
  };
  var documentElement = function (element) {
    return Element$$1.fromDom(element.dom().ownerDocument.documentElement);
  };
  var defaultView = function (element) {
    var el = element.dom();
    var defaultView = el.ownerDocument.defaultView;
    return Element$$1.fromDom(defaultView);
  };
  var parent = function (element) {
    var dom = element.dom();
    return Option.from(dom.parentNode).map(Element$$1.fromDom);
  };
  var findIndex$1 = function (element) {
    return parent(element).bind(function (p) {
      var kin = children(p);
      return findIndex(kin, function (elem) {
        return $_ak7uzflkjm8ldtfb.eq(element, elem);
      });
    });
  };
  var parents = function (element, isRoot) {
    var stop = isFunction(isRoot) ? isRoot : constant(false);
    var dom = element.dom();
    var ret = [];
    while (dom.parentNode !== null && dom.parentNode !== undefined) {
      var rawParent = dom.parentNode;
      var parent = Element$$1.fromDom(rawParent);
      ret.push(parent);
      if (stop(parent) === true)
        break;
      else
        dom = rawParent;
    }
    return ret;
  };
  var siblings = function (element) {
    var filterSelf = function (elements) {
      return filter(elements, function (x) {
        return !$_ak7uzflkjm8ldtfb.eq(element, x);
      });
    };
    return parent(element).map(children).map(filterSelf).getOr([]);
  };
  var offsetParent = function (element) {
    var dom = element.dom();
    return Option.from(dom.offsetParent).map(Element$$1.fromDom);
  };
  var prevSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.previousSibling).map(Element$$1.fromDom);
  };
  var nextSibling = function (element) {
    var dom = element.dom();
    return Option.from(dom.nextSibling).map(Element$$1.fromDom);
  };
  var prevSiblings = function (element) {
    return reverse($_fivbhuljjm8ldtf9.toArray(element, prevSibling));
  };
  var nextSiblings = function (element) {
    return $_fivbhuljjm8ldtf9.toArray(element, nextSibling);
  };
  var children = function (element) {
    var dom = element.dom();
    return map(dom.childNodes, Element$$1.fromDom);
  };
  var child = function (element, index) {
    var children = element.dom().childNodes;
    return Option.from(children[index]).map(Element$$1.fromDom);
  };
  var firstChild = function (element) {
    return child(element, 0);
  };
  var lastChild = function (element) {
    return child(element, element.dom().childNodes.length - 1);
  };
  var childNodesCount = function (element) {
    return element.dom().childNodes.length;
  };
  var hasChildNodes = function (element) {
    return element.dom().hasChildNodes();
  };
  var spot = Immutable('element', 'offset');
  var leaf = function (element, offset) {
    var cs = children(element);
    return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
  };
  var $_8mc5g7lijm8ldtev = {
    owner: owner,
    defaultView: defaultView,
    documentElement: documentElement,
    parent: parent,
    findIndex: findIndex$1,
    parents: parents,
    siblings: siblings,
    prevSibling: prevSibling,
    offsetParent: offsetParent,
    prevSiblings: prevSiblings,
    nextSibling: nextSibling,
    nextSiblings: nextSiblings,
    children: children,
    child: child,
    firstChild: firstChild,
    lastChild: lastChild,
    childNodesCount: childNodesCount,
    hasChildNodes: hasChildNodes,
    leaf: leaf
  };

  var firstLayer = function (scope, selector) {
    return filterFirstLayer(scope, selector, constant(true));
  };
  var filterFirstLayer = function (scope, selector, predicate) {
    return bind($_8mc5g7lijm8ldtev.children(scope), function (x) {
      return $_eqepc2lejm8ldte5.is(x, selector) ? predicate(x) ? [x] : [] : filterFirstLayer(x, selector, predicate);
    });
  };
  var $_a8kcl6ldjm8ldtdv = {
    firstLayer: firstLayer,
    filterFirstLayer: filterFirstLayer
  };

  var name = function (element) {
    var r = element.dom().nodeName;
    return r.toLowerCase();
  };
  var type = function (element) {
    return element.dom().nodeType;
  };
  var value = function (element) {
    return element.dom().nodeValue;
  };
  var isType$1 = function (t) {
    return function (element) {
      return type(element) === t;
    };
  };
  var isComment = function (element) {
    return type(element) === $_clccx0lhjm8ldtes.COMMENT || name(element) === '#comment';
  };
  var isElement = isType$1($_clccx0lhjm8ldtes.ELEMENT);
  var isText = isType$1($_clccx0lhjm8ldtes.TEXT);
  var isDocument = isType$1($_clccx0lhjm8ldtes.DOCUMENT);
  var $_aq9fg3m2jm8ldth1 = {
    name: name,
    type: type,
    value: value,
    isElement: isElement,
    isText: isText,
    isDocument: isDocument,
    isComment: isComment
  };

  var rawSet = function (dom, key, value) {
    if (isString(value) || isBoolean(value) || isNumber(value)) {
      dom.setAttribute(key, value + '');
    } else {
      console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
      throw new Error('Attribute value was not simple');
    }
  };
  var set = function (element, key, value) {
    rawSet(element.dom(), key, value);
  };
  var setAll = function (element, attrs) {
    var dom = element.dom();
    each$1(attrs, function (v, k) {
      rawSet(dom, k, v);
    });
  };
  var get = function (element, key) {
    var v = element.dom().getAttribute(key);
    return v === null ? undefined : v;
  };
  var has = function (element, key) {
    var dom = element.dom();
    return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
  };
  var remove = function (element, key) {
    element.dom().removeAttribute(key);
  };
  var hasNone = function (element) {
    var attrs = element.dom().attributes;
    return attrs === undefined || attrs === null || attrs.length === 0;
  };
  var clone = function (element) {
    return foldl(element.dom().attributes, function (acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  };
  var transferOne = function (source, destination, attr) {
    if (has(source, attr) && !has(destination, attr))
      set(destination, attr, get(source, attr));
  };
  var transfer = function (source, destination, attrs) {
    if (!$_aq9fg3m2jm8ldth1.isElement(source) || !$_aq9fg3m2jm8ldth1.isElement(destination))
      return;
    each(attrs, function (attr) {
      transferOne(source, destination, attr);
    });
  };
  var $_dz8wvwm1jm8ldtgt = {
    clone: clone,
    set: set,
    setAll: setAll,
    get: get,
    has: has,
    remove: remove,
    hasNone: hasNone,
    transfer: transfer
  };

  var inBody = function (element) {
    var dom = $_aq9fg3m2jm8ldth1.isText(element) ? element.dom().parentNode : element.dom();
    return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
  };
  var body = cached(function () {
    return getBody(Element$$1.fromDom(document));
  });
  var getBody = function (doc) {
    var body = doc.dom().body;
    if (body === null || body === undefined)
      throw 'Body is not available yet';
    return Element$$1.fromDom(body);
  };
  var $_3hsphum5jm8ldth8 = {
    body: body,
    getBody: getBody,
    inBody: inBody
  };

  var all$1 = function (predicate) {
    return descendants($_3hsphum5jm8ldth8.body(), predicate);
  };
  var ancestors = function (scope, predicate, isRoot) {
    return filter($_8mc5g7lijm8ldtev.parents(scope, isRoot), predicate);
  };
  var siblings$1 = function (scope, predicate) {
    return filter($_8mc5g7lijm8ldtev.siblings(scope), predicate);
  };
  var children$1 = function (scope, predicate) {
    return filter($_8mc5g7lijm8ldtev.children(scope), predicate);
  };
  var descendants = function (scope, predicate) {
    var result = [];
    each($_8mc5g7lijm8ldtev.children(scope), function (x) {
      if (predicate(x)) {
        result = result.concat([x]);
      }
      result = result.concat(descendants(x, predicate));
    });
    return result;
  };
  var $_vs38qm4jm8ldth4 = {
    all: all$1,
    ancestors: ancestors,
    siblings: siblings$1,
    children: children$1,
    descendants: descendants
  };

  var all$2 = function (selector) {
    return $_eqepc2lejm8ldte5.all(selector);
  };
  var ancestors$1 = function (scope, selector, isRoot) {
    return $_vs38qm4jm8ldth4.ancestors(scope, function (e) {
      return $_eqepc2lejm8ldte5.is(e, selector);
    }, isRoot);
  };
  var siblings$2 = function (scope, selector) {
    return $_vs38qm4jm8ldth4.siblings(scope, function (e) {
      return $_eqepc2lejm8ldte5.is(e, selector);
    });
  };
  var children$2 = function (scope, selector) {
    return $_vs38qm4jm8ldth4.children(scope, function (e) {
      return $_eqepc2lejm8ldte5.is(e, selector);
    });
  };
  var descendants$1 = function (scope, selector) {
    return $_eqepc2lejm8ldte5.all(selector, scope);
  };
  var $_emvpc1m3jm8ldth3 = {
    all: all$2,
    ancestors: ancestors$1,
    siblings: siblings$2,
    children: children$2,
    descendants: descendants$1
  };

  function ClosestOrAncestor (is, ancestor, scope, a, isRoot) {
    return is(scope, a) ? Option.some(scope) : isFunction(isRoot) && isRoot(scope) ? Option.none() : ancestor(scope, a, isRoot);
  }

  var first$1 = function (predicate) {
    return descendant($_3hsphum5jm8ldth8.body(), predicate);
  };
  var ancestor = function (scope, predicate, isRoot) {
    var element = scope.dom();
    var stop = isFunction(isRoot) ? isRoot : constant(false);
    while (element.parentNode) {
      element = element.parentNode;
      var el = Element$$1.fromDom(element);
      if (predicate(el))
        return Option.some(el);
      else if (stop(el))
        break;
    }
    return Option.none();
  };
  var closest = function (scope, predicate, isRoot) {
    var is = function (scope) {
      return predicate(scope);
    };
    return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
  };
  var sibling = function (scope, predicate) {
    var element = scope.dom();
    if (!element.parentNode)
      return Option.none();
    return child$1(Element$$1.fromDom(element.parentNode), function (x) {
      return !$_ak7uzflkjm8ldtfb.eq(scope, x) && predicate(x);
    });
  };
  var child$1 = function (scope, predicate) {
    var result = find(scope.dom().childNodes, compose(predicate, Element$$1.fromDom));
    return result.map(Element$$1.fromDom);
  };
  var descendant = function (scope, predicate) {
    var descend = function (node) {
      for (var i = 0; i < node.childNodes.length; i++) {
        if (predicate(Element$$1.fromDom(node.childNodes[i])))
          return Option.some(Element$$1.fromDom(node.childNodes[i]));
        var res = descend(node.childNodes[i]);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope.dom());
  };
  var $_4sg7f1m7jm8ldthh = {
    first: first$1,
    ancestor: ancestor,
    closest: closest,
    sibling: sibling,
    child: child$1,
    descendant: descendant
  };

  var first$2 = function (selector) {
    return $_eqepc2lejm8ldte5.one(selector);
  };
  var ancestor$1 = function (scope, selector, isRoot) {
    return $_4sg7f1m7jm8ldthh.ancestor(scope, function (e) {
      return $_eqepc2lejm8ldte5.is(e, selector);
    }, isRoot);
  };
  var sibling$1 = function (scope, selector) {
    return $_4sg7f1m7jm8ldthh.sibling(scope, function (e) {
      return $_eqepc2lejm8ldte5.is(e, selector);
    });
  };
  var child$2 = function (scope, selector) {
    return $_4sg7f1m7jm8ldthh.child(scope, function (e) {
      return $_eqepc2lejm8ldte5.is(e, selector);
    });
  };
  var descendant$1 = function (scope, selector) {
    return $_eqepc2lejm8ldte5.one(selector, scope);
  };
  var closest$1 = function (scope, selector, isRoot) {
    return ClosestOrAncestor($_eqepc2lejm8ldte5.is, ancestor$1, scope, selector, isRoot);
  };
  var $_6mmdzsm6jm8ldthg = {
    first: first$2,
    ancestor: ancestor$1,
    sibling: sibling$1,
    child: child$2,
    descendant: descendant$1,
    closest: closest$1
  };

  var lookup = function (tags, element, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : constant(false);
    if (isRoot(element))
      return Option.none();
    if (contains(tags, $_aq9fg3m2jm8ldth1.name(element)))
      return Option.some(element);
    var isRootOrUpperTable = function (element) {
      return $_eqepc2lejm8ldte5.is(element, 'table') || isRoot(element);
    };
    return $_6mmdzsm6jm8ldthg.ancestor(element, tags.join(','), isRootOrUpperTable);
  };
  var cell = function (element, isRoot) {
    return lookup([
      'td',
      'th'
    ], element, isRoot);
  };
  var cells = function (ancestor) {
    return $_a8kcl6ldjm8ldtdv.firstLayer(ancestor, 'th,td');
  };
  var notCell = function (element, isRoot) {
    return lookup([
      'caption',
      'tr',
      'tbody',
      'tfoot',
      'thead'
    ], element, isRoot);
  };
  var neighbours = function (selector, element) {
    return $_8mc5g7lijm8ldtev.parent(element).map(function (parent) {
      return $_emvpc1m3jm8ldth3.children(parent, selector);
    });
  };
  var neighbourCells = curry(neighbours, 'th,td');
  var neighbourRows = curry(neighbours, 'tr');
  var firstCell = function (ancestor) {
    return $_6mmdzsm6jm8ldthg.descendant(ancestor, 'th,td');
  };
  var table = function (element, isRoot) {
    return $_6mmdzsm6jm8ldthg.closest(element, 'table', isRoot);
  };
  var row = function (element, isRoot) {
    return lookup(['tr'], element, isRoot);
  };
  var rows = function (ancestor) {
    return $_a8kcl6ldjm8ldtdv.firstLayer(ancestor, 'tr');
  };
  var attr = function (element, property) {
    return parseInt($_dz8wvwm1jm8ldtgt.get(element, property), 10);
  };
  var grid$1 = function (element, rowProp, colProp) {
    var rows = attr(element, rowProp);
    var cols = attr(element, colProp);
    return $_18gj1tlbjm8ldtd1.grid(rows, cols);
  };
  var $_b4ktmplcjm8ldtd5 = {
    cell: cell,
    firstCell: firstCell,
    cells: cells,
    neighbourCells: neighbourCells,
    table: table,
    row: row,
    rows: rows,
    notCell: notCell,
    neighbourRows: neighbourRows,
    attr: attr,
    grid: grid$1
  };

  var fromTable = function (table) {
    var rows = $_b4ktmplcjm8ldtd5.rows(table);
    return map(rows, function (row) {
      var element = row;
      var parent = $_8mc5g7lijm8ldtev.parent(element);
      var parentSection = parent.map(function (parent) {
        var parentName = $_aq9fg3m2jm8ldth1.name(parent);
        return parentName === 'tfoot' || parentName === 'thead' || parentName === 'tbody' ? parentName : 'tbody';
      }).getOr('tbody');
      var cells = map($_b4ktmplcjm8ldtd5.cells(row), function (cell) {
        var rowspan = $_dz8wvwm1jm8ldtgt.has(cell, 'rowspan') ? parseInt($_dz8wvwm1jm8ldtgt.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_dz8wvwm1jm8ldtgt.has(cell, 'colspan') ? parseInt($_dz8wvwm1jm8ldtgt.get(cell, 'colspan'), 10) : 1;
        return $_18gj1tlbjm8ldtd1.detail(cell, rowspan, colspan);
      });
      return $_18gj1tlbjm8ldtd1.rowdata(element, cells, parentSection);
    });
  };
  var fromPastedRows = function (rows, example) {
    return map(rows, function (row) {
      var cells = map($_b4ktmplcjm8ldtd5.cells(row), function (cell) {
        var rowspan = $_dz8wvwm1jm8ldtgt.has(cell, 'rowspan') ? parseInt($_dz8wvwm1jm8ldtgt.get(cell, 'rowspan'), 10) : 1;
        var colspan = $_dz8wvwm1jm8ldtgt.has(cell, 'colspan') ? parseInt($_dz8wvwm1jm8ldtgt.get(cell, 'colspan'), 10) : 1;
        return $_18gj1tlbjm8ldtd1.detail(cell, rowspan, colspan);
      });
      return $_18gj1tlbjm8ldtd1.rowdata(row, cells, example.section());
    });
  };
  var $_act3unlajm8ldtcq = {
    fromTable: fromTable,
    fromPastedRows: fromPastedRows
  };

  var key = function (row, column) {
    return row + ',' + column;
  };
  var getAt = function (warehouse, row, column) {
    var raw = warehouse.access()[key(row, column)];
    return raw !== undefined ? Option.some(raw) : Option.none();
  };
  var findItem = function (warehouse, item, comparator) {
    var filtered = filterItems(warehouse, function (detail) {
      return comparator(item, detail.element());
    });
    return filtered.length > 0 ? Option.some(filtered[0]) : Option.none();
  };
  var filterItems = function (warehouse, predicate) {
    var all = bind(warehouse.all(), function (r) {
      return r.cells();
    });
    return filter(all, predicate);
  };
  var generate = function (list) {
    var access = {};
    var cells = [];
    var maxRows = list.length;
    var maxColumns = 0;
    each(list, function (details, r) {
      var currentRow = [];
      each(details.cells(), function (detail, c) {
        var start = 0;
        while (access[key(r, start)] !== undefined) {
          start++;
        }
        var current = $_18gj1tlbjm8ldtd1.extended(detail.element(), detail.rowspan(), detail.colspan(), r, start);
        for (var i = 0; i < detail.colspan(); i++) {
          for (var j = 0; j < detail.rowspan(); j++) {
            var cr = r + j;
            var cc = start + i;
            var newpos = key(cr, cc);
            access[newpos] = current;
            maxColumns = Math.max(maxColumns, cc + 1);
          }
        }
        currentRow.push(current);
      });
      cells.push($_18gj1tlbjm8ldtd1.rowdata(details.element(), currentRow, details.section()));
    });
    var grid = $_18gj1tlbjm8ldtd1.grid(maxRows, maxColumns);
    return {
      grid: constant(grid),
      access: constant(access),
      all: constant(cells)
    };
  };
  var justCells = function (warehouse) {
    var rows = map(warehouse.all(), function (w) {
      return w.cells();
    });
    return flatten(rows);
  };
  var $_fciyglm9jm8ldthy = {
    generate: generate,
    getAt: getAt,
    findItem: findItem,
    filterItems: filterItems,
    justCells: justCells
  };

  var isSupported = function (dom) {
    return dom.style !== undefined;
  };
  var $_29xg1fmbjm8ldtil = { isSupported: isSupported };

  var internalSet = function (dom, property, value) {
    if (!isString(value)) {
      console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
      throw new Error('CSS value must be a string: ' + value);
    }
    if ($_29xg1fmbjm8ldtil.isSupported(dom))
      dom.style.setProperty(property, value);
  };
  var internalRemove = function (dom, property) {
    if ($_29xg1fmbjm8ldtil.isSupported(dom))
      dom.style.removeProperty(property);
  };
  var set$1 = function (element, property, value) {
    var dom = element.dom();
    internalSet(dom, property, value);
  };
  var setAll$1 = function (element, css) {
    var dom = element.dom();
    each$1(css, function (v, k) {
      internalSet(dom, k, v);
    });
  };
  var setOptions = function (element, css) {
    var dom = element.dom();
    each$1(css, function (v, k) {
      v.fold(function () {
        internalRemove(dom, k);
      }, function (value) {
        internalSet(dom, k, value);
      });
    });
  };
  var get$1 = function (element, property) {
    var dom = element.dom();
    var styles = window.getComputedStyle(dom);
    var r = styles.getPropertyValue(property);
    var v = r === '' && !$_3hsphum5jm8ldth8.inBody(element) ? getUnsafeProperty(dom, property) : r;
    return v === null ? undefined : v;
  };
  var getUnsafeProperty = function (dom, property) {
    return $_29xg1fmbjm8ldtil.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
  };
  var getRaw = function (element, property) {
    var dom = element.dom();
    var raw = getUnsafeProperty(dom, property);
    return Option.from(raw).filter(function (r) {
      return r.length > 0;
    });
  };
  var getAllRaw = function (element) {
    var css = {};
    var dom = element.dom();
    if ($_29xg1fmbjm8ldtil.isSupported(dom)) {
      for (var i = 0; i < dom.style.length; i++) {
        var ruleName = dom.style.item(i);
        css[ruleName] = dom.style[ruleName];
      }
    }
    return css;
  };
  var isValidValue = function (tag, property, value) {
    var element = Element$$1.fromTag(tag);
    set$1(element, property, value);
    var style = getRaw(element, property);
    return style.isSome();
  };
  var remove$1 = function (element, property) {
    var dom = element.dom();
    internalRemove(dom, property);
    if ($_dz8wvwm1jm8ldtgt.has(element, 'style') && trim($_dz8wvwm1jm8ldtgt.get(element, 'style')) === '') {
      $_dz8wvwm1jm8ldtgt.remove(element, 'style');
    }
  };
  var preserve = function (element, f) {
    var oldStyles = $_dz8wvwm1jm8ldtgt.get(element, 'style');
    var result = f(element);
    var restore = oldStyles === undefined ? $_dz8wvwm1jm8ldtgt.remove : $_dz8wvwm1jm8ldtgt.set;
    restore(element, 'style', oldStyles);
    return result;
  };
  var copy = function (source, target) {
    var sourceDom = source.dom();
    var targetDom = target.dom();
    if ($_29xg1fmbjm8ldtil.isSupported(sourceDom) && $_29xg1fmbjm8ldtil.isSupported(targetDom)) {
      targetDom.style.cssText = sourceDom.style.cssText;
    }
  };
  var reflow = function (e) {
    return e.dom().offsetWidth;
  };
  var transferOne$1 = function (source, destination, style) {
    getRaw(source, style).each(function (value) {
      if (getRaw(destination, style).isNone())
        set$1(destination, style, value);
    });
  };
  var transfer$1 = function (source, destination, styles) {
    if (!$_aq9fg3m2jm8ldth1.isElement(source) || !$_aq9fg3m2jm8ldth1.isElement(destination))
      return;
    each(styles, function (style) {
      transferOne$1(source, destination, style);
    });
  };
  var $_dr5b9omajm8ldti8 = {
    copy: copy,
    set: set$1,
    preserve: preserve,
    setAll: setAll$1,
    setOptions: setOptions,
    remove: remove$1,
    get: get$1,
    getRaw: getRaw,
    getAllRaw: getAllRaw,
    isValidValue: isValidValue,
    reflow: reflow,
    transfer: transfer$1
  };

  var before = function (marker, element) {
    var parent = $_8mc5g7lijm8ldtev.parent(marker);
    parent.each(function (v) {
      v.dom().insertBefore(element.dom(), marker.dom());
    });
  };
  var after = function (marker, element) {
    var sibling = $_8mc5g7lijm8ldtev.nextSibling(marker);
    sibling.fold(function () {
      var parent = $_8mc5g7lijm8ldtev.parent(marker);
      parent.each(function (v) {
        append(v, element);
      });
    }, function (v) {
      before(v, element);
    });
  };
  var prepend = function (parent, element) {
    var firstChild = $_8mc5g7lijm8ldtev.firstChild(parent);
    firstChild.fold(function () {
      append(parent, element);
    }, function (v) {
      parent.dom().insertBefore(element.dom(), v.dom());
    });
  };
  var append = function (parent, element) {
    parent.dom().appendChild(element.dom());
  };
  var appendAt = function (parent, element, index) {
    $_8mc5g7lijm8ldtev.child(parent, index).fold(function () {
      append(parent, element);
    }, function (v) {
      before(v, element);
    });
  };
  var wrap = function (element, wrapper) {
    before(element, wrapper);
    append(wrapper, element);
  };
  var $_a4o6jqmcjm8ldtin = {
    before: before,
    after: after,
    prepend: prepend,
    append: append,
    appendAt: appendAt,
    wrap: wrap
  };

  var before$1 = function (marker, elements) {
    each(elements, function (x) {
      $_a4o6jqmcjm8ldtin.before(marker, x);
    });
  };
  var after$1 = function (marker, elements) {
    each(elements, function (x, i) {
      var e = i === 0 ? marker : elements[i - 1];
      $_a4o6jqmcjm8ldtin.after(e, x);
    });
  };
  var prepend$1 = function (parent, elements) {
    each(elements.slice().reverse(), function (x) {
      $_a4o6jqmcjm8ldtin.prepend(parent, x);
    });
  };
  var append$1 = function (parent, elements) {
    each(elements, function (x) {
      $_a4o6jqmcjm8ldtin.append(parent, x);
    });
  };
  var $_6j2l8wmejm8ldtis = {
    before: before$1,
    after: after$1,
    prepend: prepend$1,
    append: append$1
  };

  var empty = function (element) {
    element.dom().textContent = '';
    each($_8mc5g7lijm8ldtev.children(element), function (rogue) {
      remove$2(rogue);
    });
  };
  var remove$2 = function (element) {
    var dom = element.dom();
    if (dom.parentNode !== null)
      dom.parentNode.removeChild(dom);
  };
  var unwrap = function (wrapper) {
    var children = $_8mc5g7lijm8ldtev.children(wrapper);
    if (children.length > 0)
      $_6j2l8wmejm8ldtis.before(wrapper, children);
    remove$2(wrapper);
  };
  var $_dpqucgmdjm8ldtio = {
    empty: empty,
    remove: remove$2,
    unwrap: unwrap
  };

  var stats = Immutable('minRow', 'minCol', 'maxRow', 'maxCol');
  var findSelectedStats = function (house, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    var minRow = totalRows;
    var minCol = totalColumns;
    var maxRow = 0;
    var maxCol = 0;
    each$1(house.access(), function (detail) {
      if (isSelected(detail)) {
        var startRow = detail.row();
        var endRow = startRow + detail.rowspan() - 1;
        var startCol = detail.column();
        var endCol = startCol + detail.colspan() - 1;
        if (startRow < minRow)
          minRow = startRow;
        else if (endRow > maxRow)
          maxRow = endRow;
        if (startCol < minCol)
          minCol = startCol;
        else if (endCol > maxCol)
          maxCol = endCol;
      }
    });
    return stats(minRow, minCol, maxRow, maxCol);
  };
  var makeCell = function (list, seenSelected, rowIndex) {
    var row = list[rowIndex].element();
    var td = Element$$1.fromTag('td');
    $_a4o6jqmcjm8ldtin.append(td, Element$$1.fromTag('br'));
    var f = seenSelected ? $_a4o6jqmcjm8ldtin.append : $_a4o6jqmcjm8ldtin.prepend;
    f(row, td);
  };
  var fillInGaps = function (list, house, stats, isSelected) {
    var totalColumns = house.grid().columns();
    var totalRows = house.grid().rows();
    for (var i = 0; i < totalRows; i++) {
      var seenSelected = false;
      for (var j = 0; j < totalColumns; j++) {
        if (!(i < stats.minRow() || i > stats.maxRow() || j < stats.minCol() || j > stats.maxCol())) {
          var needCell = $_fciyglm9jm8ldthy.getAt(house, i, j).filter(isSelected).isNone();
          if (needCell)
            makeCell(list, seenSelected, i);
          else
            seenSelected = true;
        }
      }
    }
  };
  var clean = function (table, stats) {
    var emptyRows = filter($_a8kcl6ldjm8ldtdv.firstLayer(table, 'tr'), function (row) {
      return row.dom().childElementCount === 0;
    });
    each(emptyRows, $_dpqucgmdjm8ldtio.remove);
    if (stats.minCol() === stats.maxCol() || stats.minRow() === stats.maxRow()) {
      each($_a8kcl6ldjm8ldtdv.firstLayer(table, 'th,td'), function (cell) {
        $_dz8wvwm1jm8ldtgt.remove(cell, 'rowspan');
        $_dz8wvwm1jm8ldtgt.remove(cell, 'colspan');
      });
    }
    $_dz8wvwm1jm8ldtgt.remove(table, 'width');
    $_dz8wvwm1jm8ldtgt.remove(table, 'height');
    $_dr5b9omajm8ldti8.remove(table, 'width');
    $_dr5b9omajm8ldti8.remove(table, 'height');
  };
  var extract = function (table, selectedSelector) {
    var isSelected = function (detail) {
      return $_eqepc2lejm8ldte5.is(detail.element(), selectedSelector);
    };
    var list = $_act3unlajm8ldtcq.fromTable(table);
    var house = $_fciyglm9jm8ldthy.generate(list);
    var stats = findSelectedStats(house, isSelected);
    var selector = 'th:not(' + selectedSelector + ')' + ',td:not(' + selectedSelector + ')';
    var unselectedCells = $_a8kcl6ldjm8ldtdv.filterFirstLayer(table, 'th,td', function (cell) {
      return $_eqepc2lejm8ldte5.is(cell, selector);
    });
    each(unselectedCells, $_dpqucgmdjm8ldtio.remove);
    fillInGaps(list, house, stats, isSelected);
    clean(table, stats);
    return table;
  };
  var $_bu9dp5l4jm8ldtbx = { extract: extract };

  var clone$1 = function (original, deep) {
    return Element$$1.fromDom(original.dom().cloneNode(deep));
  };
  var shallow = function (original) {
    return clone$1(original, false);
  };
  var deep = function (original) {
    return clone$1(original, true);
  };
  var shallowAs = function (original, tag) {
    var nu = Element$$1.fromTag(tag);
    var attributes = $_dz8wvwm1jm8ldtgt.clone(original);
    $_dz8wvwm1jm8ldtgt.setAll(nu, attributes);
    return nu;
  };
  var copy$1 = function (original, tag) {
    var nu = shallowAs(original, tag);
    var cloneChildren = $_8mc5g7lijm8ldtev.children(deep(original));
    $_6j2l8wmejm8ldtis.append(nu, cloneChildren);
    return nu;
  };
  var mutate = function (original, tag) {
    var nu = shallowAs(original, tag);
    $_a4o6jqmcjm8ldtin.before(original, nu);
    var children = $_8mc5g7lijm8ldtev.children(original);
    $_6j2l8wmejm8ldtis.append(nu, children);
    $_dpqucgmdjm8ldtio.remove(original);
    return nu;
  };
  var $_ezthd0mgjm8ldtjq = {
    shallow: shallow,
    shallowAs: shallowAs,
    deep: deep,
    copy: copy$1,
    mutate: mutate
  };

  function NodeValue (is, name) {
    var get = function (element) {
      if (!is(element))
        throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
      return getOption(element).getOr('');
    };
    var getOptionIE10 = function (element) {
      try {
        return getOptionSafe(element);
      } catch (e) {
        return Option.none();
      }
    };
    var getOptionSafe = function (element) {
      return is(element) ? Option.from(element.dom().nodeValue) : Option.none();
    };
    var browser = $_cpch3zlpjm8ldtfu.detect().browser;
    var getOption = browser.isIE() && browser.version.major === 10 ? getOptionIE10 : getOptionSafe;
    var set = function (element, value) {
      if (!is(element))
        throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
      element.dom().nodeValue = value;
    };
    return {
      get: get,
      getOption: getOption,
      set: set
    };
  }

  var api = NodeValue($_aq9fg3m2jm8ldth1.isText, 'text');
  var get$2 = function (element) {
    return api.get(element);
  };
  var getOption = function (element) {
    return api.getOption(element);
  };
  var set$2 = function (element, value) {
    api.set(element, value);
  };
  var $_7dj7zlmjjm8ldtk1 = {
    get: get$2,
    getOption: getOption,
    set: set$2
  };

  var getEnd = function (element) {
    return $_aq9fg3m2jm8ldth1.name(element) === 'img' ? 1 : $_7dj7zlmjjm8ldtk1.getOption(element).fold(function () {
      return $_8mc5g7lijm8ldtev.children(element).length;
    }, function (v) {
      return v.length;
    });
  };
  var isEnd = function (element, offset) {
    return getEnd(element) === offset;
  };
  var isStart = function (element, offset) {
    return offset === 0;
  };
  var NBSP = '\xA0';
  var isTextNodeWithCursorPosition = function (el) {
    return $_7dj7zlmjjm8ldtk1.getOption(el).filter(function (text) {
      return text.trim().length !== 0 || text.indexOf(NBSP) > -1;
    }).isSome();
  };
  var elementsWithCursorPosition = [
    'img',
    'br'
  ];
  var isCursorPosition = function (elem) {
    var hasCursorPosition = isTextNodeWithCursorPosition(elem);
    return hasCursorPosition || contains(elementsWithCursorPosition, $_aq9fg3m2jm8ldth1.name(elem));
  };
  var $_cz58icmijm8ldtjy = {
    getEnd: getEnd,
    isEnd: isEnd,
    isStart: isStart,
    isCursorPosition: isCursorPosition
  };

  var first$3 = function (element) {
    return $_4sg7f1m7jm8ldthh.descendant(element, $_cz58icmijm8ldtjy.isCursorPosition);
  };
  var last$2 = function (element) {
    return descendantRtl(element, $_cz58icmijm8ldtjy.isCursorPosition);
  };
  var descendantRtl = function (scope, predicate) {
    var descend = function (element) {
      var children = $_8mc5g7lijm8ldtev.children(element);
      for (var i = children.length - 1; i >= 0; i--) {
        var child = children[i];
        if (predicate(child))
          return Option.some(child);
        var res = descend(child);
        if (res.isSome())
          return res;
      }
      return Option.none();
    };
    return descend(scope);
  };
  var $_hxrvqmhjm8ldtjt = {
    first: first$3,
    last: last$2
  };

  var cell$1 = function () {
    var td = Element$$1.fromTag('td');
    $_a4o6jqmcjm8ldtin.append(td, Element$$1.fromTag('br'));
    return td;
  };
  var replace = function (cell, tag, attrs) {
    var replica = $_ezthd0mgjm8ldtjq.copy(cell, tag);
    each$1(attrs, function (v, k) {
      if (v === null)
        $_dz8wvwm1jm8ldtgt.remove(replica, k);
      else
        $_dz8wvwm1jm8ldtgt.set(replica, k, v);
    });
    return replica;
  };
  var pasteReplace = function (cellContent) {
    return cellContent;
  };
  var newRow = function (doc) {
    return function () {
      return Element$$1.fromTag('tr', doc.dom());
    };
  };
  var cloneFormats = function (oldCell, newCell, formats) {
    var first = $_hxrvqmhjm8ldtjt.first(oldCell);
    return first.map(function (firstText) {
      var formatSelector = formats.join(',');
      var parents = $_emvpc1m3jm8ldth3.ancestors(firstText, formatSelector, function (element) {
        return $_ak7uzflkjm8ldtfb.eq(element, oldCell);
      });
      return foldr(parents, function (last$$1, parent) {
        var clonedFormat = $_ezthd0mgjm8ldtjq.shallow(parent);
        $_dz8wvwm1jm8ldtgt.remove(clonedFormat, 'contenteditable');
        $_a4o6jqmcjm8ldtin.append(last$$1, clonedFormat);
        return clonedFormat;
      }, newCell);
    }).getOr(newCell);
  };
  var cellOperations = function (mutate, doc, formatsToClone) {
    var newCell = function (prev) {
      var doc = $_8mc5g7lijm8ldtev.owner(prev.element());
      var td = Element$$1.fromTag($_aq9fg3m2jm8ldth1.name(prev.element()), doc.dom());
      var formats = formatsToClone.getOr([
        'strong',
        'em',
        'b',
        'i',
        'span',
        'font',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div'
      ]);
      var lastNode = formats.length > 0 ? cloneFormats(prev.element(), td, formats) : td;
      $_a4o6jqmcjm8ldtin.append(lastNode, Element$$1.fromTag('br'));
      $_dr5b9omajm8ldti8.copy(prev.element(), td);
      $_dr5b9omajm8ldti8.remove(td, 'height');
      if (prev.colspan() !== 1)
        $_dr5b9omajm8ldti8.remove(prev.element(), 'width');
      mutate(prev.element(), td);
      return td;
    };
    return {
      row: newRow(doc),
      cell: newCell,
      replace: replace,
      gap: cell$1
    };
  };
  var paste = function (doc) {
    return {
      row: newRow(doc),
      cell: cell$1,
      replace: pasteReplace,
      gap: cell$1
    };
  };
  var $_6bcmk9mfjm8ldtiw = {
    cellOperations: cellOperations,
    paste: paste
  };

  var fromHtml$1 = function (html, scope) {
    var doc = scope || document;
    var div = doc.createElement('div');
    div.innerHTML = html;
    return $_8mc5g7lijm8ldtev.children(Element$$1.fromDom(div));
  };
  var fromTags = function (tags, scope) {
    return map(tags, function (x) {
      return Element$$1.fromTag(x, scope);
    });
  };
  var fromText$1 = function (texts, scope) {
    return map(texts, function (x) {
      return Element$$1.fromText(x, scope);
    });
  };
  var fromDom$1 = function (nodes) {
    return map(nodes, Element$$1.fromDom);
  };
  var $_ai53jzmljm8ldtk8 = {
    fromHtml: fromHtml$1,
    fromTags: fromTags,
    fromText: fromText$1,
    fromDom: fromDom$1
  };

  var TagBoundaries = [
    'body',
    'p',
    'div',
    'article',
    'aside',
    'figcaption',
    'figure',
    'footer',
    'header',
    'nav',
    'section',
    'ol',
    'ul',
    'li',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'caption',
    'tr',
    'td',
    'th',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'address'
  ];

  function DomUniverse () {
    var clone = function (element) {
      return Element$$1.fromDom(element.dom().cloneNode(false));
    };
    var isBoundary = function (element) {
      if (!$_aq9fg3m2jm8ldth1.isElement(element))
        return false;
      if ($_aq9fg3m2jm8ldth1.name(element) === 'body')
        return true;
      return contains(TagBoundaries, $_aq9fg3m2jm8ldth1.name(element));
    };
    var isEmptyTag = function (element) {
      if (!$_aq9fg3m2jm8ldth1.isElement(element))
        return false;
      return contains([
        'br',
        'img',
        'hr',
        'input'
      ], $_aq9fg3m2jm8ldth1.name(element));
    };
    var comparePosition = function (element, other) {
      return element.dom().compareDocumentPosition(other.dom());
    };
    var copyAttributesTo = function (source, destination) {
      var as = $_dz8wvwm1jm8ldtgt.clone(source);
      $_dz8wvwm1jm8ldtgt.setAll(destination, as);
    };
    return {
      up: constant({
        selector: $_6mmdzsm6jm8ldthg.ancestor,
        closest: $_6mmdzsm6jm8ldthg.closest,
        predicate: $_4sg7f1m7jm8ldthh.ancestor,
        all: $_8mc5g7lijm8ldtev.parents
      }),
      down: constant({
        selector: $_emvpc1m3jm8ldth3.descendants,
        predicate: $_vs38qm4jm8ldth4.descendants
      }),
      styles: constant({
        get: $_dr5b9omajm8ldti8.get,
        getRaw: $_dr5b9omajm8ldti8.getRaw,
        set: $_dr5b9omajm8ldti8.set,
        remove: $_dr5b9omajm8ldti8.remove
      }),
      attrs: constant({
        get: $_dz8wvwm1jm8ldtgt.get,
        set: $_dz8wvwm1jm8ldtgt.set,
        remove: $_dz8wvwm1jm8ldtgt.remove,
        copyTo: copyAttributesTo
      }),
      insert: constant({
        before: $_a4o6jqmcjm8ldtin.before,
        after: $_a4o6jqmcjm8ldtin.after,
        afterAll: $_6j2l8wmejm8ldtis.after,
        append: $_a4o6jqmcjm8ldtin.append,
        appendAll: $_6j2l8wmejm8ldtis.append,
        prepend: $_a4o6jqmcjm8ldtin.prepend,
        wrap: $_a4o6jqmcjm8ldtin.wrap
      }),
      remove: constant({
        unwrap: $_dpqucgmdjm8ldtio.unwrap,
        remove: $_dpqucgmdjm8ldtio.remove
      }),
      create: constant({
        nu: Element$$1.fromTag,
        clone: clone,
        text: Element$$1.fromText
      }),
      query: constant({
        comparePosition: comparePosition,
        prevSibling: $_8mc5g7lijm8ldtev.prevSibling,
        nextSibling: $_8mc5g7lijm8ldtev.nextSibling
      }),
      property: constant({
        children: $_8mc5g7lijm8ldtev.children,
        name: $_aq9fg3m2jm8ldth1.name,
        parent: $_8mc5g7lijm8ldtev.parent,
        isText: $_aq9fg3m2jm8ldth1.isText,
        isComment: $_aq9fg3m2jm8ldth1.isComment,
        isElement: $_aq9fg3m2jm8ldth1.isElement,
        getText: $_7dj7zlmjjm8ldtk1.get,
        setText: $_7dj7zlmjjm8ldtk1.set,
        isBoundary: isBoundary,
        isEmptyTag: isEmptyTag
      }),
      eq: $_ak7uzflkjm8ldtfb.eq,
      is: $_ak7uzflkjm8ldtfb.is
    };
  }

  var leftRight = Immutable('left', 'right');
  var bisect = function (universe, parent, child) {
    var children = universe.property().children(parent);
    var index = findIndex(children, curry(universe.eq, child));
    return index.map(function (ind) {
      return {
        before: constant(children.slice(0, ind)),
        after: constant(children.slice(ind + 1))
      };
    });
  };
  var breakToRight = function (universe, parent, child) {
    return bisect(universe, parent, child).map(function (parts) {
      var second = universe.create().clone(parent);
      universe.insert().appendAll(second, parts.after());
      universe.insert().after(parent, second);
      return leftRight(parent, second);
    });
  };
  var breakToLeft = function (universe, parent, child) {
    return bisect(universe, parent, child).map(function (parts) {
      var prior = universe.create().clone(parent);
      universe.insert().appendAll(prior, parts.before().concat([child]));
      universe.insert().appendAll(parent, parts.after());
      universe.insert().before(parent, prior);
      return leftRight(prior, parent);
    });
  };
  var breakPath = function (universe, item, isTop, breaker) {
    var result = Immutable('first', 'second', 'splits');
    var next = function (child, group, splits) {
      var fallback = result(child, Option.none(), splits);
      if (isTop(child))
        return result(child, group, splits);
      else {
        return universe.property().parent(child).bind(function (parent) {
          return breaker(universe, parent, child).map(function (breakage) {
            var extra = [{
                first: breakage.left,
                second: breakage.right
              }];
            var nextChild = isTop(parent) ? parent : breakage.left();
            return next(nextChild, Option.some(breakage.right()), splits.concat(extra));
          }).getOr(fallback);
        });
      }
    };
    return next(item, Option.none(), []);
  };
  var $_9ryt4mujm8ldtnf = {
    breakToLeft: breakToLeft,
    breakToRight: breakToRight,
    breakPath: breakPath
  };

  var all$3 = function (universe, look, elements, f) {
    var head$$1 = elements[0];
    var tail = elements.slice(1);
    return f(universe, look, head$$1, tail);
  };
  var oneAll = function (universe, look, elements) {
    return elements.length > 0 ? all$3(universe, look, elements, unsafeOne) : Option.none();
  };
  var unsafeOne = function (universe, look, head$$1, tail) {
    var start = look(universe, head$$1);
    return foldr(tail, function (b, a) {
      var current = look(universe, a);
      return commonElement(universe, b, current);
    }, start);
  };
  var commonElement = function (universe, start, end) {
    return start.bind(function (s) {
      return end.filter(curry(universe.eq, s));
    });
  };
  var $_gd0vi1mvjm8ldtnr = { oneAll: oneAll };

  var eq$1 = function (universe, item) {
    return curry(universe.eq, item);
  };
  var unsafeSubset = function (universe, common, ps1, ps2) {
    var children = universe.property().children(common);
    if (universe.eq(common, ps1[0]))
      return Option.some([ps1[0]]);
    if (universe.eq(common, ps2[0]))
      return Option.some([ps2[0]]);
    var finder = function (ps) {
      var topDown = reverse(ps);
      var index = findIndex(topDown, eq$1(universe, common)).getOr(-1);
      var item = index < topDown.length - 1 ? topDown[index + 1] : topDown[index];
      return findIndex(children, eq$1(universe, item));
    };
    var startIndex = finder(ps1);
    var endIndex = finder(ps2);
    return startIndex.bind(function (sIndex) {
      return endIndex.map(function (eIndex) {
        var first = Math.min(sIndex, eIndex);
        var last$$1 = Math.max(sIndex, eIndex);
        return children.slice(first, last$$1 + 1);
      });
    });
  };
  var ancestors$2 = function (universe, start, end, _isRoot) {
    var isRoot = _isRoot !== undefined ? _isRoot : constant(false);
    var ps1 = [start].concat(universe.up().all(start));
    var ps2 = [end].concat(universe.up().all(end));
    var prune = function (path) {
      var index = findIndex(path, isRoot);
      return index.fold(function () {
        return path;
      }, function (ind) {
        return path.slice(0, ind + 1);
      });
    };
    var pruned1 = prune(ps1);
    var pruned2 = prune(ps2);
    var shared = find(pruned1, function (x) {
      return exists(pruned2, eq$1(universe, x));
    });
    return {
      firstpath: constant(pruned1),
      secondpath: constant(pruned2),
      shared: constant(shared)
    };
  };
  var subset = function (universe, start, end) {
    var ancs = ancestors$2(universe, start, end);
    return ancs.shared().bind(function (shared) {
      return unsafeSubset(universe, shared, ancs.firstpath(), ancs.secondpath());
    });
  };
  var $_bmu7nomwjm8ldto3 = {
    subset: subset,
    ancestors: ancestors$2
  };

  var sharedOne = function (universe, look, elements) {
    return $_gd0vi1mvjm8ldtnr.oneAll(universe, look, elements);
  };
  var subset$1 = function (universe, start, finish) {
    return $_bmu7nomwjm8ldto3.subset(universe, start, finish);
  };
  var ancestors$3 = function (universe, start, finish, _isRoot) {
    return $_bmu7nomwjm8ldto3.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft$1 = function (universe, parent, child) {
    return $_9ryt4mujm8ldtnf.breakToLeft(universe, parent, child);
  };
  var breakToRight$1 = function (universe, parent, child) {
    return $_9ryt4mujm8ldtnf.breakToRight(universe, parent, child);
  };
  var breakPath$1 = function (universe, child, isTop, breaker) {
    return $_9ryt4mujm8ldtnf.breakPath(universe, child, isTop, breaker);
  };
  var $_5ekk1smtjm8ldtnc = {
    sharedOne: sharedOne,
    subset: subset$1,
    ancestors: ancestors$3,
    breakToLeft: breakToLeft$1,
    breakToRight: breakToRight$1,
    breakPath: breakPath$1
  };

  var universe = DomUniverse();
  var sharedOne$1 = function (look, elements) {
    return $_5ekk1smtjm8ldtnc.sharedOne(universe, function (universe, element) {
      return look(element);
    }, elements);
  };
  var subset$2 = function (start, finish) {
    return $_5ekk1smtjm8ldtnc.subset(universe, start, finish);
  };
  var ancestors$4 = function (start, finish, _isRoot) {
    return $_5ekk1smtjm8ldtnc.ancestors(universe, start, finish, _isRoot);
  };
  var breakToLeft$2 = function (parent, child) {
    return $_5ekk1smtjm8ldtnc.breakToLeft(universe, parent, child);
  };
  var breakToRight$2 = function (parent, child) {
    return $_5ekk1smtjm8ldtnc.breakToRight(universe, parent, child);
  };
  var breakPath$2 = function (child, isTop, breaker) {
    return $_5ekk1smtjm8ldtnc.breakPath(universe, child, isTop, function (u, p, c) {
      return breaker(p, c);
    });
  };
  var $_g6vmhymqjm8ldtlz = {
    sharedOne: sharedOne$1,
    subset: subset$2,
    ancestors: ancestors$4,
    breakToLeft: breakToLeft$2,
    breakToRight: breakToRight$2,
    breakPath: breakPath$2
  };

  var inSelection = function (bounds, detail) {
    var leftEdge = detail.column();
    var rightEdge = detail.column() + detail.colspan() - 1;
    var topEdge = detail.row();
    var bottomEdge = detail.row() + detail.rowspan() - 1;
    return leftEdge <= bounds.finishCol() && rightEdge >= bounds.startCol() && (topEdge <= bounds.finishRow() && bottomEdge >= bounds.startRow());
  };
  var isWithin = function (bounds, detail) {
    return detail.column() >= bounds.startCol() && detail.column() + detail.colspan() - 1 <= bounds.finishCol() && detail.row() >= bounds.startRow() && detail.row() + detail.rowspan() - 1 <= bounds.finishRow();
  };
  var isRectangular = function (warehouse, bounds) {
    var isRect = true;
    var detailIsWithin = curry(isWithin, bounds);
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        isRect = isRect && $_fciyglm9jm8ldthy.getAt(warehouse, i, j).exists(detailIsWithin);
      }
    }
    return isRect ? Option.some(bounds) : Option.none();
  };
  var $_61r62smzjm8ldtoq = {
    inSelection: inSelection,
    isWithin: isWithin,
    isRectangular: isRectangular
  };

  var getBounds = function (detailA, detailB) {
    return $_18gj1tlbjm8ldtd1.bounds(Math.min(detailA.row(), detailB.row()), Math.min(detailA.column(), detailB.column()), Math.max(detailA.row() + detailA.rowspan() - 1, detailB.row() + detailB.rowspan() - 1), Math.max(detailA.column() + detailA.colspan() - 1, detailB.column() + detailB.colspan() - 1));
  };
  var getAnyBox = function (warehouse, startCell, finishCell) {
    var startCoords = $_fciyglm9jm8ldthy.findItem(warehouse, startCell, $_ak7uzflkjm8ldtfb.eq);
    var finishCoords = $_fciyglm9jm8ldthy.findItem(warehouse, finishCell, $_ak7uzflkjm8ldtfb.eq);
    return startCoords.bind(function (sc) {
      return finishCoords.map(function (fc) {
        return getBounds(sc, fc);
      });
    });
  };
  var getBox = function (warehouse, startCell, finishCell) {
    return getAnyBox(warehouse, startCell, finishCell).bind(function (bounds) {
      return $_61r62smzjm8ldtoq.isRectangular(warehouse, bounds);
    });
  };
  var $_6oe1v2n0jm8ldtow = {
    getAnyBox: getAnyBox,
    getBox: getBox
  };

  var moveBy = function (warehouse, cell, row, column) {
    return $_fciyglm9jm8ldthy.findItem(warehouse, cell, $_ak7uzflkjm8ldtfb.eq).bind(function (detail) {
      var startRow = row > 0 ? detail.row() + detail.rowspan() - 1 : detail.row();
      var startCol = column > 0 ? detail.column() + detail.colspan() - 1 : detail.column();
      var dest = $_fciyglm9jm8ldthy.getAt(warehouse, startRow + row, startCol + column);
      return dest.map(function (d) {
        return d.element();
      });
    });
  };
  var intercepts = function (warehouse, start, finish) {
    return $_6oe1v2n0jm8ldtow.getAnyBox(warehouse, start, finish).map(function (bounds) {
      var inside = $_fciyglm9jm8ldthy.filterItems(warehouse, curry($_61r62smzjm8ldtoq.inSelection, bounds));
      return map(inside, function (detail) {
        return detail.element();
      });
    });
  };
  var parentCell = function (warehouse, innerCell) {
    var isContainedBy = function (c1, c2) {
      return $_ak7uzflkjm8ldtfb.contains(c2, c1);
    };
    return $_fciyglm9jm8ldthy.findItem(warehouse, innerCell, isContainedBy).bind(function (detail) {
      return detail.element();
    });
  };
  var $_ctg1j8myjm8ldtoh = {
    moveBy: moveBy,
    intercepts: intercepts,
    parentCell: parentCell
  };

  var moveBy$1 = function (cell, deltaRow, deltaColumn) {
    return $_b4ktmplcjm8ldtd5.table(cell).bind(function (table) {
      var warehouse = getWarehouse(table);
      return $_ctg1j8myjm8ldtoh.moveBy(warehouse, cell, deltaRow, deltaColumn);
    });
  };
  var intercepts$1 = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_ctg1j8myjm8ldtoh.intercepts(warehouse, first, last);
  };
  var nestedIntercepts = function (table, first, firstTable, last, lastTable) {
    var warehouse = getWarehouse(table);
    var startCell = $_ak7uzflkjm8ldtfb.eq(table, firstTable) ? first : $_ctg1j8myjm8ldtoh.parentCell(warehouse, first);
    var lastCell = $_ak7uzflkjm8ldtfb.eq(table, lastTable) ? last : $_ctg1j8myjm8ldtoh.parentCell(warehouse, last);
    return $_ctg1j8myjm8ldtoh.intercepts(warehouse, startCell, lastCell);
  };
  var getBox$1 = function (table, first, last) {
    var warehouse = getWarehouse(table);
    return $_6oe1v2n0jm8ldtow.getBox(warehouse, first, last);
  };
  var getWarehouse = function (table) {
    var list = $_act3unlajm8ldtcq.fromTable(table);
    return $_fciyglm9jm8ldthy.generate(list);
  };
  var $_a6jvdmmxjm8ldtoc = {
    moveBy: moveBy$1,
    intercepts: intercepts$1,
    nestedIntercepts: nestedIntercepts,
    getBox: getBox$1
  };

  var lookupTable = function (container, isRoot) {
    return $_6mmdzsm6jm8ldthg.ancestor(container, 'table');
  };
  var identified = MixedBag([
    'boxes',
    'start',
    'finish'
  ], []);
  var identify = function (start, finish, isRoot) {
    var getIsRoot = function (rootTable) {
      return function (element) {
        return isRoot(element) || $_ak7uzflkjm8ldtfb.eq(element, rootTable);
      };
    };
    if ($_ak7uzflkjm8ldtfb.eq(start, finish)) {
      return Option.some(identified({
        boxes: Option.some([start]),
        start: start,
        finish: finish
      }));
    } else {
      return lookupTable(start, isRoot).bind(function (startTable) {
        return lookupTable(finish, isRoot).bind(function (finishTable) {
          if ($_ak7uzflkjm8ldtfb.eq(startTable, finishTable)) {
            return Option.some(identified({
              boxes: $_a6jvdmmxjm8ldtoc.intercepts(startTable, start, finish),
              start: start,
              finish: finish
            }));
          } else if ($_ak7uzflkjm8ldtfb.contains(startTable, finishTable)) {
            var ancestorCells = $_emvpc1m3jm8ldth3.ancestors(finish, 'td,th', getIsRoot(startTable));
            var finishCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : finish;
            return Option.some(identified({
              boxes: $_a6jvdmmxjm8ldtoc.nestedIntercepts(startTable, start, startTable, finish, finishTable),
              start: start,
              finish: finishCell
            }));
          } else if ($_ak7uzflkjm8ldtfb.contains(finishTable, startTable)) {
            var ancestorCells = $_emvpc1m3jm8ldth3.ancestors(start, 'td,th', getIsRoot(finishTable));
            var startCell = ancestorCells.length > 0 ? ancestorCells[ancestorCells.length - 1] : start;
            return Option.some(identified({
              boxes: $_a6jvdmmxjm8ldtoc.nestedIntercepts(finishTable, start, startTable, finish, finishTable),
              start: start,
              finish: startCell
            }));
          } else {
            return $_g6vmhymqjm8ldtlz.ancestors(start, finish).shared().bind(function (lca) {
              return $_6mmdzsm6jm8ldthg.closest(lca, 'table', isRoot).bind(function (lcaTable) {
                var finishAncestorCells = $_emvpc1m3jm8ldth3.ancestors(finish, 'td,th', getIsRoot(lcaTable));
                var finishCell = finishAncestorCells.length > 0 ? finishAncestorCells[finishAncestorCells.length - 1] : finish;
                var startAncestorCells = $_emvpc1m3jm8ldth3.ancestors(start, 'td,th', getIsRoot(lcaTable));
                var startCell = startAncestorCells.length > 0 ? startAncestorCells[startAncestorCells.length - 1] : start;
                return Option.some(identified({
                  boxes: $_a6jvdmmxjm8ldtoc.nestedIntercepts(lcaTable, start, startTable, finish, finishTable),
                  start: startCell,
                  finish: finishCell
                }));
              });
            });
          }
        });
      });
    }
  };
  var retrieve = function (container, selector) {
    var sels = $_emvpc1m3jm8ldth3.descendants(container, selector);
    return sels.length > 0 ? Option.some(sels) : Option.none();
  };
  var getLast = function (boxes, lastSelectedSelector) {
    return find(boxes, function (box) {
      return $_eqepc2lejm8ldte5.is(box, lastSelectedSelector);
    });
  };
  var getEdges = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_6mmdzsm6jm8ldthg.descendant(container, firstSelectedSelector).bind(function (first) {
      return $_6mmdzsm6jm8ldthg.descendant(container, lastSelectedSelector).bind(function (last$$1) {
        return $_g6vmhymqjm8ldtlz.sharedOne(lookupTable, [
          first,
          last$$1
        ]).map(function (tbl) {
          return {
            first: constant(first),
            last: constant(last$$1),
            table: constant(tbl)
          };
        });
      });
    });
  };
  var expandTo = function (finish, firstSelectedSelector) {
    return $_6mmdzsm6jm8ldthg.ancestor(finish, 'table').bind(function (table) {
      return $_6mmdzsm6jm8ldthg.descendant(table, firstSelectedSelector).bind(function (start) {
        return identify(start, finish).bind(function (identified) {
          return identified.boxes().map(function (boxes) {
            return {
              boxes: constant(boxes),
              start: constant(identified.start()),
              finish: constant(identified.finish())
            };
          });
        });
      });
    });
  };
  var shiftSelection = function (boxes, deltaRow, deltaColumn, firstSelectedSelector, lastSelectedSelector) {
    return getLast(boxes, lastSelectedSelector).bind(function (last$$1) {
      return $_a6jvdmmxjm8ldtoc.moveBy(last$$1, deltaRow, deltaColumn).bind(function (finish) {
        return expandTo(finish, firstSelectedSelector);
      });
    });
  };
  var $_fs2a9mmpjm8ldtl5 = {
    identify: identify,
    retrieve: retrieve,
    shiftSelection: shiftSelection,
    getEdges: getEdges
  };

  var retrieve$1 = function (container, selector) {
    return $_fs2a9mmpjm8ldtl5.retrieve(container, selector);
  };
  var retrieveBox = function (container, firstSelectedSelector, lastSelectedSelector) {
    return $_fs2a9mmpjm8ldtl5.getEdges(container, firstSelectedSelector, lastSelectedSelector).bind(function (edges) {
      var isRoot = function (ancestor) {
        return $_ak7uzflkjm8ldtfb.eq(container, ancestor);
      };
      var firstAncestor = $_6mmdzsm6jm8ldthg.ancestor(edges.first(), 'thead,tfoot,tbody,table', isRoot);
      var lastAncestor = $_6mmdzsm6jm8ldthg.ancestor(edges.last(), 'thead,tfoot,tbody,table', isRoot);
      return firstAncestor.bind(function (fA) {
        return lastAncestor.bind(function (lA) {
          return $_ak7uzflkjm8ldtfb.eq(fA, lA) ? $_a6jvdmmxjm8ldtoc.getBox(edges.table(), edges.first(), edges.last()) : Option.none();
        });
      });
    });
  };
  var $_focu8ymojm8ldtku = {
    retrieve: retrieve$1,
    retrieveBox: retrieveBox
  };

  var selected = 'data-mce-selected';
  var selectedSelector = 'td[' + selected + '],th[' + selected + ']';
  var attributeSelector = '[' + selected + ']';
  var firstSelected = 'data-mce-first-selected';
  var firstSelectedSelector = 'td[' + firstSelected + '],th[' + firstSelected + ']';
  var lastSelected = 'data-mce-last-selected';
  var lastSelectedSelector = 'td[' + lastSelected + '],th[' + lastSelected + ']';
  var $_4r0i1yn1jm8ldtp2 = {
    selected: constant(selected),
    selectedSelector: constant(selectedSelector),
    attributeSelector: constant(attributeSelector),
    firstSelected: constant(firstSelected),
    firstSelectedSelector: constant(firstSelectedSelector),
    lastSelected: constant(lastSelected),
    lastSelectedSelector: constant(lastSelectedSelector)
  };

  var generate$1 = function (cases) {
    if (!isArray(cases)) {
      throw new Error('cases must be an array');
    }
    if (cases.length === 0) {
      throw new Error('there must be at least one case');
    }
    var constructors = [];
    var adt = {};
    each(cases, function (acase, count) {
      var keys$$1 = keys(acase);
      if (keys$$1.length !== 1) {
        throw new Error('one and only one name per case');
      }
      var key = keys$$1[0];
      var value = acase[key];
      if (adt[key] !== undefined) {
        throw new Error('duplicate key detected:' + key);
      } else if (key === 'cata') {
        throw new Error('cannot have a case named cata (sorry)');
      } else if (!isArray(value)) {
        throw new Error('case arguments must be an array');
      }
      constructors.push(key);
      adt[key] = function () {
        var argLength = arguments.length;
        if (argLength !== value.length) {
          throw new Error('Wrong number of arguments to case ' + key + '. Expected ' + value.length + ' (' + value + '), got ' + argLength);
        }
        var args = new Array(argLength);
        for (var i = 0; i < args.length; i++)
          args[i] = arguments[i];
        var match = function (branches) {
          var branchKeys = keys(branches);
          if (constructors.length !== branchKeys.length) {
            throw new Error('Wrong number of arguments to match. Expected: ' + constructors.join(',') + '\nActual: ' + branchKeys.join(','));
          }
          var allReqd = forall(constructors, function (reqKey) {
            return contains(branchKeys, reqKey);
          });
          if (!allReqd)
            throw new Error('Not all branches were specified when using match. Specified: ' + branchKeys.join(', ') + '\nRequired: ' + constructors.join(', '));
          return branches[key].apply(null, args);
        };
        return {
          fold: function () {
            if (arguments.length !== cases.length) {
              throw new Error('Wrong number of arguments to fold. Expected ' + cases.length + ', got ' + arguments.length);
            }
            var target = arguments[count];
            return target.apply(null, args);
          },
          match: match,
          log: function (label) {
            console.log(label, {
              constructors: constructors,
              constructor: key,
              params: args
            });
          }
        };
      };
    });
    return adt;
  };
  var Adt = { generate: generate$1 };

  var type$1 = Adt.generate([
    { none: [] },
    { multiple: ['elements'] },
    { single: ['selection'] }
  ]);
  var cata = function (subject, onNone, onMultiple, onSingle) {
    return subject.fold(onNone, onMultiple, onSingle);
  };
  var $_9a98sin2jm8ldtp4 = {
    cata: cata,
    none: type$1.none,
    multiple: type$1.multiple,
    single: type$1.single
  };

  var selection = function (cell, selections) {
    return $_9a98sin2jm8ldtp4.cata(selections.get(), constant([]), identity, constant([cell]));
  };
  var unmergable = function (cell, selections) {
    var hasSpan = function (elem) {
      return $_dz8wvwm1jm8ldtgt.has(elem, 'rowspan') && parseInt($_dz8wvwm1jm8ldtgt.get(elem, 'rowspan'), 10) > 1 || $_dz8wvwm1jm8ldtgt.has(elem, 'colspan') && parseInt($_dz8wvwm1jm8ldtgt.get(elem, 'colspan'), 10) > 1;
    };
    var candidates = selection(cell, selections);
    return candidates.length > 0 && forall(candidates, hasSpan) ? Option.some(candidates) : Option.none();
  };
  var mergable = function (table, selections) {
    return $_9a98sin2jm8ldtp4.cata(selections.get(), Option.none, function (cells, _env) {
      if (cells.length === 0) {
        return Option.none();
      }
      return $_focu8ymojm8ldtku.retrieveBox(table, $_4r0i1yn1jm8ldtp2.firstSelectedSelector(), $_4r0i1yn1jm8ldtp2.lastSelectedSelector()).bind(function (bounds) {
        return cells.length > 1 ? Option.some({
          bounds: constant(bounds),
          cells: constant(cells)
        }) : Option.none();
      });
    }, Option.none);
  };
  var $_6b6lxmnjm8ldtki = {
    mergable: mergable,
    unmergable: unmergable,
    selection: selection
  };

  var noMenu = function (cell) {
    return {
      element: constant(cell),
      mergable: Option.none,
      unmergable: Option.none,
      selection: constant([cell])
    };
  };
  var forMenu = function (selections, table, cell) {
    return {
      element: constant(cell),
      mergable: constant($_6b6lxmnjm8ldtki.mergable(table, selections)),
      unmergable: constant($_6b6lxmnjm8ldtki.unmergable(cell, selections)),
      selection: constant($_6b6lxmnjm8ldtki.selection(cell, selections))
    };
  };
  var notCell$1 = function (element) {
    return noMenu(element);
  };
  var paste$1 = Immutable('element', 'clipboard', 'generators');
  var pasteRows = function (selections, table, cell, clipboard, generators) {
    return {
      element: constant(cell),
      mergable: Option.none,
      unmergable: Option.none,
      selection: constant($_6b6lxmnjm8ldtki.selection(cell, selections)),
      clipboard: constant(clipboard),
      generators: constant(generators)
    };
  };
  var $_8xltjimmjm8ldtkc = {
    noMenu: noMenu,
    forMenu: forMenu,
    notCell: notCell$1,
    paste: paste$1,
    pasteRows: pasteRows
  };

  var extractSelected = function (cells) {
    return $_b4ktmplcjm8ldtd5.table(cells[0]).map($_ezthd0mgjm8ldtjq.deep).map(function (replica) {
      return [$_bu9dp5l4jm8ldtbx.extract(replica, $_4r0i1yn1jm8ldtp2.attributeSelector())];
    });
  };
  var serializeElement = function (editor, elm) {
    return editor.selection.serializer.serialize(elm.dom(), {});
  };
  var registerEvents = function (editor, selections, actions, cellSelection) {
    editor.on('BeforeGetContent', function (e) {
      var multiCellContext = function (cells) {
        e.preventDefault();
        extractSelected(cells).each(function (elements) {
          e.content = map(elements, function (elm) {
            return serializeElement(editor, elm);
          }).join('');
        });
      };
      if (e.selection === true) {
        $_9a98sin2jm8ldtp4.cata(selections.get(), noop, multiCellContext, noop);
      }
    });
    editor.on('BeforeSetContent', function (e) {
      if (e.selection === true && e.paste === true) {
        var cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        cellOpt.each(function (domCell) {
          var cell = Element$$1.fromDom(domCell);
          var table = $_b4ktmplcjm8ldtd5.table(cell);
          table.bind(function (table) {
            var elements = filter($_ai53jzmljm8ldtk8.fromHtml(e.content), function (content) {
              return $_aq9fg3m2jm8ldth1.name(content) !== 'meta';
            });
            if (elements.length === 1 && $_aq9fg3m2jm8ldth1.name(elements[0]) === 'table') {
              e.preventDefault();
              var doc = Element$$1.fromDom(editor.getDoc());
              var generators = $_6bcmk9mfjm8ldtiw.paste(doc);
              var targets = $_8xltjimmjm8ldtkc.paste(cell, elements[0], generators);
              actions.pasteCells(table, targets).each(function (rng) {
                editor.selection.setRng(rng);
                editor.focus();
                cellSelection.clear(table);
              });
            }
          });
        });
      }
    });
  };
  var $_77gh87kzjm8ldtav = { registerEvents: registerEvents };

  function Dimension (name, getOffset) {
    var set = function (element, h) {
      if (!isNumber(h) && !h.match(/^[0-9]+$/))
        throw name + '.set accepts only positive integer values. Value was ' + h;
      var dom = element.dom();
      if ($_29xg1fmbjm8ldtil.isSupported(dom))
        dom.style[name] = h + 'px';
    };
    var get = function (element) {
      var r = getOffset(element);
      if (r <= 0 || r === null) {
        var css = $_dr5b9omajm8ldti8.get(element, name);
        return parseFloat(css) || 0;
      }
      return r;
    };
    var getOuter = get;
    var aggregate = function (element, properties) {
      return foldl(properties, function (acc, property) {
        var val = $_dr5b9omajm8ldti8.get(element, property);
        var value = val === undefined ? 0 : parseInt(val, 10);
        return isNaN(value) ? acc : acc + value;
      }, 0);
    };
    var max = function (element, value, properties) {
      var cumulativeInclusions = aggregate(element, properties);
      var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
      return absoluteMax;
    };
    return {
      set: set,
      get: get,
      getOuter: getOuter,
      aggregate: aggregate,
      max: max
    };
  }

  var api$1 = Dimension('height', function (element) {
    var dom = element.dom();
    return $_3hsphum5jm8ldth8.inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
  });
  var set$3 = function (element, h) {
    api$1.set(element, h);
  };
  var get$3 = function (element) {
    return api$1.get(element);
  };
  var getOuter = function (element) {
    return api$1.getOuter(element);
  };
  var setMax = function (element, value) {
    var inclusions = [
      'margin-top',
      'border-top-width',
      'padding-top',
      'padding-bottom',
      'border-bottom-width',
      'margin-bottom'
    ];
    var absMax = api$1.max(element, value, inclusions);
    $_dr5b9omajm8ldti8.set(element, 'max-height', absMax + 'px');
  };
  var $_axmf9nn8jm8ldtqy = {
    set: set$3,
    get: get$3,
    getOuter: getOuter,
    setMax: setMax
  };

  var api$2 = Dimension('width', function (element) {
    return element.dom().offsetWidth;
  });
  var set$4 = function (element, h) {
    api$2.set(element, h);
  };
  var get$4 = function (element) {
    return api$2.get(element);
  };
  var getOuter$1 = function (element) {
    return api$2.getOuter(element);
  };
  var setMax$1 = function (element, value) {
    var inclusions = [
      'margin-left',
      'border-left-width',
      'padding-left',
      'padding-right',
      'border-right-width',
      'margin-right'
    ];
    var absMax = api$2.max(element, value, inclusions);
    $_dr5b9omajm8ldti8.set(element, 'max-width', absMax + 'px');
  };
  var $_71wagvnajm8ldtr6 = {
    set: set$4,
    get: get$4,
    getOuter: getOuter$1,
    setMax: setMax$1
  };

  var platform = $_cpch3zlpjm8ldtfu.detect();
  var needManualCalc = function () {
    return platform.browser.isIE() || platform.browser.isEdge();
  };
  var toNumber = function (px, fallback) {
    var num = parseFloat(px);
    return isNaN(num) ? fallback : num;
  };
  var getProp = function (elm, name, fallback) {
    return toNumber($_dr5b9omajm8ldti8.get(elm, name), fallback);
  };
  var getCalculatedHeight = function (cell) {
    var paddingTop = getProp(cell, 'padding-top', 0);
    var paddingBottom = getProp(cell, 'padding-bottom', 0);
    var borderTop = getProp(cell, 'border-top-width', 0);
    var borderBottom = getProp(cell, 'border-bottom-width', 0);
    var height = cell.dom().getBoundingClientRect().height;
    var boxSizing = $_dr5b9omajm8ldti8.get(cell, 'box-sizing');
    var borders = borderTop + borderBottom;
    return boxSizing === 'border-box' ? height : height - paddingTop - paddingBottom - borders;
  };
  var getWidth = function (cell) {
    return getProp(cell, 'width', $_71wagvnajm8ldtr6.get(cell));
  };
  var getHeight = function (cell) {
    return needManualCalc() ? getCalculatedHeight(cell) : getProp(cell, 'height', $_axmf9nn8jm8ldtqy.get(cell));
  };
  var $_d0uismn7jm8ldtqn = {
    getWidth: getWidth,
    getHeight: getHeight
  };

  var genericSizeRegex = /(\d+(\.\d+)?)(\w|%)*/;
  var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  var pixelBasedSizeRegex = /(\d+(\.\d+)?)px|em/;
  var setPixelWidth = function (cell, amount) {
    $_dr5b9omajm8ldti8.set(cell, 'width', amount + 'px');
  };
  var setPercentageWidth = function (cell, amount) {
    $_dr5b9omajm8ldti8.set(cell, 'width', amount + '%');
  };
  var setHeight = function (cell, amount) {
    $_dr5b9omajm8ldti8.set(cell, 'height', amount + 'px');
  };
  var getHeightValue = function (cell) {
    return $_dr5b9omajm8ldti8.getRaw(cell, 'height').getOrThunk(function () {
      return $_d0uismn7jm8ldtqn.getHeight(cell) + 'px';
    });
  };
  var convert = function (cell, number, getter, setter) {
    var newSize = $_b4ktmplcjm8ldtd5.table(cell).map(function (table) {
      var total = getter(table);
      return Math.floor(number / 100 * total);
    }).getOr(number);
    setter(cell, newSize);
    return newSize;
  };
  var normalizePixelSize = function (value, cell, getter, setter) {
    var number = parseInt(value, 10);
    return endsWith(value, '%') && $_aq9fg3m2jm8ldth1.name(cell) !== 'table' ? convert(cell, number, getter, setter) : number;
  };
  var getTotalHeight = function (cell) {
    var value = getHeightValue(cell);
    if (!value)
      return $_axmf9nn8jm8ldtqy.get(cell);
    return normalizePixelSize(value, cell, $_axmf9nn8jm8ldtqy.get, setHeight);
  };
  var get$5 = function (cell, type, f) {
    var v = f(cell);
    var span = getSpan(cell, type);
    return v / span;
  };
  var getSpan = function (cell, type) {
    return $_dz8wvwm1jm8ldtgt.has(cell, type) ? parseInt($_dz8wvwm1jm8ldtgt.get(cell, type), 10) : 1;
  };
  var getRawWidth = function (element) {
    var cssWidth = $_dr5b9omajm8ldti8.getRaw(element, 'width');
    return cssWidth.fold(function () {
      return Option.from($_dz8wvwm1jm8ldtgt.get(element, 'width'));
    }, function (width) {
      return Option.some(width);
    });
  };
  var normalizePercentageWidth = function (cellWidth, tableSize) {
    return cellWidth / tableSize.pixelWidth() * 100;
  };
  var choosePercentageSize = function (element, width, tableSize) {
    if (percentageBasedSizeRegex.test(width)) {
      var percentMatch = percentageBasedSizeRegex.exec(width);
      return parseFloat(percentMatch[1]);
    } else {
      var intWidth = $_71wagvnajm8ldtr6.get(element);
      return normalizePercentageWidth(intWidth, tableSize);
    }
  };
  var getPercentageWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      var intWidth = $_71wagvnajm8ldtr6.get(cell);
      return normalizePercentageWidth(intWidth, tableSize);
    }, function (width) {
      return choosePercentageSize(cell, width, tableSize);
    });
  };
  var normalizePixelWidth = function (cellWidth, tableSize) {
    return cellWidth / 100 * tableSize.pixelWidth();
  };
  var choosePixelSize = function (element, width, tableSize) {
    if (pixelBasedSizeRegex.test(width)) {
      var pixelMatch = pixelBasedSizeRegex.exec(width);
      return parseInt(pixelMatch[1], 10);
    } else if (percentageBasedSizeRegex.test(width)) {
      var percentMatch = percentageBasedSizeRegex.exec(width);
      var floatWidth = parseFloat(percentMatch[1]);
      return normalizePixelWidth(floatWidth, tableSize);
    } else {
      return $_71wagvnajm8ldtr6.get(element);
    }
  };
  var getPixelWidth = function (cell, tableSize) {
    var width = getRawWidth(cell);
    return width.fold(function () {
      return $_71wagvnajm8ldtr6.get(cell);
    }, function (width) {
      return choosePixelSize(cell, width, tableSize);
    });
  };
  var getHeight$1 = function (cell) {
    return get$5(cell, 'rowspan', getTotalHeight);
  };
  var getGenericWidth = function (cell) {
    var width = getRawWidth(cell);
    return width.bind(function (width) {
      if (genericSizeRegex.test(width)) {
        var match = genericSizeRegex.exec(width);
        return Option.some({
          width: constant(match[1]),
          unit: constant(match[3])
        });
      } else {
        return Option.none();
      }
    });
  };
  var setGenericWidth = function (cell, amount, unit) {
    $_dr5b9omajm8ldti8.set(cell, 'width', amount + unit);
  };
  var $_4w6li5n6jm8ldtpz = {
    percentageBasedSizeRegex: constant(percentageBasedSizeRegex),
    pixelBasedSizeRegex: constant(pixelBasedSizeRegex),
    setPixelWidth: setPixelWidth,
    setPercentageWidth: setPercentageWidth,
    setHeight: setHeight,
    getPixelWidth: getPixelWidth,
    getPercentageWidth: getPercentageWidth,
    getGenericWidth: getGenericWidth,
    setGenericWidth: setGenericWidth,
    getHeight: getHeight$1,
    getRawWidth: getRawWidth
  };

  var halve = function (main, other) {
    var width = $_4w6li5n6jm8ldtpz.getGenericWidth(main);
    width.each(function (width) {
      var newWidth = width.width() / 2;
      $_4w6li5n6jm8ldtpz.setGenericWidth(main, newWidth, width.unit());
      $_4w6li5n6jm8ldtpz.setGenericWidth(other, newWidth, width.unit());
    });
  };
  var $_3dwhr6n5jm8ldtpv = { halve: halve };

  var attached = function (element, scope) {
    var doc = scope || Element$$1.fromDom(document.documentElement);
    return $_4sg7f1m7jm8ldthh.ancestor(element, curry($_ak7uzflkjm8ldtfb.eq, doc)).isSome();
  };
  var windowOf = function (element) {
    var dom = element.dom();
    if (dom === dom.window && element instanceof Window)
      return element;
    return $_aq9fg3m2jm8ldth1.isDocument(element) ? dom.defaultView || dom.parentWindow : null;
  };
  var $_4ue02pnfjm8ldtrs = {
    attached: attached,
    windowOf: windowOf
  };

  var r = function (left, top) {
    var translate = function (x, y) {
      return r(left + x, top + y);
    };
    return {
      left: constant(left),
      top: constant(top),
      translate: translate
    };
  };
  var Position = r;

  var boxPosition = function (dom) {
    var box = dom.getBoundingClientRect();
    return Position(box.left, box.top);
  };
  var firstDefinedOrZero = function (a, b) {
    return a !== undefined ? a : b !== undefined ? b : 0;
  };
  var absolute = function (element) {
    var doc = element.dom().ownerDocument;
    var body = doc.body;
    var win = $_4ue02pnfjm8ldtrs.windowOf(Element$$1.fromDom(doc));
    var html = doc.documentElement;
    var scrollTop = firstDefinedOrZero(win.pageYOffset, html.scrollTop);
    var scrollLeft = firstDefinedOrZero(win.pageXOffset, html.scrollLeft);
    var clientTop = firstDefinedOrZero(html.clientTop, body.clientTop);
    var clientLeft = firstDefinedOrZero(html.clientLeft, body.clientLeft);
    return viewport(element).translate(scrollLeft - clientLeft, scrollTop - clientTop);
  };
  var relative = function (element) {
    var dom = element.dom();
    return Position(dom.offsetLeft, dom.offsetTop);
  };
  var viewport = function (element) {
    var dom = element.dom();
    var doc = dom.ownerDocument;
    var body = doc.body;
    var html = Element$$1.fromDom(doc.documentElement);
    if (body === dom)
      return Position(body.offsetLeft, body.offsetTop);
    if (!$_4ue02pnfjm8ldtrs.attached(element, html))
      return Position(0, 0);
    return boxPosition(dom);
  };
  var $_9noskinejm8ldtrq = {
    absolute: absolute,
    relative: relative,
    viewport: viewport
  };

  var rowInfo = Immutable('row', 'y');
  var colInfo = Immutable('col', 'x');
  var rtlEdge = function (cell) {
    var pos = $_9noskinejm8ldtrq.absolute(cell);
    return pos.left() + $_71wagvnajm8ldtr6.getOuter(cell);
  };
  var ltrEdge = function (cell) {
    return $_9noskinejm8ldtrq.absolute(cell).left();
  };
  var getLeftEdge = function (index, cell) {
    return colInfo(index, ltrEdge(cell));
  };
  var getRightEdge = function (index, cell) {
    return colInfo(index, rtlEdge(cell));
  };
  var getTop = function (cell) {
    return $_9noskinejm8ldtrq.absolute(cell).top();
  };
  var getTopEdge = function (index, cell) {
    return rowInfo(index, getTop(cell));
  };
  var getBottomEdge = function (index, cell) {
    return rowInfo(index, getTop(cell) + $_axmf9nn8jm8ldtqy.getOuter(cell));
  };
  var findPositions = function (getInnerEdge, getOuterEdge, array) {
    if (array.length === 0)
      return [];
    var lines = map(array.slice(1), function (cellOption, index) {
      return cellOption.map(function (cell) {
        return getInnerEdge(index, cell);
      });
    });
    var lastLine = array[array.length - 1].map(function (cell) {
      return getOuterEdge(array.length - 1, cell);
    });
    return lines.concat([lastLine]);
  };
  var negate = function (step, _table) {
    return -step;
  };
  var height = {
    delta: identity,
    positions: curry(findPositions, getTopEdge, getBottomEdge),
    edge: getTop
  };
  var ltr = {
    delta: identity,
    edge: ltrEdge,
    positions: curry(findPositions, getLeftEdge, getRightEdge)
  };
  var rtl = {
    delta: negate,
    edge: rtlEdge,
    positions: curry(findPositions, getRightEdge, getLeftEdge)
  };
  var $_d945hsndjm8ldtrb = {
    height: height,
    rtl: rtl,
    ltr: ltr
  };

  var $_22rm18ncjm8ldtr9 = {
    ltr: $_d945hsndjm8ldtrb.ltr,
    rtl: $_d945hsndjm8ldtrb.rtl
  };

  function TableDirection (directionAt) {
    var auto = function (table) {
      return directionAt(table).isRtl() ? $_22rm18ncjm8ldtr9.rtl : $_22rm18ncjm8ldtr9.ltr;
    };
    var delta = function (amount, table) {
      return auto(table).delta(amount, table);
    };
    var positions = function (cols, table) {
      return auto(table).positions(cols, table);
    };
    var edge = function (cell) {
      return auto(cell).edge(cell);
    };
    return {
      delta: delta,
      edge: edge,
      positions: positions
    };
  }

  var getGridSize = function (table) {
    var input = $_act3unlajm8ldtcq.fromTable(table);
    var warehouse = $_fciyglm9jm8ldthy.generate(input);
    return warehouse.grid();
  };
  var $_8fee92nhjm8ldts0 = { getGridSize: getGridSize };

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

  var base = function (handleUnsupported, required) {
    return baseWith(handleUnsupported, required, {
      validate: isFunction,
      label: 'function'
    });
  };
  var baseWith = function (handleUnsupported, required, pred) {
    if (required.length === 0)
      throw new Error('You must specify at least one required field.');
    validateStrArr('required', required);
    checkDupes(required);
    return function (obj) {
      var keys$$1 = keys(obj);
      var allReqd = forall(required, function (req) {
        return contains(keys$$1, req);
      });
      if (!allReqd)
        reqMessage(required, keys$$1);
      handleUnsupported(required, keys$$1);
      var invalidKeys = filter(required, function (key) {
        return !pred.validate(obj[key], key);
      });
      if (invalidKeys.length > 0)
        invalidTypeMessage(invalidKeys, pred.label);
      return obj;
    };
  };
  var handleExact = function (required, keys$$1) {
    var unsupported = filter(keys$$1, function (key) {
      return !contains(required, key);
    });
    if (unsupported.length > 0)
      unsuppMessage(unsupported);
  };
  var exactly = function (required) {
    return base(handleExact, required);
  };

  var elementToData = function (element) {
    var colspan = $_dz8wvwm1jm8ldtgt.has(element, 'colspan') ? parseInt($_dz8wvwm1jm8ldtgt.get(element, 'colspan'), 10) : 1;
    var rowspan = $_dz8wvwm1jm8ldtgt.has(element, 'rowspan') ? parseInt($_dz8wvwm1jm8ldtgt.get(element, 'rowspan'), 10) : 1;
    return {
      element: constant(element),
      colspan: constant(colspan),
      rowspan: constant(rowspan)
    };
  };
  var modification = function (generators, _toData) {
    contract(generators);
    var position = Cell(Option.none());
    var toData = _toData !== undefined ? _toData : elementToData;
    var nu = function (data) {
      return generators.cell(data);
    };
    var nuFrom = function (element) {
      var data = toData(element);
      return nu(data);
    };
    var add = function (element) {
      var replacement = nuFrom(element);
      if (position.get().isNone())
        position.set(Option.some(replacement));
      recent = Option.some({
        item: element,
        replacement: replacement
      });
      return replacement;
    };
    var recent = Option.none();
    var getOrInit = function (element, comparator) {
      return recent.fold(function () {
        return add(element);
      }, function (p) {
        return comparator(element, p.item) ? p.replacement : add(element);
      });
    };
    return {
      getOrInit: getOrInit,
      cursor: position.get
    };
  };
  var transform = function (scope, tag) {
    return function (generators) {
      var position = Cell(Option.none());
      contract(generators);
      var list = [];
      var find$$1 = function (element, comparator) {
        return find(list, function (x) {
          return comparator(x.item, element);
        });
      };
      var makeNew = function (element) {
        var cell = generators.replace(element, tag, { scope: scope });
        list.push({
          item: element,
          sub: cell
        });
        if (position.get().isNone())
          position.set(Option.some(cell));
        return cell;
      };
      var replaceOrInit = function (element, comparator) {
        return find$$1(element, comparator).fold(function () {
          return makeNew(element);
        }, function (p) {
          return comparator(element, p.item) ? p.sub : makeNew(element);
        });
      };
      return {
        replaceOrInit: replaceOrInit,
        cursor: position.get
      };
    };
  };
  var merging = function (generators) {
    contract(generators);
    var position = Cell(Option.none());
    var combine = function (cell) {
      if (position.get().isNone())
        position.set(Option.some(cell));
      return function () {
        var raw = generators.cell({
          element: constant(cell),
          colspan: constant(1),
          rowspan: constant(1)
        });
        $_dr5b9omajm8ldti8.remove(raw, 'width');
        $_dr5b9omajm8ldti8.remove(cell, 'width');
        return raw;
      };
    };
    return {
      combine: combine,
      cursor: position.get
    };
  };
  var contract = exactly([
    'cell',
    'row',
    'replace',
    'gap'
  ]);
  var $_9f4flvnjjm8ldtso = {
    modification: modification,
    transform: transform,
    merging: merging
  };

  var blockList = [
    'body',
    'p',
    'div',
    'article',
    'aside',
    'figcaption',
    'figure',
    'footer',
    'header',
    'nav',
    'section',
    'ol',
    'ul',
    'table',
    'thead',
    'tfoot',
    'tbody',
    'caption',
    'tr',
    'td',
    'th',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'address'
  ];
  var isList = function (universe, item) {
    var tagName = universe.property().name(item);
    return contains([
      'ol',
      'ul'
    ], tagName);
  };
  var isBlock = function (universe, item) {
    var tagName = universe.property().name(item);
    return contains(blockList, tagName);
  };
  var isFormatting = function (universe, item) {
    var tagName = universe.property().name(item);
    return contains([
      'address',
      'pre',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isHeading = function (universe, item) {
    var tagName = universe.property().name(item);
    return contains([
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6'
    ], tagName);
  };
  var isContainer = function (universe, item) {
    return contains([
      'div',
      'li',
      'td',
      'th',
      'blockquote',
      'body',
      'caption'
    ], universe.property().name(item));
  };
  var isEmptyTag = function (universe, item) {
    return contains([
      'br',
      'img',
      'hr',
      'input'
    ], universe.property().name(item));
  };
  var isFrame = function (universe, item) {
    return universe.property().name(item) === 'iframe';
  };
  var isInline = function (universe, item) {
    return !(isBlock(universe, item) || isEmptyTag(universe, item)) && universe.property().name(item) !== 'li';
  };
  var $_dgywjtnojm8ldtu5 = {
    isBlock: isBlock,
    isList: isList,
    isFormatting: isFormatting,
    isHeading: isHeading,
    isContainer: isContainer,
    isEmptyTag: isEmptyTag,
    isFrame: isFrame,
    isInline: isInline
  };

  var universe$1 = DomUniverse();
  var isBlock$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isBlock(universe$1, element);
  };
  var isList$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isList(universe$1, element);
  };
  var isFormatting$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isFormatting(universe$1, element);
  };
  var isHeading$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isHeading(universe$1, element);
  };
  var isContainer$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isContainer(universe$1, element);
  };
  var isEmptyTag$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isEmptyTag(universe$1, element);
  };
  var isFrame$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isFrame(universe$1, element);
  };
  var isInline$1 = function (element) {
    return $_dgywjtnojm8ldtu5.isInline(universe$1, element);
  };
  var $_1lk27jnnjm8ldtu0 = {
    isBlock: isBlock$1,
    isList: isList$1,
    isFormatting: isFormatting$1,
    isHeading: isHeading$1,
    isContainer: isContainer$1,
    isEmptyTag: isEmptyTag$1,
    isFrame: isFrame$1,
    isInline: isInline$1
  };

  var merge = function (cells) {
    var isBr = function (el) {
      return $_aq9fg3m2jm8ldth1.name(el) === 'br';
    };
    var advancedBr = function (children) {
      return forall(children, function (c) {
        return isBr(c) || $_aq9fg3m2jm8ldth1.isText(c) && $_7dj7zlmjjm8ldtk1.get(c).trim().length === 0;
      });
    };
    var isListItem = function (el) {
      return $_aq9fg3m2jm8ldth1.name(el) === 'li' || $_4sg7f1m7jm8ldthh.ancestor(el, $_1lk27jnnjm8ldtu0.isList).isSome();
    };
    var siblingIsBlock = function (el) {
      return $_8mc5g7lijm8ldtev.nextSibling(el).map(function (rightSibling) {
        if ($_1lk27jnnjm8ldtu0.isBlock(rightSibling))
          return true;
        if ($_1lk27jnnjm8ldtu0.isEmptyTag(rightSibling)) {
          return $_aq9fg3m2jm8ldth1.name(rightSibling) === 'img' ? false : true;
        }
      }).getOr(false);
    };
    var markCell = function (cell) {
      return $_hxrvqmhjm8ldtjt.last(cell).bind(function (rightEdge) {
        var rightSiblingIsBlock = siblingIsBlock(rightEdge);
        return $_8mc5g7lijm8ldtev.parent(rightEdge).map(function (parent) {
          return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || $_1lk27jnnjm8ldtu0.isBlock(parent) && !$_ak7uzflkjm8ldtfb.eq(cell, parent) ? [] : [Element$$1.fromTag('br')];
        });
      }).getOr([]);
    };
    var markContent = function () {
      var content = bind(cells, function (cell) {
        var children = $_8mc5g7lijm8ldtev.children(cell);
        return advancedBr(children) ? [] : children.concat(markCell(cell));
      });
      return content.length === 0 ? [Element$$1.fromTag('br')] : content;
    };
    var contents = markContent();
    $_dpqucgmdjm8ldtio.empty(cells[0]);
    $_6j2l8wmejm8ldtis.append(cells[0], contents);
  };
  var $_axt916nmjm8ldtta = { merge: merge };

  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var shallow$1 = function (old, nu) {
    return nu;
  };
  var baseMerge = function (merger) {
    return function () {
      var objects = new Array(arguments.length);
      for (var i = 0; i < objects.length; i++)
        objects[i] = arguments[i];
      if (objects.length === 0)
        throw new Error('Can\'t merge zero objects');
      var ret = {};
      for (var j = 0; j < objects.length; j++) {
        var curObject = objects[j];
        for (var key in curObject)
          if (hasOwnProperty.call(curObject, key)) {
            ret[key] = merger(ret[key], curObject[key]);
          }
      }
      return ret;
    };
  };

  var merge$1 = baseMerge(shallow$1);

  var cat = function (arr) {
    var r = [];
    var push = function (x) {
      r.push(x);
    };
    for (var i = 0; i < arr.length; i++) {
      arr[i].each(push);
    }
    return r;
  };
  var findMap = function (arr, f) {
    for (var i = 0; i < arr.length; i++) {
      var r = f(arr[i], i);
      if (r.isSome()) {
        return r;
      }
    }
    return Option.none();
  };

  var addCell = function (gridRow, index, cell) {
    var cells = gridRow.cells();
    var before = cells.slice(0, index);
    var after = cells.slice(index);
    var newCells = before.concat([cell]).concat(after);
    return setCells(gridRow, newCells);
  };
  var mutateCell = function (gridRow, index, cell) {
    var cells = gridRow.cells();
    cells[index] = cell;
  };
  var setCells = function (gridRow, cells) {
    return $_18gj1tlbjm8ldtd1.rowcells(cells, gridRow.section());
  };
  var mapCells = function (gridRow, f) {
    var cells = gridRow.cells();
    var r = map(cells, f);
    return $_18gj1tlbjm8ldtd1.rowcells(r, gridRow.section());
  };
  var getCell = function (gridRow, index) {
    return gridRow.cells()[index];
  };
  var getCellElement = function (gridRow, index) {
    return getCell(gridRow, index).element();
  };
  var cellLength = function (gridRow) {
    return gridRow.cells().length;
  };
  var $_94rd7vnujm8ldtva = {
    addCell: addCell,
    setCells: setCells,
    mutateCell: mutateCell,
    getCell: getCell,
    getCellElement: getCellElement,
    mapCells: mapCells,
    cellLength: cellLength
  };

  var getColumn = function (grid, index) {
    return map(grid, function (row) {
      return $_94rd7vnujm8ldtva.getCell(row, index);
    });
  };
  var getRow = function (grid, index) {
    return grid[index];
  };
  var findDiff = function (xs, comp) {
    if (xs.length === 0)
      return 0;
    var first = xs[0];
    var index = findIndex(xs, function (x) {
      return !comp(first.element(), x.element());
    });
    return index.fold(function () {
      return xs.length;
    }, function (ind) {
      return ind;
    });
  };
  var subgrid = function (grid, row, column, comparator) {
    var restOfRow = getRow(grid, row).cells().slice(column);
    var endColIndex = findDiff(restOfRow, comparator);
    var restOfColumn = getColumn(grid, column).slice(row);
    var endRowIndex = findDiff(restOfColumn, comparator);
    return {
      colspan: constant(endColIndex),
      rowspan: constant(endRowIndex)
    };
  };
  var $_fdwaitntjm8ldtv4 = { subgrid: subgrid };

  var toDetails = function (grid, comparator) {
    var seen = map(grid, function (row, ri) {
      return map(row.cells(), function (col, ci) {
        return false;
      });
    });
    var updateSeen = function (ri, ci, rowspan, colspan) {
      for (var r = ri; r < ri + rowspan; r++) {
        for (var c = ci; c < ci + colspan; c++) {
          seen[r][c] = true;
        }
      }
    };
    return map(grid, function (row, ri) {
      var details = bind(row.cells(), function (cell, ci) {
        if (seen[ri][ci] === false) {
          var result = $_fdwaitntjm8ldtv4.subgrid(grid, ri, ci, comparator);
          updateSeen(ri, ci, result.rowspan(), result.colspan());
          return [$_18gj1tlbjm8ldtd1.detailnew(cell.element(), result.rowspan(), result.colspan(), cell.isNew())];
        } else {
          return [];
        }
      });
      return $_18gj1tlbjm8ldtd1.rowdetails(details, row.section());
    });
  };
  var toGrid = function (warehouse, generators, isNew) {
    var grid = [];
    for (var i = 0; i < warehouse.grid().rows(); i++) {
      var rowCells = [];
      for (var j = 0; j < warehouse.grid().columns(); j++) {
        var element = $_fciyglm9jm8ldthy.getAt(warehouse, i, j).map(function (item) {
          return $_18gj1tlbjm8ldtd1.elementnew(item.element(), isNew);
        }).getOrThunk(function () {
          return $_18gj1tlbjm8ldtd1.elementnew(generators.gap(), true);
        });
        rowCells.push(element);
      }
      var row = $_18gj1tlbjm8ldtd1.rowcells(rowCells, warehouse.all()[i].section());
      grid.push(row);
    }
    return grid;
  };
  var $_5cuh00nsjm8ldtv0 = {
    toDetails: toDetails,
    toGrid: toGrid
  };

  var setIfNot = function (element, property, value, ignore) {
    if (value === ignore)
      $_dz8wvwm1jm8ldtgt.remove(element, property);
    else
      $_dz8wvwm1jm8ldtgt.set(element, property, value);
  };
  var render = function (table, grid) {
    var newRows = [];
    var newCells = [];
    var renderSection = function (gridSection, sectionName) {
      var section = $_6mmdzsm6jm8ldthg.child(table, sectionName).getOrThunk(function () {
        var tb = Element$$1.fromTag(sectionName, $_8mc5g7lijm8ldtev.owner(table).dom());
        $_a4o6jqmcjm8ldtin.append(table, tb);
        return tb;
      });
      $_dpqucgmdjm8ldtio.empty(section);
      var rows = map(gridSection, function (row) {
        if (row.isNew()) {
          newRows.push(row.element());
        }
        var tr = row.element();
        $_dpqucgmdjm8ldtio.empty(tr);
        each(row.cells(), function (cell) {
          if (cell.isNew()) {
            newCells.push(cell.element());
          }
          setIfNot(cell.element(), 'colspan', cell.colspan(), 1);
          setIfNot(cell.element(), 'rowspan', cell.rowspan(), 1);
          $_a4o6jqmcjm8ldtin.append(tr, cell.element());
        });
        return tr;
      });
      $_6j2l8wmejm8ldtis.append(section, rows);
    };
    var removeSection = function (sectionName) {
      $_6mmdzsm6jm8ldthg.child(table, sectionName).each($_dpqucgmdjm8ldtio.remove);
    };
    var renderOrRemoveSection = function (gridSection, sectionName) {
      if (gridSection.length > 0) {
        renderSection(gridSection, sectionName);
      } else {
        removeSection(sectionName);
      }
    };
    var headSection = [];
    var bodySection = [];
    var footSection = [];
    each(grid, function (row) {
      switch (row.section()) {
      case 'thead':
        headSection.push(row);
        break;
      case 'tbody':
        bodySection.push(row);
        break;
      case 'tfoot':
        footSection.push(row);
        break;
      }
    });
    renderOrRemoveSection(headSection, 'thead');
    renderOrRemoveSection(bodySection, 'tbody');
    renderOrRemoveSection(footSection, 'tfoot');
    return {
      newRows: constant(newRows),
      newCells: constant(newCells)
    };
  };
  var copy$2 = function (grid) {
    var rows = map(grid, function (row) {
      var tr = $_ezthd0mgjm8ldtjq.shallow(row.element());
      each(row.cells(), function (cell) {
        var clonedCell = $_ezthd0mgjm8ldtjq.deep(cell.element());
        setIfNot(clonedCell, 'colspan', cell.colspan(), 1);
        setIfNot(clonedCell, 'rowspan', cell.rowspan(), 1);
        $_a4o6jqmcjm8ldtin.append(tr, clonedCell);
      });
      return tr;
    });
    return rows;
  };
  var $_cnlw7onvjm8ldtvg = {
    render: render,
    copy: copy$2
  };

  var repeat = function (repititions, f) {
    var r = [];
    for (var i = 0; i < repititions; i++) {
      r.push(f(i));
    }
    return r;
  };
  var range$1 = function (start, end) {
    var r = [];
    for (var i = start; i < end; i++) {
      r.push(i);
    }
    return r;
  };
  var unique = function (xs, comparator) {
    var result = [];
    each(xs, function (x, i) {
      if (i < xs.length - 1 && !comparator(x, xs[i + 1])) {
        result.push(x);
      } else if (i === xs.length - 1) {
        result.push(x);
      }
    });
    return result;
  };
  var deduce = function (xs, index) {
    if (index < 0 || index >= xs.length - 1)
      return Option.none();
    var current = xs[index].fold(function () {
      var rest = reverse(xs.slice(0, index));
      return findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (c) {
      return Option.some({
        value: c,
        delta: 0
      });
    });
    var next = xs[index + 1].fold(function () {
      var rest = xs.slice(index + 1);
      return findMap(rest, function (a, i) {
        return a.map(function (aa) {
          return {
            value: aa,
            delta: i + 1
          };
        });
      });
    }, function (n) {
      return Option.some({
        value: n,
        delta: 1
      });
    });
    return current.bind(function (c) {
      return next.map(function (n) {
        var extras = n.delta + c.delta;
        return Math.abs(n.value - c.value) / extras;
      });
    });
  };
  var $_7ns6dfnyjm8ldtx2 = {
    repeat: repeat,
    range: range$1,
    unique: unique,
    deduce: deduce
  };

  var columns = function (warehouse) {
    var grid = warehouse.grid();
    var cols = $_7ns6dfnyjm8ldtx2.range(0, grid.columns());
    var rows = $_7ns6dfnyjm8ldtx2.range(0, grid.rows());
    return map(cols, function (col) {
      var getBlock = function () {
        return bind(rows, function (r) {
          return $_fciyglm9jm8ldthy.getAt(warehouse, r, col).filter(function (detail) {
            return detail.column() === col;
          }).fold(constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.colspan() === 1;
      };
      var getFallback = function () {
        return $_fciyglm9jm8ldthy.getAt(warehouse, 0, col);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var decide = function (getBlock, isSingle, getFallback) {
    var inBlock = getBlock();
    var singleInBlock = find(inBlock, isSingle);
    var detailOption = singleInBlock.orThunk(function () {
      return Option.from(inBlock[0]).orThunk(getFallback);
    });
    return detailOption.map(function (detail) {
      return detail.element();
    });
  };
  var rows$1 = function (warehouse) {
    var grid = warehouse.grid();
    var rows = $_7ns6dfnyjm8ldtx2.range(0, grid.rows());
    var cols = $_7ns6dfnyjm8ldtx2.range(0, grid.columns());
    return map(rows, function (row) {
      var getBlock = function () {
        return bind(cols, function (c) {
          return $_fciyglm9jm8ldthy.getAt(warehouse, row, c).filter(function (detail) {
            return detail.row() === row;
          }).fold(constant([]), function (detail) {
            return [detail];
          });
        });
      };
      var isSingle = function (detail) {
        return detail.rowspan() === 1;
      };
      var getFallback = function () {
        return $_fciyglm9jm8ldthy.getAt(warehouse, row, 0);
      };
      return decide(getBlock, isSingle, getFallback);
    });
  };
  var $_2dpei4nxjm8ldtwu = {
    columns: columns,
    rows: rows$1
  };

  var col = function (column, x, y, w, h) {
    var blocker = Element$$1.fromTag('div');
    $_dr5b9omajm8ldti8.setAll(blocker, {
      position: 'absolute',
      left: x - w / 2 + 'px',
      top: y + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_dz8wvwm1jm8ldtgt.setAll(blocker, {
      'data-column': column,
      'role': 'presentation'
    });
    return blocker;
  };
  var row$1 = function (row, x, y, w, h) {
    var blocker = Element$$1.fromTag('div');
    $_dr5b9omajm8ldti8.setAll(blocker, {
      position: 'absolute',
      left: x + 'px',
      top: y - h / 2 + 'px',
      height: h + 'px',
      width: w + 'px'
    });
    $_dz8wvwm1jm8ldtgt.setAll(blocker, {
      'data-row': row,
      'role': 'presentation'
    });
    return blocker;
  };
  var $_ganajdnzjm8ldtxc = {
    col: col,
    row: row$1
  };

  var css = function (namespace) {
    var dashNamespace = namespace.replace(/\./g, '-');
    var resolve = function (str) {
      return dashNamespace + '-' + str;
    };
    return { resolve: resolve };
  };

  var styles = css('ephox-snooker');
  var $_82owyfo0jm8ldtxk = { resolve: styles.resolve };

  function Toggler (turnOff, turnOn, initial) {
    var active = initial || false;
    var on = function () {
      turnOn();
      active = true;
    };
    var off = function () {
      turnOff();
      active = false;
    };
    var toggle = function () {
      var f = active ? off : on;
      f();
    };
    var isOn = function () {
      return active;
    };
    return {
      on: on,
      off: off,
      toggle: toggle,
      isOn: isOn
    };
  }

  var read = function (element, attr) {
    var value = $_dz8wvwm1jm8ldtgt.get(element, attr);
    return value === undefined || value === '' ? [] : value.split(' ');
  };
  var add = function (element, attr, id) {
    var old = read(element, attr);
    var nu = old.concat([id]);
    $_dz8wvwm1jm8ldtgt.set(element, attr, nu.join(' '));
    return true;
  };
  var remove$3 = function (element, attr, id) {
    var nu = filter(read(element, attr), function (v) {
      return v !== id;
    });
    if (nu.length > 0)
      $_dz8wvwm1jm8ldtgt.set(element, attr, nu.join(' '));
    else
      $_dz8wvwm1jm8ldtgt.remove(element, attr);
    return false;
  };
  var $_if4ioo5jm8ldtxv = {
    read: read,
    add: add,
    remove: remove$3
  };

  var supports = function (element) {
    return element.dom().classList !== undefined;
  };
  var get$6 = function (element) {
    return $_if4ioo5jm8ldtxv.read(element, 'class');
  };
  var add$1 = function (element, clazz) {
    return $_if4ioo5jm8ldtxv.add(element, 'class', clazz);
  };
  var remove$4 = function (element, clazz) {
    return $_if4ioo5jm8ldtxv.remove(element, 'class', clazz);
  };
  var toggle = function (element, clazz) {
    if (contains(get$6(element), clazz)) {
      return remove$4(element, clazz);
    } else {
      return add$1(element, clazz);
    }
  };
  var $_309xago4jm8ldtxs = {
    get: get$6,
    add: add$1,
    remove: remove$4,
    toggle: toggle,
    supports: supports
  };

  var add$2 = function (element, clazz) {
    if ($_309xago4jm8ldtxs.supports(element))
      element.dom().classList.add(clazz);
    else
      $_309xago4jm8ldtxs.add(element, clazz);
  };
  var cleanClass = function (element) {
    var classList = $_309xago4jm8ldtxs.supports(element) ? element.dom().classList : $_309xago4jm8ldtxs.get(element);
    if (classList.length === 0) {
      $_dz8wvwm1jm8ldtgt.remove(element, 'class');
    }
  };
  var remove$5 = function (element, clazz) {
    if ($_309xago4jm8ldtxs.supports(element)) {
      var classList = element.dom().classList;
      classList.remove(clazz);
    } else
      $_309xago4jm8ldtxs.remove(element, clazz);
    cleanClass(element);
  };
  var toggle$1 = function (element, clazz) {
    return $_309xago4jm8ldtxs.supports(element) ? element.dom().classList.toggle(clazz) : $_309xago4jm8ldtxs.toggle(element, clazz);
  };
  var toggler = function (element, clazz) {
    var hasClasslist = $_309xago4jm8ldtxs.supports(element);
    var classList = element.dom().classList;
    var off = function () {
      if (hasClasslist)
        classList.remove(clazz);
      else
        $_309xago4jm8ldtxs.remove(element, clazz);
    };
    var on = function () {
      if (hasClasslist)
        classList.add(clazz);
      else
        $_309xago4jm8ldtxs.add(element, clazz);
    };
    return Toggler(off, on, has$1(element, clazz));
  };
  var has$1 = function (element, clazz) {
    return $_309xago4jm8ldtxs.supports(element) && element.dom().classList.contains(clazz);
  };
  var $_ersi15o2jm8ldtxp = {
    add: add$2,
    remove: remove$5,
    toggle: toggle$1,
    toggler: toggler,
    has: has$1
  };

  var resizeBar = $_82owyfo0jm8ldtxk.resolve('resizer-bar');
  var resizeRowBar = $_82owyfo0jm8ldtxk.resolve('resizer-rows');
  var resizeColBar = $_82owyfo0jm8ldtxk.resolve('resizer-cols');
  var BAR_THICKNESS = 7;
  var clear = function (wire) {
    var previous = $_emvpc1m3jm8ldth3.descendants(wire.parent(), '.' + resizeBar);
    each(previous, $_dpqucgmdjm8ldtio.remove);
  };
  var drawBar = function (wire, positions, create) {
    var origin = wire.origin();
    each(positions, function (cpOption, i) {
      cpOption.each(function (cp) {
        var bar = create(origin, cp);
        $_ersi15o2jm8ldtxp.add(bar, resizeBar);
        $_a4o6jqmcjm8ldtin.append(wire.parent(), bar);
      });
    });
  };
  var refreshCol = function (wire, colPositions, position, tableHeight) {
    drawBar(wire, colPositions, function (origin, cp) {
      var colBar = $_ganajdnzjm8ldtxc.col(cp.col(), cp.x() - origin.left(), position.top() - origin.top(), BAR_THICKNESS, tableHeight);
      $_ersi15o2jm8ldtxp.add(colBar, resizeColBar);
      return colBar;
    });
  };
  var refreshRow = function (wire, rowPositions, position, tableWidth) {
    drawBar(wire, rowPositions, function (origin, cp) {
      var rowBar = $_ganajdnzjm8ldtxc.row(cp.row(), position.left() - origin.left(), cp.y() - origin.top(), tableWidth, BAR_THICKNESS);
      $_ersi15o2jm8ldtxp.add(rowBar, resizeRowBar);
      return rowBar;
    });
  };
  var refreshGrid = function (wire, table, rows, cols, hdirection, vdirection) {
    var position = $_9noskinejm8ldtrq.absolute(table);
    var rowPositions = rows.length > 0 ? hdirection.positions(rows, table) : [];
    refreshRow(wire, rowPositions, position, $_71wagvnajm8ldtr6.getOuter(table));
    var colPositions = cols.length > 0 ? vdirection.positions(cols, table) : [];
    refreshCol(wire, colPositions, position, $_axmf9nn8jm8ldtqy.getOuter(table));
  };
  var refresh = function (wire, table, hdirection, vdirection) {
    clear(wire);
    var list = $_act3unlajm8ldtcq.fromTable(table);
    var warehouse = $_fciyglm9jm8ldthy.generate(list);
    var rows = $_2dpei4nxjm8ldtwu.rows(warehouse);
    var cols = $_2dpei4nxjm8ldtwu.columns(warehouse);
    refreshGrid(wire, table, rows, cols, hdirection, vdirection);
  };
  var each$2 = function (wire, f) {
    var bars = $_emvpc1m3jm8ldth3.descendants(wire.parent(), '.' + resizeBar);
    each(bars, f);
  };
  var hide = function (wire) {
    each$2(wire, function (bar) {
      $_dr5b9omajm8ldti8.set(bar, 'display', 'none');
    });
  };
  var show = function (wire) {
    each$2(wire, function (bar) {
      $_dr5b9omajm8ldti8.set(bar, 'display', 'block');
    });
  };
  var isRowBar = function (element) {
    return $_ersi15o2jm8ldtxp.has(element, resizeRowBar);
  };
  var isColBar = function (element) {
    return $_ersi15o2jm8ldtxp.has(element, resizeColBar);
  };
  var $_7ojhlinwjm8ldtw5 = {
    refresh: refresh,
    hide: hide,
    show: show,
    destroy: clear,
    isRowBar: isRowBar,
    isColBar: isColBar
  };

  var fromWarehouse = function (warehouse, generators) {
    return $_5cuh00nsjm8ldtv0.toGrid(warehouse, generators, false);
  };
  var deriveRows = function (rendered, generators) {
    var findRow = function (details) {
      var rowOfCells = findMap(details, function (detail) {
        return $_8mc5g7lijm8ldtev.parent(detail.element()).map(function (row) {
          var isNew = $_8mc5g7lijm8ldtev.parent(row).isNone();
          return $_18gj1tlbjm8ldtd1.elementnew(row, isNew);
        });
      });
      return rowOfCells.getOrThunk(function () {
        return $_18gj1tlbjm8ldtd1.elementnew(generators.row(), true);
      });
    };
    return map(rendered, function (details) {
      var row = findRow(details.details());
      return $_18gj1tlbjm8ldtd1.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
    });
  };
  var toDetailList = function (grid, generators) {
    var rendered = $_5cuh00nsjm8ldtv0.toDetails(grid, $_ak7uzflkjm8ldtfb.eq);
    return deriveRows(rendered, generators);
  };
  var findInWarehouse = function (warehouse, element) {
    var all = flatten(map(warehouse.all(), function (r) {
      return r.cells();
    }));
    return find(all, function (e) {
      return $_ak7uzflkjm8ldtfb.eq(element, e.element());
    });
  };
  var run = function (operation, extract, adjustment, postAction, genWrappers) {
    return function (wire, table, target, generators, direction) {
      var input = $_act3unlajm8ldtcq.fromTable(table);
      var warehouse = $_fciyglm9jm8ldthy.generate(input);
      var output = extract(warehouse, target).map(function (info) {
        var model = fromWarehouse(warehouse, generators);
        var result = operation(model, info, $_ak7uzflkjm8ldtfb.eq, genWrappers(generators));
        var grid = toDetailList(result.grid(), generators);
        return {
          grid: constant(grid),
          cursor: result.cursor
        };
      });
      return output.fold(function () {
        return Option.none();
      }, function (out) {
        var newElements = $_cnlw7onvjm8ldtvg.render(table, out.grid());
        adjustment(table, out.grid(), direction);
        postAction(table);
        $_7ojhlinwjm8ldtw5.refresh(wire, table, $_d945hsndjm8ldtrb.height, direction);
        return Option.some({
          cursor: out.cursor,
          newRows: newElements.newRows,
          newCells: newElements.newCells
        });
      });
    };
  };
  var onCell = function (warehouse, target) {
    return $_b4ktmplcjm8ldtd5.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell);
    });
  };
  var onPaste = function (warehouse, target) {
    return $_b4ktmplcjm8ldtd5.cell(target.element()).bind(function (cell) {
      return findInWarehouse(warehouse, cell).map(function (details) {
        return merge$1(details, {
          generators: target.generators,
          clipboard: target.clipboard
        });
      });
    });
  };
  var onPasteRows = function (warehouse, target) {
    var details = map(target.selection(), function (cell) {
      return $_b4ktmplcjm8ldtd5.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = cat(details);
    return cells.length > 0 ? Option.some(merge$1({ cells: cells }, {
      generators: target.generators,
      clipboard: target.clipboard
    })) : Option.none();
  };
  var onMergable = function (warehouse, target) {
    return target.mergable();
  };
  var onUnmergable = function (warehouse, target) {
    return target.unmergable();
  };
  var onCells = function (warehouse, target) {
    var details = map(target.selection(), function (cell) {
      return $_b4ktmplcjm8ldtd5.cell(cell).bind(function (lc) {
        return findInWarehouse(warehouse, lc);
      });
    });
    var cells = cat(details);
    return cells.length > 0 ? Option.some(cells) : Option.none();
  };
  var $_fqyf5bnpjm8ldtud = {
    run: run,
    toDetailList: toDetailList,
    onCell: onCell,
    onCells: onCells,
    onPaste: onPaste,
    onPasteRows: onPasteRows,
    onMergable: onMergable,
    onUnmergable: onUnmergable
  };

  var value$1 = function (o) {
    var is = function (v) {
      return o === v;
    };
    var or = function (opt) {
      return value$1(o);
    };
    var orThunk = function (f) {
      return value$1(o);
    };
    var map = function (f) {
      return value$1(f(o));
    };
    var each = function (f) {
      f(o);
    };
    var bind = function (f) {
      return f(o);
    };
    var fold = function (_, onValue) {
      return onValue(o);
    };
    var exists = function (f) {
      return f(o);
    };
    var forall = function (f) {
      return f(o);
    };
    var toOption = function () {
      return Option.some(o);
    };
    return {
      is: is,
      isValue: always,
      isError: never,
      getOr: constant(o),
      getOrThunk: constant(o),
      getOrDie: constant(o),
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: each,
      bind: bind,
      exists: exists,
      forall: forall,
      toOption: toOption
    };
  };
  var error = function (message) {
    var getOrThunk = function (f) {
      return f();
    };
    var getOrDie = function () {
      return die(String(message))();
    };
    var or = function (opt) {
      return opt;
    };
    var orThunk = function (f) {
      return f();
    };
    var map = function (f) {
      return error(message);
    };
    var bind = function (f) {
      return error(message);
    };
    var fold = function (onError, _) {
      return onError(message);
    };
    return {
      is: never,
      isValue: never,
      isError: always,
      getOr: identity,
      getOrThunk: getOrThunk,
      getOrDie: getOrDie,
      or: or,
      orThunk: orThunk,
      fold: fold,
      map: map,
      each: noop,
      bind: bind,
      exists: never,
      forall: always,
      toOption: Option.none
    };
  };
  var Result = {
    value: value$1,
    error: error
  };

  var measure = function (startAddress, gridA, gridB) {
    if (startAddress.row() >= gridA.length || startAddress.column() > $_94rd7vnujm8ldtva.cellLength(gridA[0]))
      return Result.error('invalid start address out of table bounds, row: ' + startAddress.row() + ', column: ' + startAddress.column());
    var rowRemainder = gridA.slice(startAddress.row());
    var colRemainder = rowRemainder[0].cells().slice(startAddress.column());
    var colRequired = $_94rd7vnujm8ldtva.cellLength(gridB[0]);
    var rowRequired = gridB.length;
    return Result.value({
      rowDelta: constant(rowRemainder.length - rowRequired),
      colDelta: constant(colRemainder.length - colRequired)
    });
  };
  var measureWidth = function (gridA, gridB) {
    var colLengthA = $_94rd7vnujm8ldtva.cellLength(gridA[0]);
    var colLengthB = $_94rd7vnujm8ldtva.cellLength(gridB[0]);
    return {
      rowDelta: constant(0),
      colDelta: constant(colLengthA - colLengthB)
    };
  };
  var fill = function (cells, generator) {
    return map(cells, function () {
      return $_18gj1tlbjm8ldtd1.elementnew(generator.cell(), true);
    });
  };
  var rowFill = function (grid, amount, generator) {
    return grid.concat($_7ns6dfnyjm8ldtx2.repeat(amount, function (_row) {
      return $_94rd7vnujm8ldtva.setCells(grid[grid.length - 1], fill(grid[grid.length - 1].cells(), generator));
    }));
  };
  var colFill = function (grid, amount, generator) {
    return map(grid, function (row) {
      return $_94rd7vnujm8ldtva.setCells(row, row.cells().concat(fill($_7ns6dfnyjm8ldtx2.range(0, amount), generator)));
    });
  };
  var tailor = function (gridA, delta, generator) {
    var fillCols = delta.colDelta() < 0 ? colFill : identity;
    var fillRows = delta.rowDelta() < 0 ? rowFill : identity;
    var modifiedCols = fillCols(gridA, Math.abs(delta.colDelta()), generator);
    var tailoredGrid = fillRows(modifiedCols, Math.abs(delta.rowDelta()), generator);
    return tailoredGrid;
  };
  var $_d2xf6so7jm8ldty5 = {
    measure: measure,
    measureWidth: measureWidth,
    tailor: tailor
  };

  var merge$2 = function (grid, bounds, comparator, substitution) {
    if (grid.length === 0)
      return grid;
    for (var i = bounds.startRow(); i <= bounds.finishRow(); i++) {
      for (var j = bounds.startCol(); j <= bounds.finishCol(); j++) {
        $_94rd7vnujm8ldtva.mutateCell(grid[i], j, $_18gj1tlbjm8ldtd1.elementnew(substitution(), false));
      }
    }
    return grid;
  };
  var unmerge = function (grid, target, comparator, substitution) {
    var first = true;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < $_94rd7vnujm8ldtva.cellLength(grid[0]); j++) {
        var current = $_94rd7vnujm8ldtva.getCellElement(grid[i], j);
        var isToReplace = comparator(current, target);
        if (isToReplace === true && first === false) {
          $_94rd7vnujm8ldtva.mutateCell(grid[i], j, $_18gj1tlbjm8ldtd1.elementnew(substitution(), true));
        } else if (isToReplace === true) {
          first = false;
        }
      }
    }
    return grid;
  };
  var uniqueCells = function (row, comparator) {
    return foldl(row, function (rest, cell) {
      return exists(rest, function (currentCell) {
        return comparator(currentCell.element(), cell.element());
      }) ? rest : rest.concat([cell]);
    }, []);
  };
  var splitRows = function (grid, index, comparator, substitution) {
    if (index > 0 && index < grid.length) {
      var rowPrevCells = grid[index - 1].cells();
      var cells = uniqueCells(rowPrevCells, comparator);
      each(cells, function (cell) {
        var replacement = Option.none();
        for (var i = index; i < grid.length; i++) {
          for (var j = 0; j < $_94rd7vnujm8ldtva.cellLength(grid[0]); j++) {
            var current = grid[i].cells()[j];
            var isToReplace = comparator(current.element(), cell.element());
            if (isToReplace) {
              if (replacement.isNone()) {
                replacement = Option.some(substitution());
              }
              replacement.each(function (sub) {
                $_94rd7vnujm8ldtva.mutateCell(grid[i], j, $_18gj1tlbjm8ldtd1.elementnew(sub, true));
              });
            }
          }
        }
      });
    }
    return grid;
  };
  var $_angx4eo9jm8ldtyk = {
    merge: merge$2,
    unmerge: unmerge,
    splitRows: splitRows
  };

  var isSpanning = function (grid, row, col, comparator) {
    var candidate = $_94rd7vnujm8ldtva.getCell(grid[row], col);
    var matching = curry(comparator, candidate.element());
    var currentRow = grid[row];
    return grid.length > 1 && $_94rd7vnujm8ldtva.cellLength(currentRow) > 1 && (col > 0 && matching($_94rd7vnujm8ldtva.getCellElement(currentRow, col - 1)) || col < currentRow.length - 1 && matching($_94rd7vnujm8ldtva.getCellElement(currentRow, col + 1)) || row > 0 && matching($_94rd7vnujm8ldtva.getCellElement(grid[row - 1], col)) || row < grid.length - 1 && matching($_94rd7vnujm8ldtva.getCellElement(grid[row + 1], col)));
  };
  var mergeTables = function (startAddress, gridA, gridB, generator, comparator) {
    var startRow = startAddress.row();
    var startCol = startAddress.column();
    var mergeHeight = gridB.length;
    var mergeWidth = $_94rd7vnujm8ldtva.cellLength(gridB[0]);
    var endRow = startRow + mergeHeight;
    var endCol = startCol + mergeWidth;
    for (var r = startRow; r < endRow; r++) {
      for (var c = startCol; c < endCol; c++) {
        if (isSpanning(gridA, r, c, comparator)) {
          $_angx4eo9jm8ldtyk.unmerge(gridA, $_94rd7vnujm8ldtva.getCellElement(gridA[r], c), comparator, generator.cell);
        }
        var newCell = $_94rd7vnujm8ldtva.getCellElement(gridB[r - startRow], c - startCol);
        var replacement = generator.replace(newCell);
        $_94rd7vnujm8ldtva.mutateCell(gridA[r], c, $_18gj1tlbjm8ldtd1.elementnew(replacement, true));
      }
    }
    return gridA;
  };
  var merge$3 = function (startAddress, gridA, gridB, generator, comparator) {
    var result = $_d2xf6so7jm8ldty5.measure(startAddress, gridA, gridB);
    return result.map(function (delta) {
      var fittedGrid = $_d2xf6so7jm8ldty5.tailor(gridA, delta, generator);
      return mergeTables(startAddress, fittedGrid, gridB, generator, comparator);
    });
  };
  var insert = function (index, gridA, gridB, generator, comparator) {
    $_angx4eo9jm8ldtyk.splitRows(gridA, index, comparator, generator.cell);
    var delta = $_d2xf6so7jm8ldty5.measureWidth(gridB, gridA);
    var fittedNewGrid = $_d2xf6so7jm8ldty5.tailor(gridB, delta, generator);
    var secondDelta = $_d2xf6so7jm8ldty5.measureWidth(gridA, fittedNewGrid);
    var fittedOldGrid = $_d2xf6so7jm8ldty5.tailor(gridA, secondDelta, generator);
    return fittedOldGrid.slice(0, index).concat(fittedNewGrid).concat(fittedOldGrid.slice(index, fittedOldGrid.length));
  };
  var $_4n4svqo6jm8ldtxz = {
    merge: merge$3,
    insert: insert
  };

  var insertRowAt = function (grid, index, example, comparator, substitution) {
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_94rd7vnujm8ldtva.mapCells(grid[example], function (ex, c) {
      var withinSpan = index > 0 && index < grid.length && comparator($_94rd7vnujm8ldtva.getCellElement(grid[index - 1], c), $_94rd7vnujm8ldtva.getCellElement(grid[index], c));
      var ret = withinSpan ? $_94rd7vnujm8ldtva.getCell(grid[index], c) : $_18gj1tlbjm8ldtd1.elementnew(substitution(ex.element(), comparator), true);
      return ret;
    });
    return before.concat([between]).concat(after);
  };
  var insertColumnAt = function (grid, index, example, comparator, substitution) {
    return map(grid, function (row) {
      var withinSpan = index > 0 && index < $_94rd7vnujm8ldtva.cellLength(row) && comparator($_94rd7vnujm8ldtva.getCellElement(row, index - 1), $_94rd7vnujm8ldtva.getCellElement(row, index));
      var sub = withinSpan ? $_94rd7vnujm8ldtva.getCell(row, index) : $_18gj1tlbjm8ldtd1.elementnew(substitution($_94rd7vnujm8ldtva.getCellElement(row, example), comparator), true);
      return $_94rd7vnujm8ldtva.addCell(row, index, sub);
    });
  };
  var splitCellIntoColumns = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleCol + 1;
    return map(grid, function (row, i) {
      var isTargetCell = i === exampleRow;
      var sub = isTargetCell ? $_18gj1tlbjm8ldtd1.elementnew(substitution($_94rd7vnujm8ldtva.getCellElement(row, exampleCol), comparator), true) : $_94rd7vnujm8ldtva.getCell(row, exampleCol);
      return $_94rd7vnujm8ldtva.addCell(row, index, sub);
    });
  };
  var splitCellIntoRows = function (grid, exampleRow, exampleCol, comparator, substitution) {
    var index = exampleRow + 1;
    var before = grid.slice(0, index);
    var after = grid.slice(index);
    var between = $_94rd7vnujm8ldtva.mapCells(grid[exampleRow], function (ex, i) {
      var isTargetCell = i === exampleCol;
      return isTargetCell ? $_18gj1tlbjm8ldtd1.elementnew(substitution(ex.element(), comparator), true) : ex;
    });
    return before.concat([between]).concat(after);
  };
  var deleteColumnsAt = function (grid, start, finish) {
    var rows = map(grid, function (row) {
      var cells = row.cells().slice(0, start).concat(row.cells().slice(finish + 1));
      return $_18gj1tlbjm8ldtd1.rowcells(cells, row.section());
    });
    return filter(rows, function (row) {
      return row.cells().length > 0;
    });
  };
  var deleteRowsAt = function (grid, start, finish) {
    return grid.slice(0, start).concat(grid.slice(finish + 1));
  };
  var $_tr4zcoajm8ldtys = {
    insertRowAt: insertRowAt,
    insertColumnAt: insertColumnAt,
    splitCellIntoColumns: splitCellIntoColumns,
    splitCellIntoRows: splitCellIntoRows,
    deleteRowsAt: deleteRowsAt,
    deleteColumnsAt: deleteColumnsAt
  };

  var replaceIn = function (grid, targets, comparator, substitution) {
    var isTarget = function (cell) {
      return exists(targets, function (target) {
        return comparator(cell.element(), target.element());
      });
    };
    return map(grid, function (row) {
      return $_94rd7vnujm8ldtva.mapCells(row, function (cell) {
        return isTarget(cell) ? $_18gj1tlbjm8ldtd1.elementnew(substitution(cell.element(), comparator), true) : cell;
      });
    });
  };
  var notStartRow = function (grid, rowIndex, colIndex, comparator) {
    return $_94rd7vnujm8ldtva.getCellElement(grid[rowIndex], colIndex) !== undefined && (rowIndex > 0 && comparator($_94rd7vnujm8ldtva.getCellElement(grid[rowIndex - 1], colIndex), $_94rd7vnujm8ldtva.getCellElement(grid[rowIndex], colIndex)));
  };
  var notStartColumn = function (row, index, comparator) {
    return index > 0 && comparator($_94rd7vnujm8ldtva.getCellElement(row, index - 1), $_94rd7vnujm8ldtva.getCellElement(row, index));
  };
  var replaceColumn = function (grid, index, comparator, substitution) {
    var targets = bind(grid, function (row, i) {
      var alreadyAdded = notStartRow(grid, i, index, comparator) || notStartColumn(row, index, comparator);
      return alreadyAdded ? [] : [$_94rd7vnujm8ldtva.getCell(row, index)];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var replaceRow = function (grid, index, comparator, substitution) {
    var targetRow = grid[index];
    var targets = bind(targetRow.cells(), function (item, i) {
      var alreadyAdded = notStartRow(grid, index, i, comparator) || notStartColumn(targetRow, i, comparator);
      return alreadyAdded ? [] : [item];
    });
    return replaceIn(grid, targets, comparator, substitution);
  };
  var $_b9c6c4objm8ldtyx = {
    replaceColumn: replaceColumn,
    replaceRow: replaceRow
  };

  var none$1 = function () {
    return folder(function (n, o, l, m, r) {
      return n();
    });
  };
  var only = function (index) {
    return folder(function (n, o, l, m, r) {
      return o(index);
    });
  };
  var left = function (index, next) {
    return folder(function (n, o, l, m, r) {
      return l(index, next);
    });
  };
  var middle = function (prev, index, next) {
    return folder(function (n, o, l, m, r) {
      return m(prev, index, next);
    });
  };
  var right = function (prev, index) {
    return folder(function (n, o, l, m, r) {
      return r(prev, index);
    });
  };
  var folder = function (fold) {
    return { fold: fold };
  };
  var $_afjqlnoejm8ldtzd = {
    none: none$1,
    only: only,
    left: left,
    middle: middle,
    right: right
  };

  var neighbours$1 = function (input, index) {
    if (input.length === 0)
      return $_afjqlnoejm8ldtzd.none();
    if (input.length === 1)
      return $_afjqlnoejm8ldtzd.only(0);
    if (index === 0)
      return $_afjqlnoejm8ldtzd.left(0, 1);
    if (index === input.length - 1)
      return $_afjqlnoejm8ldtzd.right(index - 1, index);
    if (index > 0 && index < input.length - 1)
      return $_afjqlnoejm8ldtzd.middle(index - 1, index, index + 1);
    return $_afjqlnoejm8ldtzd.none();
  };
  var determine = function (input, column, step, tableSize) {
    var result = input.slice(0);
    var context = neighbours$1(input, column);
    var zero = function (array) {
      return map(array, constant(0));
    };
    var onNone = constant(zero(result));
    var onOnly = function (index) {
      return tableSize.singleColumnWidth(result[index], step);
    };
    var onChange = function (index, next) {
      if (step >= 0) {
        var newNext = Math.max(tableSize.minCellWidth(), result[next] - step);
        return zero(result.slice(0, index)).concat([
          step,
          newNext - result[next]
        ]).concat(zero(result.slice(next + 1)));
      } else {
        var newThis = Math.max(tableSize.minCellWidth(), result[index] + step);
        var diffx = result[index] - newThis;
        return zero(result.slice(0, index)).concat([
          newThis - result[index],
          diffx
        ]).concat(zero(result.slice(next + 1)));
      }
    };
    var onLeft = onChange;
    var onMiddle = function (prev, index, next) {
      return onChange(index, next);
    };
    var onRight = function (prev, index) {
      if (step >= 0) {
        return zero(result.slice(0, index)).concat([step]);
      } else {
        var size = Math.max(tableSize.minCellWidth(), result[index] + step);
        return zero(result.slice(0, index)).concat([size - result[index]]);
      }
    };
    return context.fold(onNone, onOnly, onLeft, onMiddle, onRight);
  };
  var $_a5je6zodjm8ldtz6 = { determine: determine };

  var getSpan$1 = function (cell, type) {
    return $_dz8wvwm1jm8ldtgt.has(cell, type) && parseInt($_dz8wvwm1jm8ldtgt.get(cell, type), 10) > 1;
  };
  var hasColspan = function (cell) {
    return getSpan$1(cell, 'colspan');
  };
  var hasRowspan = function (cell) {
    return getSpan$1(cell, 'rowspan');
  };
  var getInt = function (element, property) {
    return parseInt($_dr5b9omajm8ldti8.get(element, property), 10);
  };
  var $_7fuz8wogjm8ldtzq = {
    hasColspan: hasColspan,
    hasRowspan: hasRowspan,
    minWidth: constant(10),
    minHeight: constant(10),
    getInt: getInt
  };

  var getRaw$1 = function (cell, property, getter) {
    return $_dr5b9omajm8ldti8.getRaw(cell, property).fold(function () {
      return getter(cell) + 'px';
    }, function (raw) {
      return raw;
    });
  };
  var getRawW = function (cell) {
    return getRaw$1(cell, 'width', $_4w6li5n6jm8ldtpz.getPixelWidth);
  };
  var getRawH = function (cell) {
    return getRaw$1(cell, 'height', $_4w6li5n6jm8ldtpz.getHeight);
  };
  var getWidthFrom = function (warehouse, direction, getWidth, fallback, tableSize) {
    var columns = $_2dpei4nxjm8ldtwu.columns(warehouse);
    var backups = map(columns, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return map(columns, function (cellOption, c) {
      var columnCell = cellOption.filter(not($_7fuz8wogjm8ldtzq.hasColspan));
      return columnCell.fold(function () {
        var deduced = $_7ns6dfnyjm8ldtx2.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getWidth(cell, tableSize);
      });
    });
  };
  var getDeduced = function (deduced) {
    return deduced.map(function (d) {
      return d + 'px';
    }).getOr('');
  };
  var getRawWidths = function (warehouse, direction) {
    return getWidthFrom(warehouse, direction, getRawW, getDeduced);
  };
  var getPercentageWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_4w6li5n6jm8ldtpz.getPercentageWidth, function (deduced) {
      return deduced.fold(function () {
        return tableSize.minCellWidth();
      }, function (cellWidth) {
        return cellWidth / tableSize.pixelWidth() * 100;
      });
    }, tableSize);
  };
  var getPixelWidths = function (warehouse, direction, tableSize) {
    return getWidthFrom(warehouse, direction, $_4w6li5n6jm8ldtpz.getPixelWidth, function (deduced) {
      return deduced.getOrThunk(tableSize.minCellWidth);
    }, tableSize);
  };
  var getHeightFrom = function (warehouse, direction, getHeight, fallback) {
    var rows = $_2dpei4nxjm8ldtwu.rows(warehouse);
    var backups = map(rows, function (cellOption) {
      return cellOption.map(direction.edge);
    });
    return map(rows, function (cellOption, c) {
      var rowCell = cellOption.filter(not($_7fuz8wogjm8ldtzq.hasRowspan));
      return rowCell.fold(function () {
        var deduced = $_7ns6dfnyjm8ldtx2.deduce(backups, c);
        return fallback(deduced);
      }, function (cell) {
        return getHeight(cell);
      });
    });
  };
  var getPixelHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, $_4w6li5n6jm8ldtpz.getHeight, function (deduced) {
      return deduced.getOrThunk($_7fuz8wogjm8ldtzq.minHeight);
    });
  };
  var getRawHeights = function (warehouse, direction) {
    return getHeightFrom(warehouse, direction, getRawH, getDeduced);
  };
  var $_9v13enofjm8ldtzf = {
    getRawWidths: getRawWidths,
    getPixelWidths: getPixelWidths,
    getPercentageWidths: getPercentageWidths,
    getPixelHeights: getPixelHeights,
    getRawHeights: getRawHeights
  };

  var total = function (start, end, measures) {
    var r = 0;
    for (var i = start; i < end; i++) {
      r += measures[i] !== undefined ? measures[i] : 0;
    }
    return r;
  };
  var recalculateWidth = function (warehouse, widths) {
    var all = $_fciyglm9jm8ldthy.justCells(warehouse);
    return map(all, function (cell) {
      var width = total(cell.column(), cell.column() + cell.colspan(), widths);
      return {
        element: cell.element,
        width: constant(width),
        colspan: cell.colspan
      };
    });
  };
  var recalculateHeight = function (warehouse, heights) {
    var all = $_fciyglm9jm8ldthy.justCells(warehouse);
    return map(all, function (cell) {
      var height = total(cell.row(), cell.row() + cell.rowspan(), heights);
      return {
        element: cell.element,
        height: constant(height),
        rowspan: cell.rowspan
      };
    });
  };
  var matchRowHeight = function (warehouse, heights) {
    return map(warehouse.all(), function (row, i) {
      return {
        element: row.element,
        height: constant(heights[i])
      };
    });
  };
  var $_a3n7n5ohjm8ldtzy = {
    recalculateWidth: recalculateWidth,
    recalculateHeight: recalculateHeight,
    matchRowHeight: matchRowHeight
  };

  var percentageSize = function (width, element) {
    var floatWidth = parseFloat(width);
    var pixelWidth = $_71wagvnajm8ldtr6.get(element);
    var getCellDelta = function (delta) {
      return delta / pixelWidth * 100;
    };
    var singleColumnWidth = function (width, _delta) {
      return [100 - width];
    };
    var minCellWidth = function () {
      return $_7fuz8wogjm8ldtzq.minWidth() / pixelWidth * 100;
    };
    var setTableWidth = function (table, _newWidths, delta) {
      var total = floatWidth + delta;
      $_4w6li5n6jm8ldtpz.setPercentageWidth(table, total);
    };
    return {
      width: constant(floatWidth),
      pixelWidth: constant(pixelWidth),
      getWidths: $_9v13enofjm8ldtzf.getPercentageWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: minCellWidth,
      setElementWidth: $_4w6li5n6jm8ldtpz.setPercentageWidth,
      setTableWidth: setTableWidth
    };
  };
  var pixelSize = function (width) {
    var intWidth = parseInt(width, 10);
    var getCellDelta = identity;
    var singleColumnWidth = function (width, delta) {
      var newNext = Math.max($_7fuz8wogjm8ldtzq.minWidth(), width + delta);
      return [newNext - width];
    };
    var setTableWidth = function (table, newWidths, _delta) {
      var total = foldr(newWidths, function (b, a) {
        return b + a;
      }, 0);
      $_4w6li5n6jm8ldtpz.setPixelWidth(table, total);
    };
    return {
      width: constant(intWidth),
      pixelWidth: constant(intWidth),
      getWidths: $_9v13enofjm8ldtzf.getPixelWidths,
      getCellDelta: getCellDelta,
      singleColumnWidth: singleColumnWidth,
      minCellWidth: $_7fuz8wogjm8ldtzq.minWidth,
      setElementWidth: $_4w6li5n6jm8ldtpz.setPixelWidth,
      setTableWidth: setTableWidth
    };
  };
  var chooseSize = function (element, width) {
    if ($_4w6li5n6jm8ldtpz.percentageBasedSizeRegex().test(width)) {
      var percentMatch = $_4w6li5n6jm8ldtpz.percentageBasedSizeRegex().exec(width);
      return percentageSize(percentMatch[1], element);
    } else if ($_4w6li5n6jm8ldtpz.pixelBasedSizeRegex().test(width)) {
      var pixelMatch = $_4w6li5n6jm8ldtpz.pixelBasedSizeRegex().exec(width);
      return pixelSize(pixelMatch[1]);
    } else {
      var fallbackWidth = $_71wagvnajm8ldtr6.get(element);
      return pixelSize(fallbackWidth);
    }
  };
  var getTableSize = function (element) {
    var width = $_4w6li5n6jm8ldtpz.getRawWidth(element);
    return width.fold(function () {
      var fallbackWidth = $_71wagvnajm8ldtr6.get(element);
      return pixelSize(fallbackWidth);
    }, function (width) {
      return chooseSize(element, width);
    });
  };
  var $_31s39uoijm8ldu05 = { getTableSize: getTableSize };

  var getWarehouse$1 = function (list) {
    return $_fciyglm9jm8ldthy.generate(list);
  };
  var sumUp = function (newSize) {
    return foldr(newSize, function (b, a) {
      return b + a;
    }, 0);
  };
  var getTableWarehouse = function (table) {
    var list = $_act3unlajm8ldtcq.fromTable(table);
    return getWarehouse$1(list);
  };
  var adjustWidth = function (table, delta, index, direction) {
    var tableSize = $_31s39uoijm8ldu05.getTableSize(table);
    var step = tableSize.getCellDelta(delta);
    var warehouse = getTableWarehouse(table);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var deltas = $_a5je6zodjm8ldtz6.determine(widths, index, step, tableSize);
    var newWidths = map(deltas, function (dx, i) {
      return dx + widths[i];
    });
    var newSizes = $_a3n7n5ohjm8ldtzy.recalculateWidth(warehouse, newWidths);
    each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    if (index === warehouse.grid().columns() - 1) {
      tableSize.setTableWidth(table, newWidths, step);
    }
  };
  var adjustHeight = function (table, delta, index, direction) {
    var warehouse = getTableWarehouse(table);
    var heights = $_9v13enofjm8ldtzf.getPixelHeights(warehouse, direction);
    var newHeights = map(heights, function (dy, i) {
      return index === i ? Math.max(delta + dy, $_7fuz8wogjm8ldtzq.minHeight()) : dy;
    });
    var newCellSizes = $_a3n7n5ohjm8ldtzy.recalculateHeight(warehouse, newHeights);
    var newRowSizes = $_a3n7n5ohjm8ldtzy.matchRowHeight(warehouse, newHeights);
    each(newRowSizes, function (row) {
      $_4w6li5n6jm8ldtpz.setHeight(row.element(), row.height());
    });
    each(newCellSizes, function (cell) {
      $_4w6li5n6jm8ldtpz.setHeight(cell.element(), cell.height());
    });
    var total = sumUp(newHeights);
    $_4w6li5n6jm8ldtpz.setHeight(table, total);
  };
  var adjustWidthTo = function (table, list, direction) {
    var tableSize = $_31s39uoijm8ldu05.getTableSize(table);
    var warehouse = getWarehouse$1(list);
    var widths = tableSize.getWidths(warehouse, direction, tableSize);
    var newSizes = $_a3n7n5ohjm8ldtzy.recalculateWidth(warehouse, widths);
    each(newSizes, function (cell) {
      tableSize.setElementWidth(cell.element(), cell.width());
    });
    var total = foldr(widths, function (b, a) {
      return a + b;
    }, 0);
    if (newSizes.length > 0) {
      tableSize.setElementWidth(table, total);
    }
  };
  var $_86kxayocjm8ldtz1 = {
    adjustWidth: adjustWidth,
    adjustHeight: adjustHeight,
    adjustWidthTo: adjustWidthTo
  };

  var prune = function (table) {
    var cells = $_b4ktmplcjm8ldtd5.cells(table);
    if (cells.length === 0)
      $_dpqucgmdjm8ldtio.remove(table);
  };
  var outcome = Immutable('grid', 'cursor');
  var elementFromGrid = function (grid, row, column) {
    return findIn(grid, row, column).orThunk(function () {
      return findIn(grid, 0, 0);
    });
  };
  var findIn = function (grid, row, column) {
    return Option.from(grid[row]).bind(function (r) {
      return Option.from(r.cells()[column]).bind(function (c) {
        return Option.from(c.element());
      });
    });
  };
  var bundle = function (grid, row, column) {
    return outcome(grid, findIn(grid, row, column));
  };
  var uniqueRows = function (details) {
    return foldl(details, function (rest, detail) {
      return exists(rest, function (currentDetail) {
        return currentDetail.row() === detail.row();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.row() - detailB.row();
    });
  };
  var uniqueColumns = function (details) {
    return foldl(details, function (rest, detail) {
      return exists(rest, function (currentDetail) {
        return currentDetail.column() === detail.column();
      }) ? rest : rest.concat([detail]);
    }, []).sort(function (detailA, detailB) {
      return detailA.column() - detailB.column();
    });
  };
  var insertRowBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row();
    var newGrid = $_tr4zcoajm8ldtys.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsBefore = function (grid, details, comparator, genWrappers) {
    var example = details[0].row();
    var targetIndex = details[0].row();
    var rows = uniqueRows(details);
    var newGrid = foldl(rows, function (newGrid, _row) {
      return $_tr4zcoajm8ldtys.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertRowAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.row();
    var targetIndex = detail.row() + detail.rowspan();
    var newGrid = $_tr4zcoajm8ldtys.insertRowAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, targetIndex, detail.column());
  };
  var insertRowsAfter = function (grid, details, comparator, genWrappers) {
    var rows = uniqueRows(details);
    var example = rows[rows.length - 1].row();
    var targetIndex = rows[rows.length - 1].row() + rows[rows.length - 1].rowspan();
    var newGrid = foldl(rows, function (newGrid, _row) {
      return $_tr4zcoajm8ldtys.insertRowAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, targetIndex, details[0].column());
  };
  var insertColumnBefore = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column();
    var newGrid = $_tr4zcoajm8ldtys.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsBefore = function (grid, details, comparator, genWrappers) {
    var columns = uniqueColumns(details);
    var example = columns[0].column();
    var targetIndex = columns[0].column();
    var newGrid = foldl(columns, function (newGrid, _row) {
      return $_tr4zcoajm8ldtys.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var insertColumnAfter = function (grid, detail, comparator, genWrappers) {
    var example = detail.column();
    var targetIndex = detail.column() + detail.colspan();
    var newGrid = $_tr4zcoajm8ldtys.insertColumnAt(grid, targetIndex, example, comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), targetIndex);
  };
  var insertColumnsAfter = function (grid, details, comparator, genWrappers) {
    var example = details[details.length - 1].column();
    var targetIndex = details[details.length - 1].column() + details[details.length - 1].colspan();
    var columns = uniqueColumns(details);
    var newGrid = foldl(columns, function (newGrid, _row) {
      return $_tr4zcoajm8ldtys.insertColumnAt(newGrid, targetIndex, example, comparator, genWrappers.getOrInit);
    }, grid);
    return bundle(newGrid, details[0].row(), targetIndex);
  };
  var makeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_b9c6c4objm8ldtyx.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var makeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_b9c6c4objm8ldtyx.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeRowHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_b9c6c4objm8ldtyx.replaceRow(grid, detail.row(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var unmakeColumnHeader = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_b9c6c4objm8ldtyx.replaceColumn(grid, detail.column(), comparator, genWrappers.replaceOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoColumns$1 = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_tr4zcoajm8ldtys.splitCellIntoColumns(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var splitCellIntoRows$1 = function (grid, detail, comparator, genWrappers) {
    var newGrid = $_tr4zcoajm8ldtys.splitCellIntoRows(grid, detail.row(), detail.column(), comparator, genWrappers.getOrInit);
    return bundle(newGrid, detail.row(), detail.column());
  };
  var eraseColumns = function (grid, details, comparator, _genWrappers) {
    var columns = uniqueColumns(details);
    var newGrid = $_tr4zcoajm8ldtys.deleteColumnsAt(grid, columns[0].column(), columns[columns.length - 1].column());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var eraseRows = function (grid, details, comparator, _genWrappers) {
    var rows = uniqueRows(details);
    var newGrid = $_tr4zcoajm8ldtys.deleteRowsAt(grid, rows[0].row(), rows[rows.length - 1].row());
    var cursor = elementFromGrid(newGrid, details[0].row(), details[0].column());
    return outcome(newGrid, cursor);
  };
  var mergeCells = function (grid, mergable, comparator, _genWrappers) {
    var cells = mergable.cells();
    $_axt916nmjm8ldtta.merge(cells);
    var newGrid = $_angx4eo9jm8ldtyk.merge(grid, mergable.bounds(), comparator, constant(cells[0]));
    return outcome(newGrid, Option.from(cells[0]));
  };
  var unmergeCells = function (grid, unmergable, comparator, genWrappers) {
    var newGrid = foldr(unmergable, function (b, cell) {
      return $_angx4eo9jm8ldtyk.unmerge(b, cell, comparator, genWrappers.combine(cell));
    }, grid);
    return outcome(newGrid, Option.from(unmergable[0]));
  };
  var pasteCells = function (grid, pasteDetails, comparator, genWrappers) {
    var gridify = function (table, generators) {
      var list = $_act3unlajm8ldtcq.fromTable(table);
      var wh = $_fciyglm9jm8ldthy.generate(list);
      return $_5cuh00nsjm8ldtv0.toGrid(wh, generators, true);
    };
    var gridB = gridify(pasteDetails.clipboard(), pasteDetails.generators());
    var startAddress = $_18gj1tlbjm8ldtd1.address(pasteDetails.row(), pasteDetails.column());
    var mergedGrid = $_4n4svqo6jm8ldtxz.merge(startAddress, grid, gridB, pasteDetails.generators(), comparator);
    return mergedGrid.fold(function () {
      return outcome(grid, Option.some(pasteDetails.element()));
    }, function (nuGrid) {
      var cursor = elementFromGrid(nuGrid, pasteDetails.row(), pasteDetails.column());
      return outcome(nuGrid, cursor);
    });
  };
  var gridifyRows = function (rows, generators, example) {
    var pasteDetails = $_act3unlajm8ldtcq.fromPastedRows(rows, example);
    var wh = $_fciyglm9jm8ldthy.generate(pasteDetails);
    return $_5cuh00nsjm8ldtv0.toGrid(wh, generators, true);
  };
  var pasteRowsBefore = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[0].row();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_4n4svqo6jm8ldtxz.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var pasteRowsAfter = function (grid, pasteDetails, comparator, genWrappers) {
    var example = grid[pasteDetails.cells[0].row()];
    var index = pasteDetails.cells[pasteDetails.cells.length - 1].row() + pasteDetails.cells[pasteDetails.cells.length - 1].rowspan();
    var gridB = gridifyRows(pasteDetails.clipboard(), pasteDetails.generators(), example);
    var mergedGrid = $_4n4svqo6jm8ldtxz.insert(index, grid, gridB, pasteDetails.generators(), comparator);
    var cursor = elementFromGrid(mergedGrid, pasteDetails.cells[0].row(), pasteDetails.cells[0].column());
    return outcome(mergedGrid, cursor);
  };
  var resize = $_86kxayocjm8ldtz1.adjustWidthTo;
  var $_fibo27nijm8ldts3 = {
    insertRowBefore: $_fqyf5bnpjm8ldtud.run(insertRowBefore, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.modification),
    insertRowsBefore: $_fqyf5bnpjm8ldtud.run(insertRowsBefore, $_fqyf5bnpjm8ldtud.onCells, noop, noop, $_9f4flvnjjm8ldtso.modification),
    insertRowAfter: $_fqyf5bnpjm8ldtud.run(insertRowAfter, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.modification),
    insertRowsAfter: $_fqyf5bnpjm8ldtud.run(insertRowsAfter, $_fqyf5bnpjm8ldtud.onCells, noop, noop, $_9f4flvnjjm8ldtso.modification),
    insertColumnBefore: $_fqyf5bnpjm8ldtud.run(insertColumnBefore, $_fqyf5bnpjm8ldtud.onCell, resize, noop, $_9f4flvnjjm8ldtso.modification),
    insertColumnsBefore: $_fqyf5bnpjm8ldtud.run(insertColumnsBefore, $_fqyf5bnpjm8ldtud.onCells, resize, noop, $_9f4flvnjjm8ldtso.modification),
    insertColumnAfter: $_fqyf5bnpjm8ldtud.run(insertColumnAfter, $_fqyf5bnpjm8ldtud.onCell, resize, noop, $_9f4flvnjjm8ldtso.modification),
    insertColumnsAfter: $_fqyf5bnpjm8ldtud.run(insertColumnsAfter, $_fqyf5bnpjm8ldtud.onCells, resize, noop, $_9f4flvnjjm8ldtso.modification),
    splitCellIntoColumns: $_fqyf5bnpjm8ldtud.run(splitCellIntoColumns$1, $_fqyf5bnpjm8ldtud.onCell, resize, noop, $_9f4flvnjjm8ldtso.modification),
    splitCellIntoRows: $_fqyf5bnpjm8ldtud.run(splitCellIntoRows$1, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.modification),
    eraseColumns: $_fqyf5bnpjm8ldtud.run(eraseColumns, $_fqyf5bnpjm8ldtud.onCells, resize, prune, $_9f4flvnjjm8ldtso.modification),
    eraseRows: $_fqyf5bnpjm8ldtud.run(eraseRows, $_fqyf5bnpjm8ldtud.onCells, noop, prune, $_9f4flvnjjm8ldtso.modification),
    makeColumnHeader: $_fqyf5bnpjm8ldtud.run(makeColumnHeader, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.transform('row', 'th')),
    unmakeColumnHeader: $_fqyf5bnpjm8ldtud.run(unmakeColumnHeader, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.transform(null, 'td')),
    makeRowHeader: $_fqyf5bnpjm8ldtud.run(makeRowHeader, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.transform('col', 'th')),
    unmakeRowHeader: $_fqyf5bnpjm8ldtud.run(unmakeRowHeader, $_fqyf5bnpjm8ldtud.onCell, noop, noop, $_9f4flvnjjm8ldtso.transform(null, 'td')),
    mergeCells: $_fqyf5bnpjm8ldtud.run(mergeCells, $_fqyf5bnpjm8ldtud.onMergable, noop, noop, $_9f4flvnjjm8ldtso.merging),
    unmergeCells: $_fqyf5bnpjm8ldtud.run(unmergeCells, $_fqyf5bnpjm8ldtud.onUnmergable, resize, noop, $_9f4flvnjjm8ldtso.merging),
    pasteCells: $_fqyf5bnpjm8ldtud.run(pasteCells, $_fqyf5bnpjm8ldtud.onPaste, resize, noop, $_9f4flvnjjm8ldtso.modification),
    pasteRowsBefore: $_fqyf5bnpjm8ldtud.run(pasteRowsBefore, $_fqyf5bnpjm8ldtud.onPasteRows, noop, noop, $_9f4flvnjjm8ldtso.modification),
    pasteRowsAfter: $_fqyf5bnpjm8ldtud.run(pasteRowsAfter, $_fqyf5bnpjm8ldtud.onPasteRows, noop, noop, $_9f4flvnjjm8ldtso.modification)
  };

  var getBody$1 = function (editor) {
    return Element$$1.fromDom(editor.getBody());
  };
  var getPixelWidth$1 = function (elm) {
    return elm.getBoundingClientRect().width;
  };
  var getPixelHeight = function (elm) {
    return elm.getBoundingClientRect().height;
  };
  var getIsRoot = function (editor) {
    return function (element) {
      return $_ak7uzflkjm8ldtfb.eq(element, getBody$1(editor));
    };
  };
  var removePxSuffix = function (size) {
    return size ? size.replace(/px$/, '') : '';
  };
  var addSizeSuffix = function (size) {
    if (/^[0-9]+$/.test(size)) {
      size += 'px';
    }
    return size;
  };
  var removeDataStyle = function (table) {
    var dataStyleCells = $_emvpc1m3jm8ldth3.descendants(table, 'td[data-mce-style],th[data-mce-style]');
    $_dz8wvwm1jm8ldtgt.remove(table, 'data-mce-style');
    each(dataStyleCells, function (cell) {
      $_dz8wvwm1jm8ldtgt.remove(cell, 'data-mce-style');
    });
  };

  var onDirection = function (isLtr, isRtl) {
    return function (element) {
      return getDirection(element) === 'rtl' ? isRtl : isLtr;
    };
  };
  var getDirection = function (element) {
    return $_dr5b9omajm8ldti8.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
  };
  var $_bqzt5poljm8ldu0v = {
    onDirection: onDirection,
    getDirection: getDirection
  };

  var ltr$1 = { isRtl: constant(false) };
  var rtl$1 = { isRtl: constant(true) };
  var directionAt = function (element) {
    var dir = $_bqzt5poljm8ldu0v.getDirection(element);
    return dir === 'rtl' ? rtl$1 : ltr$1;
  };
  var $_7ns090okjm8ldu0r = { directionAt: directionAt };

  var defaultTableToolbar = [
    'tableprops',
    'tabledelete',
    '|',
    'tableinsertrowbefore',
    'tableinsertrowafter',
    'tabledeleterow',
    '|',
    'tableinsertcolbefore',
    'tableinsertcolafter',
    'tabledeletecol'
  ];
  var defaultStyles = {
    'border-collapse': 'collapse',
    'width': '100%'
  };
  var defaultAttributes = { border: '1' };
  var getDefaultAttributes = function (editor) {
    return editor.getParam('table_default_attributes', defaultAttributes, 'object');
  };
  var getDefaultStyles = function (editor) {
    return editor.getParam('table_default_styles', defaultStyles, 'object');
  };
  var hasTableResizeBars = function (editor) {
    return editor.getParam('table_resize_bars', true, 'boolean');
  };
  var hasTabNavigation = function (editor) {
    return editor.getParam('table_tab_navigation', true, 'boolean');
  };
  var hasAdvancedCellTab = function (editor) {
    return editor.getParam('table_cell_advtab', true, 'boolean');
  };
  var hasAdvancedRowTab = function (editor) {
    return editor.getParam('table_row_advtab', true, 'boolean');
  };
  var hasAdvancedTableTab = function (editor) {
    return editor.getParam('table_advtab', true, 'boolean');
  };
  var hasAppearanceOptions = function (editor) {
    return editor.getParam('table_appearance_options', true, 'boolean');
  };
  var hasTableGrid = function (editor) {
    return editor.getParam('table_grid', true, 'boolean');
  };
  var shouldStyleWithCss = function (editor) {
    return editor.getParam('table_style_by_css', false, 'boolean');
  };
  var getCellClassList = function (editor) {
    return editor.getParam('table_cell_class_list', [], 'array');
  };
  var getRowClassList = function (editor) {
    return editor.getParam('table_row_class_list', [], 'array');
  };
  var getTableClassList = function (editor) {
    return editor.getParam('table_class_list', [], 'array');
  };
  var getColorPickerCallback = function (editor) {
    return editor.getParam('color_picker_callback');
  };
  var isPixelsForced = function (editor) {
    return editor.getParam('table_responsive_width') === false;
  };
  var getCloneElements = function (editor) {
    var cloneElements = editor.getParam('table_clone_elements');
    if (isString(cloneElements)) {
      return Option.some(cloneElements.split(/[ ,]/));
    } else if (Array.isArray(cloneElements)) {
      return Option.some(cloneElements);
    } else {
      return Option.none();
    }
  };
  var hasObjectResizing = function (editor) {
    var objectResizing = editor.getParam('object_resizing', true);
    return objectResizing === 'table' || objectResizing;
  };
  var getToolbar = function (editor) {
    var toolbar = editor.getParam('table_toolbar', defaultTableToolbar);
    if (toolbar === '' || toolbar === false) {
      return [];
    } else if (isString(toolbar)) {
      return toolbar.split(/[ ,]/);
    } else if (isArray(toolbar)) {
      return toolbar;
    } else {
      return [];
    }
  };

  var fireNewRow = function (editor, row) {
    return editor.fire('newrow', { node: row });
  };
  var fireNewCell = function (editor, cell) {
    return editor.fire('newcell', { node: cell });
  };
  var fireObjectResizeStart = function (editor, target, width, height) {
    editor.fire('ObjectResizeStart', {
      target: target,
      width: width,
      height: height
    });
  };
  var fireObjectResized = function (editor, target, width, height) {
    editor.fire('ObjectResized', {
      target: target,
      width: width,
      height: height
    });
  };

  var TableActions = function (editor, lazyWire) {
    var isTableBody = function (editor) {
      return $_aq9fg3m2jm8ldth1.name(getBody$1(editor)) === 'table';
    };
    var lastRowGuard = function (table) {
      var size = $_8fee92nhjm8ldts0.getGridSize(table);
      return isTableBody(editor) === false || size.rows() > 1;
    };
    var lastColumnGuard = function (table) {
      var size = $_8fee92nhjm8ldts0.getGridSize(table);
      return isTableBody(editor) === false || size.columns() > 1;
    };
    var cloneFormats = getCloneElements(editor);
    var execute = function (operation, guard, mutate, lazyWire) {
      return function (table, target) {
        removeDataStyle(table);
        var wire = lazyWire();
        var doc = Element$$1.fromDom(editor.getDoc());
        var direction = TableDirection($_7ns090okjm8ldu0r.directionAt);
        var generators = $_6bcmk9mfjm8ldtiw.cellOperations(mutate, doc, cloneFormats);
        return guard(table) ? operation(wire, table, target, generators, direction).bind(function (result) {
          each(result.newRows(), function (row) {
            fireNewRow(editor, row.dom());
          });
          each(result.newCells(), function (cell) {
            fireNewCell(editor, cell.dom());
          });
          return result.cursor().map(function (cell) {
            var rng = editor.dom.createRng();
            rng.setStart(cell.dom(), 0);
            rng.setEnd(cell.dom(), 0);
            return rng;
          });
        }) : Option.none();
      };
    };
    var deleteRow = execute($_fibo27nijm8ldts3.eraseRows, lastRowGuard, noop, lazyWire);
    var deleteColumn = execute($_fibo27nijm8ldts3.eraseColumns, lastColumnGuard, noop, lazyWire);
    var insertRowsBefore = execute($_fibo27nijm8ldts3.insertRowsBefore, always, noop, lazyWire);
    var insertRowsAfter = execute($_fibo27nijm8ldts3.insertRowsAfter, always, noop, lazyWire);
    var insertColumnsBefore = execute($_fibo27nijm8ldts3.insertColumnsBefore, always, $_3dwhr6n5jm8ldtpv.halve, lazyWire);
    var insertColumnsAfter = execute($_fibo27nijm8ldts3.insertColumnsAfter, always, $_3dwhr6n5jm8ldtpv.halve, lazyWire);
    var mergeCells = execute($_fibo27nijm8ldts3.mergeCells, always, noop, lazyWire);
    var unmergeCells = execute($_fibo27nijm8ldts3.unmergeCells, always, noop, lazyWire);
    var pasteRowsBefore = execute($_fibo27nijm8ldts3.pasteRowsBefore, always, noop, lazyWire);
    var pasteRowsAfter = execute($_fibo27nijm8ldts3.pasteRowsAfter, always, noop, lazyWire);
    var pasteCells = execute($_fibo27nijm8ldts3.pasteCells, always, noop, lazyWire);
    return {
      deleteRow: deleteRow,
      deleteColumn: deleteColumn,
      insertRowsBefore: insertRowsBefore,
      insertRowsAfter: insertRowsAfter,
      insertColumnsBefore: insertColumnsBefore,
      insertColumnsAfter: insertColumnsAfter,
      mergeCells: mergeCells,
      unmergeCells: unmergeCells,
      pasteRowsBefore: pasteRowsBefore,
      pasteRowsAfter: pasteRowsAfter,
      pasteCells: pasteCells
    };
  };

  var copyRows = function (table, target, generators) {
    var list = $_act3unlajm8ldtcq.fromTable(table);
    var house = $_fciyglm9jm8ldthy.generate(list);
    var details = $_fqyf5bnpjm8ldtud.onCells(house, target);
    return details.map(function (selectedCells) {
      var grid = $_5cuh00nsjm8ldtv0.toGrid(house, generators, false);
      var slicedGrid = grid.slice(selectedCells[0].row(), selectedCells[selectedCells.length - 1].row() + selectedCells[selectedCells.length - 1].rowspan());
      var slicedDetails = $_fqyf5bnpjm8ldtud.toDetailList(slicedGrid, generators);
      return $_cnlw7onvjm8ldtvg.copy(slicedDetails);
    });
  };
  var $_84vnyaopjm8ldu1p = { copyRows: copyRows };

  var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');

  var getTDTHOverallStyle = function (dom, elm, name) {
    var cells = dom.select('td,th', elm);
    var firstChildStyle;
    var checkChildren = function (firstChildStyle, elms) {
      for (var i = 0; i < elms.length; i++) {
        var currentStyle = dom.getStyle(elms[i], name);
        if (typeof firstChildStyle === 'undefined') {
          firstChildStyle = currentStyle;
        }
        if (firstChildStyle !== currentStyle) {
          return '';
        }
      }
      return firstChildStyle;
    };
    firstChildStyle = checkChildren(firstChildStyle, cells);
    return firstChildStyle;
  };
  var applyAlign = function (editor, elm, name) {
    if (name) {
      editor.formatter.apply('align' + name, {}, elm);
    }
  };
  var applyVAlign = function (editor, elm, name) {
    if (name) {
      editor.formatter.apply('valign' + name, {}, elm);
    }
  };
  var unApplyAlign = function (editor, elm) {
    global$1.each('left center right'.split(' '), function (name) {
      editor.formatter.remove('align' + name, {}, elm);
    });
  };
  var unApplyVAlign = function (editor, elm) {
    global$1.each('top middle bottom'.split(' '), function (name) {
      editor.formatter.remove('valign' + name, {}, elm);
    });
  };
  var $_1dlldmosjm8ldu1z = {
    applyAlign: applyAlign,
    applyVAlign: applyVAlign,
    unApplyAlign: unApplyAlign,
    unApplyVAlign: unApplyVAlign,
    getTDTHOverallStyle: getTDTHOverallStyle
  };

  var buildListItems = function (inputList, itemCallback, startItems) {
    var appendItems = function (values, output) {
      output = output || [];
      global$1.each(values, function (item) {
        var menuItem = { text: item.text || item.title };
        if (item.menu) {
          menuItem.menu = appendItems(item.menu);
        } else {
          menuItem.value = item.value;
          if (itemCallback) {
            itemCallback(menuItem);
          }
        }
        output.push(menuItem);
      });
      return output;
    };
    return appendItems(inputList, startItems || []);
  };
  function styleFieldHasFocus(e) {
    return e.control.rootControl.find('#style')[0].getEl().isEqualNode(document.activeElement);
  }
  var syncAdvancedStyleFields = function (editor, evt) {
    if (styleFieldHasFocus(evt)) {
      updateAdvancedFields(editor, evt);
    } else {
      updateStyleField(editor, evt);
    }
  };
  var updateStyleField = function (editor, evt) {
    var dom = editor.dom;
    var rootControl = evt.control.rootControl;
    var data = rootControl.toJSON();
    var css = dom.parseStyle(data.style);
    css['border-style'] = data.borderStyle;
    css['border-color'] = data.borderColor;
    css['background-color'] = data.backgroundColor;
    css.width = data.width ? addSizeSuffix(data.width) : '';
    css.height = data.height ? addSizeSuffix(data.height) : '';
    rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
  };
  var updateAdvancedFields = function (editor, evt) {
    var dom = editor.dom;
    var rootControl = evt.control.rootControl;
    var data = rootControl.toJSON();
    var css = dom.parseStyle(data.style);
    rootControl.find('#borderStyle').value(css['border-style'] || '');
    rootControl.find('#borderColor').value(css['border-color'] || '');
    rootControl.find('#backgroundColor').value(css['background-color'] || '');
    rootControl.find('#width').value(css.width || '');
    rootControl.find('#height').value(css.height || '');
  };
  var extractAdvancedStyles = function (dom, elm) {
    var css = dom.parseStyle(dom.getAttrib(elm, 'style'));
    var data = {};
    if (css['border-style']) {
      data.borderStyle = css['border-style'];
    }
    if (css['border-color']) {
      data.borderColor = css['border-color'];
    }
    if (css['background-color']) {
      data.backgroundColor = css['background-color'];
    }
    data.style = dom.serializeStyle(css);
    return data;
  };
  var createStyleForm = function (editor) {
    var createColorPickAction = function () {
      var colorPickerCallback = getColorPickerCallback(editor);
      if (colorPickerCallback) {
        return function (evt) {
          return colorPickerCallback.call(editor, function (value) {
            evt.control.value(value).fire('change');
          }, evt.control.value());
        };
      }
    };
    return {
      title: 'Advanced',
      type: 'form',
      defaults: { onchange: curry(updateStyleField, editor) },
      items: [
        {
          label: 'Style',
          name: 'style',
          type: 'textbox',
          onchange: curry(updateAdvancedFields, editor)
        },
        {
          type: 'form',
          padding: 0,
          formItemDefaults: {
            layout: 'grid',
            alignH: [
              'start',
              'right'
            ]
          },
          defaults: { size: 7 },
          items: [
            {
              label: 'Border style',
              type: 'listbox',
              name: 'borderStyle',
              width: 90,
              onselect: curry(updateStyleField, editor),
              values: [
                {
                  text: 'Select...',
                  value: ''
                },
                {
                  text: 'Solid',
                  value: 'solid'
                },
                {
                  text: 'Dotted',
                  value: 'dotted'
                },
                {
                  text: 'Dashed',
                  value: 'dashed'
                },
                {
                  text: 'Double',
                  value: 'double'
                },
                {
                  text: 'Groove',
                  value: 'groove'
                },
                {
                  text: 'Ridge',
                  value: 'ridge'
                },
                {
                  text: 'Inset',
                  value: 'inset'
                },
                {
                  text: 'Outset',
                  value: 'outset'
                },
                {
                  text: 'None',
                  value: 'none'
                },
                {
                  text: 'Hidden',
                  value: 'hidden'
                }
              ]
            },
            {
              label: 'Border color',
              type: 'colorbox',
              name: 'borderColor',
              onaction: createColorPickAction()
            },
            {
              label: 'Background color',
              type: 'colorbox',
              name: 'backgroundColor',
              onaction: createColorPickAction()
            }
          ]
        }
      ]
    };
  };
  var $_gggqsotjm8ldu21 = {
    createStyleForm: createStyleForm,
    buildListItems: buildListItems,
    updateStyleField: updateStyleField,
    extractAdvancedStyles: extractAdvancedStyles,
    updateAdvancedFields: updateAdvancedFields,
    syncAdvancedStyleFields: syncAdvancedStyleFields
  };

  var updateStyles = function (elm, cssText) {
    delete elm.dataset.mceStyle;
    elm.style.cssText += ';' + cssText;
  };
  var extractDataFromElement = function (editor, elm) {
    var dom = editor.dom;
    var data = {
      width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
      height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
      scope: dom.getAttrib(elm, 'scope'),
      class: dom.getAttrib(elm, 'class'),
      type: elm.nodeName.toLowerCase(),
      style: '',
      align: '',
      valign: ''
    };
    global$1.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'align' + name)) {
        data.align = name;
      }
    });
    global$1.each('top middle bottom'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'valign' + name)) {
        data.valign = name;
      }
    });
    if (hasAdvancedCellTab(editor)) {
      global$1.extend(data, $_gggqsotjm8ldu21.extractAdvancedStyles(dom, elm));
    }
    return data;
  };
  var onSubmitCellForm = function (editor, cells, evt) {
    var dom = editor.dom;
    var data;
    function setAttrib(elm, name, value) {
      if (value) {
        dom.setAttrib(elm, name, value);
      }
    }
    function setStyle(elm, name, value) {
      if (value) {
        dom.setStyle(elm, name, value);
      }
    }
    if (hasAdvancedCellTab(editor)) {
      $_gggqsotjm8ldu21.syncAdvancedStyleFields(editor, evt);
    }
    data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      global$1.each(cells, function (cellElm) {
        setAttrib(cellElm, 'scope', data.scope);
        if (cells.length === 1) {
          setAttrib(cellElm, 'style', data.style);
        } else {
          updateStyles(cellElm, data.style);
        }
        setAttrib(cellElm, 'class', data.class);
        setStyle(cellElm, 'width', addSizeSuffix(data.width));
        setStyle(cellElm, 'height', addSizeSuffix(data.height));
        if (data.type && cellElm.nodeName.toLowerCase() !== data.type) {
          cellElm = dom.rename(cellElm, data.type);
        }
        if (cells.length === 1) {
          $_1dlldmosjm8ldu1z.unApplyAlign(editor, cellElm);
          $_1dlldmosjm8ldu1z.unApplyVAlign(editor, cellElm);
        }
        if (data.align) {
          $_1dlldmosjm8ldu1z.applyAlign(editor, cellElm, data.align);
        }
        if (data.valign) {
          $_1dlldmosjm8ldu1z.applyVAlign(editor, cellElm, data.valign);
        }
      });
      editor.focus();
    });
  };
  var open = function (editor) {
    var cellElm, data, classListCtrl, cells = [];
    cells = editor.dom.select('td[data-mce-selected],th[data-mce-selected]');
    cellElm = editor.dom.getParent(editor.selection.getStart(), 'td,th');
    if (!cells.length && cellElm) {
      cells.push(cellElm);
    }
    cellElm = cellElm || cells[0];
    if (!cellElm) {
      return;
    }
    if (cells.length > 1) {
      data = {
        width: '',
        height: '',
        scope: '',
        class: '',
        align: '',
        valign: '',
        style: '',
        type: cellElm.nodeName.toLowerCase()
      };
    } else {
      data = extractDataFromElement(editor, cellElm);
    }
    if (getCellClassList(editor).length > 0) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Style',
        values: $_gggqsotjm8ldu21.buildListItems(getCellClassList(editor), function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'td',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    var generalCellForm = {
      type: 'form',
      layout: 'flex',
      direction: 'column',
      labelGapCalc: 'children',
      padding: 0,
      items: [
        {
          type: 'form',
          layout: 'grid',
          columns: 2,
          labelGapCalc: false,
          padding: 0,
          defaults: {
            type: 'textbox',
            maxWidth: 50
          },
          items: [
            {
              label: 'Cell type',
              name: 'type',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'Cell',
                  value: 'td'
                },
                {
                  text: 'Header cell',
                  value: 'th'
                }
              ]
            },
            {
              label: 'Scope',
              name: 'scope',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Row',
                  value: 'row'
                },
                {
                  text: 'Column',
                  value: 'col'
                },
                {
                  text: 'Row group',
                  value: 'rowgroup'
                },
                {
                  text: 'Column group',
                  value: 'colgroup'
                }
              ]
            },
            {
              label: 'H Align',
              name: 'align',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Left',
                  value: 'left'
                },
                {
                  text: 'Center',
                  value: 'center'
                },
                {
                  text: 'Right',
                  value: 'right'
                }
              ]
            },
            {
              label: 'V Align',
              name: 'valign',
              type: 'listbox',
              text: 'None',
              minWidth: 90,
              maxWidth: null,
              values: [
                {
                  text: 'None',
                  value: ''
                },
                {
                  text: 'Top',
                  value: 'top'
                },
                {
                  text: 'Middle',
                  value: 'middle'
                },
                {
                  text: 'Bottom',
                  value: 'bottom'
                }
              ]
            }
          ]
        },
        classListCtrl
      ]
    };
    if (hasAdvancedCellTab(editor)) {
      editor.windowManager.open({
        title: 'Cell properties',
        bodyType: 'tabpanel',
        data: data,
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalCellForm
          },
          $_gggqsotjm8ldu21.createStyleForm(editor)
        ],
        onsubmit: curry(onSubmitCellForm, editor, cells)
      });
    } else {
      editor.windowManager.open({
        title: 'Cell properties',
        data: data,
        body: generalCellForm,
        onsubmit: curry(onSubmitCellForm, editor, cells)
      });
    }
  };
  var $_ezc6xtorjm8ldu1s = { open: open };

  var extractDataFromElement$1 = function (editor, elm) {
    var dom = editor.dom;
    var data = {
      scope: dom.getAttrib(elm, 'scope'),
      class: dom.getAttrib(elm, 'class'),
      align: '',
      style: '',
      type: elm.parentNode.nodeName.toLowerCase()
    };
    global$1.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(elm, 'align' + name)) {
        data.align = name;
      }
    });
    if (hasAdvancedRowTab(editor)) {
      global$1.extend(data, $_gggqsotjm8ldu21.extractAdvancedStyles(dom, elm));
    }
    return data;
  };
  var switchRowType = function (dom, rowElm, toType) {
    var tableElm = dom.getParent(rowElm, 'table');
    var oldParentElm = rowElm.parentNode;
    var parentElm = dom.select(toType, tableElm)[0];
    if (!parentElm) {
      parentElm = dom.create(toType);
      if (tableElm.firstChild) {
        if (tableElm.firstChild.nodeName === 'CAPTION') {
          dom.insertAfter(parentElm, tableElm.firstChild);
        } else {
          tableElm.insertBefore(parentElm, tableElm.firstChild);
        }
      } else {
        tableElm.appendChild(parentElm);
      }
    }
    parentElm.appendChild(rowElm);
    if (!oldParentElm.hasChildNodes()) {
      dom.remove(oldParentElm);
    }
  };
  function onSubmitRowForm(editor, rows, oldData, evt) {
    var dom = editor.dom;
    function setAttrib(elm, name, value) {
      if (rows.length === 1 || value) {
        dom.setAttrib(elm, name, value);
      }
    }
    if (hasAdvancedRowTab(editor)) {
      $_gggqsotjm8ldu21.syncAdvancedStyleFields(editor, evt);
    }
    var data = evt.control.rootControl.toJSON();
    editor.undoManager.transact(function () {
      global$1.each(rows, function (rowElm) {
        setAttrib(rowElm, 'scope', data.scope);
        setAttrib(rowElm, 'style', data.style);
        setAttrib(rowElm, 'class', data.class);
        if (data.type !== rowElm.parentNode.nodeName.toLowerCase()) {
          switchRowType(editor.dom, rowElm, data.type);
        }
        if (data.align !== oldData.align) {
          $_1dlldmosjm8ldu1z.unApplyAlign(editor, rowElm);
          $_1dlldmosjm8ldu1z.applyAlign(editor, rowElm, data.align);
        }
      });
      editor.focus();
    });
  }
  var open$1 = function (editor) {
    var dom = editor.dom;
    var tableElm, cellElm, rowElm, classListCtrl, data;
    var rows = [];
    var generalRowForm;
    tableElm = dom.getParent(editor.selection.getStart(), 'table');
    cellElm = dom.getParent(editor.selection.getStart(), 'td,th');
    global$1.each(tableElm.rows, function (row) {
      global$1.each(row.cells, function (cell) {
        if (dom.getAttrib(cell, 'data-mce-selected') || cell === cellElm) {
          rows.push(row);
          return false;
        }
      });
    });
    rowElm = rows[0];
    if (!rowElm) {
      return;
    }
    if (rows.length > 1) {
      data = {
        scope: '',
        style: '',
        class: '',
        align: '',
        type: rowElm.parentNode.nodeName.toLowerCase()
      };
    } else {
      data = extractDataFromElement$1(editor, rowElm);
    }
    if (getRowClassList(editor).length > 0) {
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Style',
        values: $_gggqsotjm8ldu21.buildListItems(getRowClassList(editor), function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'tr',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    generalRowForm = {
      type: 'form',
      columns: 2,
      padding: 0,
      defaults: { type: 'textbox' },
      items: [
        {
          type: 'listbox',
          name: 'type',
          label: 'Row type',
          text: 'Header',
          maxWidth: null,
          values: [
            {
              text: 'Header',
              value: 'thead'
            },
            {
              text: 'Body',
              value: 'tbody'
            },
            {
              text: 'Footer',
              value: 'tfoot'
            }
          ]
        },
        {
          type: 'listbox',
          name: 'align',
          label: 'Alignment',
          text: 'None',
          maxWidth: null,
          values: [
            {
              text: 'None',
              value: ''
            },
            {
              text: 'Left',
              value: 'left'
            },
            {
              text: 'Center',
              value: 'center'
            },
            {
              text: 'Right',
              value: 'right'
            }
          ]
        },
        classListCtrl
      ]
    };
    if (hasAdvancedRowTab(editor)) {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        bodyType: 'tabpanel',
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalRowForm
          },
          $_gggqsotjm8ldu21.createStyleForm(editor)
        ],
        onsubmit: curry(onSubmitRowForm, editor, rows, data)
      });
    } else {
      editor.windowManager.open({
        title: 'Row properties',
        data: data,
        body: generalRowForm,
        onsubmit: curry(onSubmitRowForm, editor, rows, data)
      });
    }
  };
  var $_8sea73oujm8ldu28 = { open: open$1 };

  var global$2 = tinymce.util.Tools.resolve('tinymce.Env');

  var DefaultRenderOptions = {
    styles: {
      'border-collapse': 'collapse',
      width: '100%'
    },
    attributes: { border: '1' },
    percentages: true
  };
  var makeTable = function () {
    return Element$$1.fromTag('table');
  };
  var tableBody = function () {
    return Element$$1.fromTag('tbody');
  };
  var tableRow = function () {
    return Element$$1.fromTag('tr');
  };
  var tableHeaderCell = function () {
    return Element$$1.fromTag('th');
  };
  var tableCell = function () {
    return Element$$1.fromTag('td');
  };
  var render$1 = function (rows, columns, rowHeaders, columnHeaders, renderOpts) {
    if (renderOpts === void 0) {
      renderOpts = DefaultRenderOptions;
    }
    var table = makeTable();
    $_dr5b9omajm8ldti8.setAll(table, renderOpts.styles);
    $_dz8wvwm1jm8ldtgt.setAll(table, renderOpts.attributes);
    var tbody = tableBody();
    $_a4o6jqmcjm8ldtin.append(table, tbody);
    var trs = [];
    for (var i = 0; i < rows; i++) {
      var tr = tableRow();
      for (var j = 0; j < columns; j++) {
        var td = i < rowHeaders || j < columnHeaders ? tableHeaderCell() : tableCell();
        if (j < columnHeaders) {
          $_dz8wvwm1jm8ldtgt.set(td, 'scope', 'row');
        }
        if (i < rowHeaders) {
          $_dz8wvwm1jm8ldtgt.set(td, 'scope', 'col');
        }
        $_a4o6jqmcjm8ldtin.append(td, Element$$1.fromTag('br'));
        if (renderOpts.percentages) {
          $_dr5b9omajm8ldti8.set(td, 'width', 100 / columns + '%');
        }
        $_a4o6jqmcjm8ldtin.append(tr, td);
      }
      trs.push(tr);
    }
    $_6j2l8wmejm8ldtis.append(tbody, trs);
    return table;
  };

  var get$7 = function (element) {
    return element.dom().innerHTML;
  };
  var set$5 = function (element, content) {
    var owner = $_8mc5g7lijm8ldtev.owner(element);
    var docDom = owner.dom();
    var fragment = Element$$1.fromDom(docDom.createDocumentFragment());
    var contentElements = $_ai53jzmljm8ldtk8.fromHtml(content, docDom);
    $_6j2l8wmejm8ldtis.append(fragment, contentElements);
    $_dpqucgmdjm8ldtio.empty(element);
    $_a4o6jqmcjm8ldtin.append(element, fragment);
  };
  var getOuter$2 = function (element) {
    var container = Element$$1.fromTag('div');
    var clone = Element$$1.fromDom(element.dom().cloneNode(true));
    $_a4o6jqmcjm8ldtin.append(container, clone);
    return get$7(container);
  };
  var $_e29qfip0jm8ldu3m = {
    get: get$7,
    set: set$5,
    getOuter: getOuter$2
  };

  var placeCaretInCell = function (editor, cell) {
    editor.selection.select(cell.dom(), true);
    editor.selection.collapse(true);
  };
  var selectFirstCellInTable = function (editor, tableElm) {
    $_6mmdzsm6jm8ldthg.descendant(tableElm, 'td,th').each(curry(placeCaretInCell, editor));
  };
  var fireEvents = function (editor, table) {
    each($_emvpc1m3jm8ldth3.descendants(table, 'tr'), function (row) {
      fireNewRow(editor, row.dom());
      each($_emvpc1m3jm8ldth3.descendants(row, 'th,td'), function (cell) {
        fireNewCell(editor, cell.dom());
      });
    });
  };
  var isPercentage = function (width) {
    return isString(width) && width.indexOf('%') !== -1;
  };
  var insert$1 = function (editor, columns, rows) {
    var defaultStyles = getDefaultStyles(editor);
    var options = {
      styles: defaultStyles,
      attributes: getDefaultAttributes(editor),
      percentages: isPercentage(defaultStyles.width) && !isPixelsForced(editor)
    };
    var table = render$1(rows, columns, 0, 0, options);
    $_dz8wvwm1jm8ldtgt.set(table, 'data-mce-id', '__mce');
    var html = $_e29qfip0jm8ldu3m.getOuter(table);
    editor.insertContent(html);
    return $_6mmdzsm6jm8ldthg.descendant(getBody$1(editor), 'table[data-mce-id="__mce"]').map(function (table) {
      if (isPixelsForced(editor)) {
        $_dr5b9omajm8ldti8.set(table, 'width', $_dr5b9omajm8ldti8.get(table, 'width'));
      }
      $_dz8wvwm1jm8ldtgt.remove(table, 'data-mce-id');
      fireEvents(editor, table);
      selectFirstCellInTable(editor, table);
      return table.dom();
    }).getOr(null);
  };
  var $_9g4jitoxjm8ldu2p = { insert: insert$1 };

  function styleTDTH(dom, elm, name, value) {
    if (elm.tagName === 'TD' || elm.tagName === 'TH') {
      dom.setStyle(elm, name, value);
    } else {
      if (elm.children) {
        for (var i = 0; i < elm.children.length; i++) {
          styleTDTH(dom, elm.children[i], name, value);
        }
      }
    }
  }
  var extractDataFromElement$2 = function (editor, tableElm) {
    var dom = editor.dom;
    var data = {
      width: dom.getStyle(tableElm, 'width') || dom.getAttrib(tableElm, 'width'),
      height: dom.getStyle(tableElm, 'height') || dom.getAttrib(tableElm, 'height'),
      cellspacing: dom.getStyle(tableElm, 'border-spacing') || dom.getAttrib(tableElm, 'cellspacing'),
      cellpadding: dom.getAttrib(tableElm, 'data-mce-cell-padding') || dom.getAttrib(tableElm, 'cellpadding') || $_1dlldmosjm8ldu1z.getTDTHOverallStyle(editor.dom, tableElm, 'padding'),
      border: dom.getAttrib(tableElm, 'data-mce-border') || dom.getAttrib(tableElm, 'border') || $_1dlldmosjm8ldu1z.getTDTHOverallStyle(editor.dom, tableElm, 'border'),
      borderColor: dom.getAttrib(tableElm, 'data-mce-border-color'),
      caption: !!dom.select('caption', tableElm)[0],
      class: dom.getAttrib(tableElm, 'class')
    };
    global$1.each('left center right'.split(' '), function (name) {
      if (editor.formatter.matchNode(tableElm, 'align' + name)) {
        data.align = name;
      }
    });
    if (hasAdvancedTableTab(editor)) {
      global$1.extend(data, $_gggqsotjm8ldu21.extractAdvancedStyles(dom, tableElm));
    }
    return data;
  };
  var applyDataToElement = function (editor, tableElm, data) {
    var dom = editor.dom;
    var attrs = {};
    var styles = {};
    attrs.class = data.class;
    styles.height = addSizeSuffix(data.height);
    if (dom.getAttrib(tableElm, 'width') && !shouldStyleWithCss(editor)) {
      attrs.width = removePxSuffix(data.width);
    } else {
      styles.width = addSizeSuffix(data.width);
    }
    if (shouldStyleWithCss(editor)) {
      styles['border-width'] = addSizeSuffix(data.border);
      styles['border-spacing'] = addSizeSuffix(data.cellspacing);
      global$1.extend(attrs, {
        'data-mce-border-color': data.borderColor,
        'data-mce-cell-padding': data.cellpadding,
        'data-mce-border': data.border
      });
    } else {
      global$1.extend(attrs, {
        border: data.border,
        cellpadding: data.cellpadding,
        cellspacing: data.cellspacing
      });
    }
    if (shouldStyleWithCss(editor)) {
      if (tableElm.children) {
        for (var i = 0; i < tableElm.children.length; i++) {
          styleTDTH(dom, tableElm.children[i], {
            'border-width': addSizeSuffix(data.border),
            'border-color': data.borderColor,
            'padding': addSizeSuffix(data.cellpadding)
          });
        }
      }
    }
    if (data.style) {
      global$1.extend(styles, dom.parseStyle(data.style));
    } else {
      styles = global$1.extend({}, dom.parseStyle(dom.getAttrib(tableElm, 'style')), styles);
    }
    attrs.style = dom.serializeStyle(styles);
    dom.setAttribs(tableElm, attrs);
  };
  var onSubmitTableForm = function (editor, tableElm, evt) {
    var dom = editor.dom;
    var captionElm;
    var data;
    if (hasAdvancedTableTab(editor)) {
      $_gggqsotjm8ldu21.syncAdvancedStyleFields(editor, evt);
    }
    data = evt.control.rootControl.toJSON();
    if (data.class === false) {
      delete data.class;
    }
    editor.undoManager.transact(function () {
      if (!tableElm) {
        tableElm = $_9g4jitoxjm8ldu2p.insert(editor, data.cols || 1, data.rows || 1);
      }
      applyDataToElement(editor, tableElm, data);
      captionElm = dom.select('caption', tableElm)[0];
      if (captionElm && !data.caption) {
        dom.remove(captionElm);
      }
      if (!captionElm && data.caption) {
        captionElm = dom.create('caption');
        captionElm.innerHTML = !global$2.ie ? '<br data-mce-bogus="1"/>' : '\xA0';
        tableElm.insertBefore(captionElm, tableElm.firstChild);
      }
      $_1dlldmosjm8ldu1z.unApplyAlign(editor, tableElm);
      if (data.align) {
        $_1dlldmosjm8ldu1z.applyAlign(editor, tableElm, data.align);
      }
      editor.focus();
      editor.addVisual();
    });
  };
  var open$2 = function (editor, isProps) {
    var dom = editor.dom;
    var tableElm, colsCtrl, rowsCtrl, classListCtrl, data = {}, generalTableForm;
    if (isProps === true) {
      tableElm = dom.getParent(editor.selection.getStart(), 'table');
      if (tableElm) {
        data = extractDataFromElement$2(editor, tableElm);
      }
    } else {
      colsCtrl = {
        label: 'Cols',
        name: 'cols'
      };
      rowsCtrl = {
        label: 'Rows',
        name: 'rows'
      };
    }
    if (getTableClassList(editor).length > 0) {
      if (data.class) {
        data.class = data.class.replace(/\s*mce\-item\-table\s*/g, '');
      }
      classListCtrl = {
        name: 'class',
        type: 'listbox',
        label: 'Style',
        values: $_gggqsotjm8ldu21.buildListItems(getTableClassList(editor), function (item) {
          if (item.value) {
            item.textStyle = function () {
              return editor.formatter.getCssText({
                block: 'table',
                classes: [item.value]
              });
            };
          }
        })
      };
    }
    generalTableForm = {
      type: 'form',
      layout: 'flex',
      direction: 'column',
      labelGapCalc: 'children',
      padding: 0,
      items: [
        {
          type: 'form',
          labelGapCalc: false,
          padding: 0,
          layout: 'grid',
          columns: 2,
          defaults: {
            type: 'textbox',
            maxWidth: 50
          },
          items: hasAppearanceOptions(editor) ? [
            colsCtrl,
            rowsCtrl,
            {
              label: 'Cell spacing',
              name: 'cellspacing'
            },
            {
              label: 'Cell padding',
              name: 'cellpadding'
            },
            {
              label: 'Border',
              name: 'border'
            },
            {
              label: 'Caption',
              name: 'caption',
              type: 'checkbox'
            }
          ] : [
            colsCtrl,
            rowsCtrl
          ]
        },
        {
          label: 'Alignment',
          name: 'align',
          type: 'listbox',
          text: 'None',
          values: [
            {
              text: 'None',
              value: ''
            },
            {
              text: 'Left',
              value: 'left'
            },
            {
              text: 'Center',
              value: 'center'
            },
            {
              text: 'Right',
              value: 'right'
            }
          ]
        },
        classListCtrl
      ]
    };
    if (hasAdvancedTableTab(editor)) {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        bodyType: 'tabpanel',
        body: [
          {
            title: 'General',
            type: 'form',
            items: generalTableForm
          },
          $_gggqsotjm8ldu21.createStyleForm(editor)
        ],
        onsubmit: curry(onSubmitTableForm, editor, tableElm)
      });
    } else {
      editor.windowManager.open({
        title: 'Table properties',
        data: data,
        body: generalTableForm,
        onsubmit: curry(onSubmitTableForm, editor, tableElm)
      });
    }
  };
  var $_2z0hjrovjm8ldu2j = { open: open$2 };

  var each$3 = global$1.each;
  var registerCommands = function (editor, actions, cellSelection, selections, clipboardRows) {
    var isRoot = getIsRoot(editor);
    var eraseTable = function () {
      var cell = Element$$1.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      var table = $_b4ktmplcjm8ldtd5.table(cell, isRoot);
      table.filter(not(isRoot)).each(function (table) {
        var cursor = Element$$1.fromText('');
        $_a4o6jqmcjm8ldtin.after(table, cursor);
        $_dpqucgmdjm8ldtio.remove(table);
        var rng = editor.dom.createRng();
        rng.setStart(cursor.dom(), 0);
        rng.setEnd(cursor.dom(), 0);
        editor.selection.setRng(rng);
      });
    };
    var getSelectionStartCell = function () {
      return Element$$1.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
    };
    var getTableFromCell = function (cell) {
      return $_b4ktmplcjm8ldtd5.table(cell, isRoot);
    };
    var getSize = function (table) {
      return {
        width: getPixelWidth$1(table.dom()),
        height: getPixelWidth$1(table.dom())
      };
    };
    var resizeChange = function (editor, oldSize, table) {
      var newSize = getSize(table);
      if (oldSize.width !== newSize.width || oldSize.height !== newSize.height) {
        fireObjectResizeStart(editor, table.dom(), oldSize.width, oldSize.height);
        fireObjectResized(editor, table.dom(), newSize.width, newSize.height);
      }
    };
    var actOnSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      table.each(function (table) {
        var targets = $_8xltjimmjm8ldtkc.forMenu(selections, table, cell);
        var beforeSize = getSize(table);
        execute(table, targets).each(function (rng) {
          resizeChange(editor, beforeSize, table);
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
          removeDataStyle(table);
        });
      });
    };
    var copyRowSelection = function (execute) {
      var cell = getSelectionStartCell();
      var table = getTableFromCell(cell);
      return table.bind(function (table) {
        var doc = Element$$1.fromDom(editor.getDoc());
        var targets = $_8xltjimmjm8ldtkc.forMenu(selections, table, cell);
        var generators = $_6bcmk9mfjm8ldtiw.cellOperations(noop, doc, Option.none());
        return $_84vnyaopjm8ldu1p.copyRows(table, targets, generators);
      });
    };
    var pasteOnSelection = function (execute) {
      clipboardRows.get().each(function (rows) {
        var clonedRows = map(rows, function (row) {
          return $_ezthd0mgjm8ldtjq.deep(row);
        });
        var cell = getSelectionStartCell();
        var table = getTableFromCell(cell);
        table.bind(function (table) {
          var doc = Element$$1.fromDom(editor.getDoc());
          var generators = $_6bcmk9mfjm8ldtiw.paste(doc);
          var targets = $_8xltjimmjm8ldtkc.pasteRows(selections, table, cell, clonedRows, generators);
          execute(table, targets).each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
          });
        });
      });
    };
    each$3({
      mceTableSplitCells: function () {
        actOnSelection(actions.unmergeCells);
      },
      mceTableMergeCells: function () {
        actOnSelection(actions.mergeCells);
      },
      mceTableInsertRowBefore: function () {
        actOnSelection(actions.insertRowsBefore);
      },
      mceTableInsertRowAfter: function () {
        actOnSelection(actions.insertRowsAfter);
      },
      mceTableInsertColBefore: function () {
        actOnSelection(actions.insertColumnsBefore);
      },
      mceTableInsertColAfter: function () {
        actOnSelection(actions.insertColumnsAfter);
      },
      mceTableDeleteCol: function () {
        actOnSelection(actions.deleteColumn);
      },
      mceTableDeleteRow: function () {
        actOnSelection(actions.deleteRow);
      },
      mceTableCutRow: function (grid) {
        clipboardRows.set(copyRowSelection());
        actOnSelection(actions.deleteRow);
      },
      mceTableCopyRow: function (grid) {
        clipboardRows.set(copyRowSelection());
      },
      mceTablePasteRowBefore: function (grid) {
        pasteOnSelection(actions.pasteRowsBefore);
      },
      mceTablePasteRowAfter: function (grid) {
        pasteOnSelection(actions.pasteRowsAfter);
      },
      mceTableDelete: eraseTable
    }, function (func, name) {
      editor.addCommand(name, func);
    });
    each$3({
      mceInsertTable: curry($_2z0hjrovjm8ldu2j.open, editor),
      mceTableProps: curry($_2z0hjrovjm8ldu2j.open, editor, true),
      mceTableRowProps: curry($_8sea73oujm8ldu28.open, editor),
      mceTableCellProps: curry($_ezc6xtorjm8ldu1s.open, editor)
    }, function (func, name) {
      editor.addCommand(name, function (ui, val) {
        func(val);
      });
    });
  };
  var $_65378coojm8ldu15 = { registerCommands: registerCommands };

  var only$1 = function (element) {
    var parent = Option.from(element.dom().documentElement).map(Element$$1.fromDom).getOr(element);
    return {
      parent: constant(parent),
      view: constant(element),
      origin: constant(Position(0, 0))
    };
  };
  var detached = function (editable, chrome) {
    var origin = curry($_9noskinejm8ldtrq.absolute, chrome);
    return {
      parent: constant(chrome),
      view: constant(editable),
      origin: origin
    };
  };
  var body$1 = function (editable, chrome) {
    return {
      parent: constant(chrome),
      view: constant(editable),
      origin: constant(Position(0, 0))
    };
  };
  var $_9wronop2jm8ldu40 = {
    only: only$1,
    detached: detached,
    body: body$1
  };

  function Event (fields) {
    var struct = Immutable.apply(null, fields);
    var handlers = [];
    var bind$$1 = function (handler) {
      if (handler === undefined) {
        throw 'Event bind error: undefined handler';
      }
      handlers.push(handler);
    };
    var unbind = function (handler) {
      handlers = filter(handlers, function (h) {
        return h !== handler;
      });
    };
    var trigger = function () {
      var event = struct.apply(null, arguments);
      each(handlers, function (handler) {
        handler(event);
      });
    };
    return {
      bind: bind$$1,
      unbind: unbind,
      trigger: trigger
    };
  }

  var create = function (typeDefs) {
    var registry = map$1(typeDefs, function (event) {
      return {
        bind: event.bind,
        unbind: event.unbind
      };
    });
    var trigger = map$1(typeDefs, function (event) {
      return event.trigger;
    });
    return {
      registry: registry,
      trigger: trigger
    };
  };
  var $_6742tgp5jm8ldu4w = { create: create };

  var mode = exactly([
    'compare',
    'extract',
    'mutate',
    'sink'
  ]);
  var sink = exactly([
    'element',
    'start',
    'stop',
    'destroy'
  ]);
  var api$3 = exactly([
    'forceDrop',
    'drop',
    'move',
    'delayDrop'
  ]);
  var $_exobzvp9jm8ldu6f = {
    mode: mode,
    sink: sink,
    api: api$3
  };

  var styles$1 = css('ephox-dragster');
  var $_6q41z0pbjm8ldu73 = { resolve: styles$1.resolve };

  function Blocker (options) {
    var settings = merge$1({ 'layerClass': $_6q41z0pbjm8ldu73.resolve('blocker') }, options);
    var div = Element$$1.fromTag('div');
    $_dz8wvwm1jm8ldtgt.set(div, 'role', 'presentation');
    $_dr5b9omajm8ldti8.setAll(div, {
      position: 'fixed',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%'
    });
    $_ersi15o2jm8ldtxp.add(div, $_6q41z0pbjm8ldu73.resolve('blocker'));
    $_ersi15o2jm8ldtxp.add(div, settings.layerClass);
    var element = function () {
      return div;
    };
    var destroy = function () {
      $_dpqucgmdjm8ldtio.remove(div);
    };
    return {
      element: element,
      destroy: destroy
    };
  }

  var mkEvent = function (target, x, y, stop, prevent, kill, raw) {
    return {
      'target': constant(target),
      'x': constant(x),
      'y': constant(y),
      'stop': stop,
      'prevent': prevent,
      'kill': kill,
      'raw': constant(raw)
    };
  };
  var handle = function (filter, handler) {
    return function (rawEvent) {
      if (!filter(rawEvent))
        return;
      var target = Element$$1.fromDom(rawEvent.target);
      var stop = function () {
        rawEvent.stopPropagation();
      };
      var prevent = function () {
        rawEvent.preventDefault();
      };
      var kill = compose(prevent, stop);
      var evt = mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
      handler(evt);
    };
  };
  var binder = function (element, event, filter, handler, useCapture) {
    var wrapped = handle(filter, handler);
    element.dom().addEventListener(event, wrapped, useCapture);
    return { unbind: curry(unbind, element, event, wrapped, useCapture) };
  };
  var bind$1 = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, false);
  };
  var capture = function (element, event, filter, handler) {
    return binder(element, event, filter, handler, true);
  };
  var unbind = function (element, event, handler, useCapture) {
    element.dom().removeEventListener(event, handler, useCapture);
  };
  var $_3n252epdjm8ldu7a = {
    bind: bind$1,
    capture: capture
  };

  var filter$1 = constant(true);
  var bind$2 = function (element, event, handler) {
    return $_3n252epdjm8ldu7a.bind(element, event, filter$1, handler);
  };
  var capture$1 = function (element, event, handler) {
    return $_3n252epdjm8ldu7a.capture(element, event, filter$1, handler);
  };
  var $_4qo3anpcjm8ldu76 = {
    bind: bind$2,
    capture: capture$1
  };

  var compare = function (old, nu) {
    return Position(nu.left() - old.left(), nu.top() - old.top());
  };
  var extract$1 = function (event) {
    return Option.some(Position(event.x(), event.y()));
  };
  var mutate$1 = function (mutation, info) {
    mutation.mutate(info.left(), info.top());
  };
  var sink$1 = function (dragApi, settings) {
    var blocker = Blocker(settings);
    var mdown = $_4qo3anpcjm8ldu76.bind(blocker.element(), 'mousedown', dragApi.forceDrop);
    var mup = $_4qo3anpcjm8ldu76.bind(blocker.element(), 'mouseup', dragApi.drop);
    var mmove = $_4qo3anpcjm8ldu76.bind(blocker.element(), 'mousemove', dragApi.move);
    var mout = $_4qo3anpcjm8ldu76.bind(blocker.element(), 'mouseout', dragApi.delayDrop);
    var destroy = function () {
      blocker.destroy();
      mup.unbind();
      mmove.unbind();
      mout.unbind();
      mdown.unbind();
    };
    var start = function (parent) {
      $_a4o6jqmcjm8ldtin.append(parent, blocker.element());
    };
    var stop = function () {
      $_dpqucgmdjm8ldtio.remove(blocker.element());
    };
    return $_exobzvp9jm8ldu6f.sink({
      element: blocker.element,
      start: start,
      stop: stop,
      destroy: destroy
    });
  };
  var MouseDrag = $_exobzvp9jm8ldu6f.mode({
    compare: compare,
    extract: extract$1,
    sink: sink$1,
    mutate: mutate$1
  });

  function InDrag () {
    var previous = Option.none();
    var reset = function () {
      previous = Option.none();
    };
    var update = function (mode, nu) {
      var result = previous.map(function (old) {
        return mode.compare(old, nu);
      });
      previous = Option.some(nu);
      return result;
    };
    var onEvent = function (event, mode) {
      var dataOption = mode.extract(event);
      dataOption.each(function (data) {
        var offset = update(mode, data);
        offset.each(function (d) {
          events.trigger.move(d);
        });
      });
    };
    var events = $_6742tgp5jm8ldu4w.create({ move: Event(['info']) });
    return {
      onEvent: onEvent,
      reset: reset,
      events: events.registry
    };
  }

  function NoDrag (anchor) {
    var onEvent = function (event, mode) {
    };
    return {
      onEvent: onEvent,
      reset: noop
    };
  }

  function Movement () {
    var noDragState = NoDrag();
    var inDragState = InDrag();
    var dragState = noDragState;
    var on = function () {
      dragState.reset();
      dragState = inDragState;
    };
    var off = function () {
      dragState.reset();
      dragState = noDragState;
    };
    var onEvent = function (event, mode) {
      dragState.onEvent(event, mode);
    };
    var isOn = function () {
      return dragState === inDragState;
    };
    return {
      on: on,
      off: off,
      isOn: isOn,
      onEvent: onEvent,
      events: inDragState.events
    };
  }

  var last$3 = function (fn, rate) {
    var timer = null;
    var cancel = function () {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    var throttle = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      if (timer !== null)
        clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(null, args);
        timer = null;
      }, rate);
    };
    return {
      cancel: cancel,
      throttle: throttle
    };
  };

  var setup = function (mutation, mode, settings) {
    var active = false;
    var events = $_6742tgp5jm8ldu4w.create({
      start: Event([]),
      stop: Event([])
    });
    var movement = Movement();
    var drop = function () {
      sink.stop();
      if (movement.isOn()) {
        movement.off();
        events.trigger.stop();
      }
    };
    var throttledDrop = last$3(drop, 200);
    var go = function (parent) {
      sink.start(parent);
      movement.on();
      events.trigger.start();
    };
    var mousemove = function (event, ui) {
      throttledDrop.cancel();
      movement.onEvent(event, mode);
    };
    movement.events.move.bind(function (event) {
      mode.mutate(mutation, event.info());
    });
    var on = function () {
      active = true;
    };
    var off = function () {
      active = false;
    };
    var runIfActive = function (f) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        if (active) {
          return f.apply(null, args);
        }
      };
    };
    var sink = mode.sink($_exobzvp9jm8ldu6f.api({
      forceDrop: drop,
      drop: runIfActive(drop),
      move: runIfActive(mousemove),
      delayDrop: runIfActive(throttledDrop.throttle)
    }), settings);
    var destroy = function () {
      sink.destroy();
    };
    return {
      element: sink.element,
      go: go,
      on: on,
      off: off,
      destroy: destroy,
      events: events.registry
    };
  };
  var $_6wwb9zpejm8ldu7f = { setup: setup };

  var transform$1 = function (mutation, options) {
    var settings = options !== undefined ? options : {};
    var mode = settings.mode !== undefined ? settings.mode : MouseDrag;
    return $_6wwb9zpejm8ldu7f.setup(mutation, mode, options);
  };
  var $_at66hcp7jm8ldu5z = { transform: transform$1 };

  function Mutation () {
    var events = $_6742tgp5jm8ldu4w.create({
      'drag': Event([
        'xDelta',
        'yDelta'
      ])
    });
    var mutate = function (x, y) {
      events.trigger.drag(x, y);
    };
    return {
      mutate: mutate,
      events: events.registry
    };
  }

  function BarMutation () {
    var events = $_6742tgp5jm8ldu4w.create({
      drag: Event([
        'xDelta',
        'yDelta',
        'target'
      ])
    });
    var target = Option.none();
    var delegate = Mutation();
    delegate.events.drag.bind(function (event) {
      target.each(function (t) {
        events.trigger.drag(event.xDelta(), event.yDelta(), t);
      });
    });
    var assign = function (t) {
      target = Option.some(t);
    };
    var get = function () {
      return target;
    };
    return {
      assign: assign,
      get: get,
      mutate: delegate.mutate,
      events: events.registry
    };
  }

  var any = function (selector) {
    return $_6mmdzsm6jm8ldthg.first(selector).isSome();
  };
  var ancestor$2 = function (scope, selector, isRoot) {
    return $_6mmdzsm6jm8ldthg.ancestor(scope, selector, isRoot).isSome();
  };
  var sibling$2 = function (scope, selector) {
    return $_6mmdzsm6jm8ldthg.sibling(scope, selector).isSome();
  };
  var child$3 = function (scope, selector) {
    return $_6mmdzsm6jm8ldthg.child(scope, selector).isSome();
  };
  var descendant$2 = function (scope, selector) {
    return $_6mmdzsm6jm8ldthg.descendant(scope, selector).isSome();
  };
  var closest$2 = function (scope, selector, isRoot) {
    return $_6mmdzsm6jm8ldthg.closest(scope, selector, isRoot).isSome();
  };
  var $_ayu2wppljm8ldu8i = {
    any: any,
    ancestor: ancestor$2,
    sibling: sibling$2,
    child: child$3,
    descendant: descendant$2,
    closest: closest$2
  };

  var resizeBarDragging = $_82owyfo0jm8ldtxk.resolve('resizer-bar-dragging');
  function BarManager (wire, direction, hdirection) {
    var mutation = BarMutation();
    var resizing = $_at66hcp7jm8ldu5z.transform(mutation, {});
    var hoverTable = Option.none();
    var getResizer = function (element, type) {
      return Option.from($_dz8wvwm1jm8ldtgt.get(element, type));
    };
    mutation.events.drag.bind(function (event) {
      getResizer(event.target(), 'data-row').each(function (_dataRow) {
        var currentRow = $_7fuz8wogjm8ldtzq.getInt(event.target(), 'top');
        $_dr5b9omajm8ldti8.set(event.target(), 'top', currentRow + event.yDelta() + 'px');
      });
      getResizer(event.target(), 'data-column').each(function (_dataCol) {
        var currentCol = $_7fuz8wogjm8ldtzq.getInt(event.target(), 'left');
        $_dr5b9omajm8ldti8.set(event.target(), 'left', currentCol + event.xDelta() + 'px');
      });
    });
    var getDelta = function (target, direction) {
      var newX = $_7fuz8wogjm8ldtzq.getInt(target, direction);
      var oldX = parseInt($_dz8wvwm1jm8ldtgt.get(target, 'data-initial-' + direction), 10);
      return newX - oldX;
    };
    resizing.events.stop.bind(function () {
      mutation.get().each(function (target) {
        hoverTable.each(function (table) {
          getResizer(target, 'data-row').each(function (row) {
            var delta = getDelta(target, 'top');
            $_dz8wvwm1jm8ldtgt.remove(target, 'data-initial-top');
            events.trigger.adjustHeight(table, delta, parseInt(row, 10));
          });
          getResizer(target, 'data-column').each(function (column) {
            var delta = getDelta(target, 'left');
            $_dz8wvwm1jm8ldtgt.remove(target, 'data-initial-left');
            events.trigger.adjustWidth(table, delta, parseInt(column, 10));
          });
          $_7ojhlinwjm8ldtw5.refresh(wire, table, hdirection, direction);
        });
      });
    });
    var handler = function (target, direction) {
      events.trigger.startAdjust();
      mutation.assign(target);
      $_dz8wvwm1jm8ldtgt.set(target, 'data-initial-' + direction, parseInt($_dr5b9omajm8ldti8.get(target, direction), 10));
      $_ersi15o2jm8ldtxp.add(target, resizeBarDragging);
      $_dr5b9omajm8ldti8.set(target, 'opacity', '0.2');
      resizing.go(wire.parent());
    };
    var mousedown = $_4qo3anpcjm8ldu76.bind(wire.parent(), 'mousedown', function (event) {
      if ($_7ojhlinwjm8ldtw5.isRowBar(event.target()))
        handler(event.target(), 'top');
      if ($_7ojhlinwjm8ldtw5.isColBar(event.target()))
        handler(event.target(), 'left');
    });
    var isRoot = function (e) {
      return $_ak7uzflkjm8ldtfb.eq(e, wire.view());
    };
    var mouseover = $_4qo3anpcjm8ldu76.bind(wire.view(), 'mouseover', function (event) {
      if ($_aq9fg3m2jm8ldth1.name(event.target()) === 'table' || $_ayu2wppljm8ldu8i.closest(event.target(), 'table', isRoot)) {
        hoverTable = $_aq9fg3m2jm8ldth1.name(event.target()) === 'table' ? Option.some(event.target()) : $_6mmdzsm6jm8ldthg.ancestor(event.target(), 'table', isRoot);
        hoverTable.each(function (ht) {
          $_7ojhlinwjm8ldtw5.refresh(wire, ht, hdirection, direction);
        });
      } else if ($_3hsphum5jm8ldth8.inBody(event.target())) {
        $_7ojhlinwjm8ldtw5.destroy(wire);
      }
    });
    var destroy = function () {
      mousedown.unbind();
      mouseover.unbind();
      resizing.destroy();
      $_7ojhlinwjm8ldtw5.destroy(wire);
    };
    var refresh = function (tbl) {
      $_7ojhlinwjm8ldtw5.refresh(wire, tbl, hdirection, direction);
    };
    var events = $_6742tgp5jm8ldu4w.create({
      adjustHeight: Event([
        'table',
        'delta',
        'row'
      ]),
      adjustWidth: Event([
        'table',
        'delta',
        'column'
      ]),
      startAdjust: Event([])
    });
    return {
      destroy: destroy,
      refresh: refresh,
      on: resizing.on,
      off: resizing.off,
      hideBars: curry($_7ojhlinwjm8ldtw5.hide, wire),
      showBars: curry($_7ojhlinwjm8ldtw5.show, wire),
      events: events.registry
    };
  }

  function TableResize (wire, vdirection) {
    var hdirection = $_d945hsndjm8ldtrb.height;
    var manager = BarManager(wire, vdirection, hdirection);
    var events = $_6742tgp5jm8ldu4w.create({
      beforeResize: Event(['table']),
      afterResize: Event(['table']),
      startDrag: Event([])
    });
    manager.events.adjustHeight.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = hdirection.delta(event.delta(), event.table());
      $_86kxayocjm8ldtz1.adjustHeight(event.table(), delta, event.row(), hdirection);
      events.trigger.afterResize(event.table());
    });
    manager.events.startAdjust.bind(function (event) {
      events.trigger.startDrag();
    });
    manager.events.adjustWidth.bind(function (event) {
      events.trigger.beforeResize(event.table());
      var delta = vdirection.delta(event.delta(), event.table());
      $_86kxayocjm8ldtz1.adjustWidth(event.table(), delta, event.column(), vdirection);
      events.trigger.afterResize(event.table());
    });
    return {
      on: manager.on,
      off: manager.off,
      hideBars: manager.hideBars,
      showBars: manager.showBars,
      destroy: manager.destroy,
      events: events.registry
    };
  }

  var createContainer = function () {
    var container = Element$$1.fromTag('div');
    $_dr5b9omajm8ldti8.setAll(container, {
      position: 'static',
      height: '0',
      width: '0',
      padding: '0',
      margin: '0',
      border: '0'
    });
    $_a4o6jqmcjm8ldtin.append($_3hsphum5jm8ldth8.body(), container);
    return container;
  };
  var get$8 = function (editor, container) {
    return editor.inline ? $_9wronop2jm8ldu40.body(getBody$1(editor), createContainer()) : $_9wronop2jm8ldu40.only(Element$$1.fromDom(editor.getDoc()));
  };
  var remove$6 = function (editor, wire) {
    if (editor.inline) {
      $_dpqucgmdjm8ldtio.remove(wire.parent());
    }
  };
  var $_1yn03cpmjm8ldu8k = {
    get: get$8,
    remove: remove$6
  };

  var ResizeHandler = function (editor) {
    var selectionRng = Option.none();
    var resize = Option.none();
    var wire = Option.none();
    var percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
    var startW, startRawW;
    var isTable = function (elm) {
      return elm.nodeName === 'TABLE';
    };
    var getRawWidth = function (elm) {
      return editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
    };
    var lazyResize = function () {
      return resize;
    };
    var lazyWire = function () {
      return wire.getOr($_9wronop2jm8ldu40.only(Element$$1.fromDom(editor.getBody())));
    };
    var destroy = function () {
      resize.each(function (sz) {
        sz.destroy();
      });
      wire.each(function (w) {
        $_1yn03cpmjm8ldu8k.remove(editor, w);
      });
    };
    editor.on('init', function () {
      var direction = TableDirection($_7ns090okjm8ldu0r.directionAt);
      var rawWire = $_1yn03cpmjm8ldu8k.get(editor);
      wire = Option.some(rawWire);
      if (hasObjectResizing(editor) && hasTableResizeBars(editor)) {
        var sz = TableResize(rawWire, direction);
        sz.on();
        sz.events.startDrag.bind(function (event) {
          selectionRng = Option.some(editor.selection.getRng());
        });
        sz.events.beforeResize.bind(function (event) {
          var rawTable = event.table().dom();
          fireObjectResizeStart(editor, rawTable, getPixelWidth$1(rawTable), getPixelHeight(rawTable));
        });
        sz.events.afterResize.bind(function (event) {
          var table = event.table();
          var rawTable = table.dom();
          removeDataStyle(table);
          selectionRng.each(function (rng) {
            editor.selection.setRng(rng);
            editor.focus();
          });
          fireObjectResized(editor, rawTable, getPixelWidth$1(rawTable), getPixelHeight(rawTable));
          editor.undoManager.add();
        });
        resize = Option.some(sz);
      }
    });
    editor.on('ObjectResizeStart', function (e) {
      var targetElm = e.target;
      if (isTable(targetElm)) {
        startW = e.width;
        startRawW = getRawWidth(targetElm);
      }
    });
    editor.on('ObjectResized', function (e) {
      var targetElm = e.target;
      if (isTable(targetElm)) {
        var table = targetElm;
        if (percentageBasedSizeRegex.test(startRawW)) {
          var percentW = parseFloat(percentageBasedSizeRegex.exec(startRawW)[1]);
          var targetPercentW = e.width * percentW / startW;
          editor.dom.setStyle(table, 'width', targetPercentW + '%');
        } else {
          var newCellSizes_1 = [];
          global$1.each(table.rows, function (row) {
            global$1.each(row.cells, function (cell) {
              var width = editor.dom.getStyle(cell, 'width', true);
              newCellSizes_1.push({
                cell: cell,
                width: width
              });
            });
          });
          global$1.each(newCellSizes_1, function (newCellSize) {
            editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
            editor.dom.setAttrib(newCellSize.cell, 'width', null);
          });
        }
      }
    });
    return {
      lazyResize: lazyResize,
      lazyWire: lazyWire,
      destroy: destroy
    };
  };

  var none$2 = function (current) {
    return folder$1(function (n, f, m, l) {
      return n(current);
    });
  };
  var first$5 = function (current) {
    return folder$1(function (n, f, m, l) {
      return f(current);
    });
  };
  var middle$1 = function (current, target) {
    return folder$1(function (n, f, m, l) {
      return m(current, target);
    });
  };
  var last$4 = function (current) {
    return folder$1(function (n, f, m, l) {
      return l(current);
    });
  };
  var folder$1 = function (fold) {
    return { fold: fold };
  };
  var $_7hp9ytppjm8ldu9v = {
    none: none$2,
    first: first$5,
    middle: middle$1,
    last: last$4
  };

  var detect$4 = function (current, isRoot) {
    return $_b4ktmplcjm8ldtd5.table(current, isRoot).bind(function (table) {
      var all = $_b4ktmplcjm8ldtd5.cells(table);
      var index = findIndex(all, function (x) {
        return $_ak7uzflkjm8ldtfb.eq(current, x);
      });
      return index.map(function (ind) {
        return {
          index: constant(ind),
          all: constant(all)
        };
      });
    });
  };
  var next = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_7hp9ytppjm8ldu9v.none(current);
    }, function (info) {
      return info.index() + 1 < info.all().length ? $_7hp9ytppjm8ldu9v.middle(current, info.all()[info.index() + 1]) : $_7hp9ytppjm8ldu9v.last(current);
    });
  };
  var prev = function (current, isRoot) {
    var detection = detect$4(current, isRoot);
    return detection.fold(function () {
      return $_7hp9ytppjm8ldu9v.none();
    }, function (info) {
      return info.index() - 1 >= 0 ? $_7hp9ytppjm8ldu9v.middle(current, info.all()[info.index() - 1]) : $_7hp9ytppjm8ldu9v.first(current);
    });
  };
  var $_2tya3opojm8ldu9n = {
    next: next,
    prev: prev
  };

  var adt = Adt.generate([
    { 'before': ['element'] },
    {
      'on': [
        'element',
        'offset'
      ]
    },
    { after: ['element'] }
  ]);
  var cata$1 = function (subject, onBefore, onOn, onAfter) {
    return subject.fold(onBefore, onOn, onAfter);
  };
  var getStart = function (situ) {
    return situ.fold(identity, identity, identity);
  };
  var $_bqbmi7prjm8ldua4 = {
    before: adt.before,
    on: adt.on,
    after: adt.after,
    cata: cata$1,
    getStart: getStart
  };

  var type$2 = Adt.generate([
    { domRange: ['rng'] },
    {
      relative: [
        'startSitu',
        'finishSitu'
      ]
    },
    {
      exact: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var range$2 = Immutable('start', 'soffset', 'finish', 'foffset');
  var exactFromRange = function (simRange) {
    return type$2.exact(simRange.start(), simRange.soffset(), simRange.finish(), simRange.foffset());
  };
  var getStart$1 = function (selection) {
    return selection.match({
      domRange: function (rng) {
        return Element$$1.fromDom(rng.startContainer);
      },
      relative: function (startSitu, finishSitu) {
        return $_bqbmi7prjm8ldua4.getStart(startSitu);
      },
      exact: function (start, soffset, finish, foffset) {
        return start;
      }
    });
  };
  var getWin = function (selection) {
    var start = getStart$1(selection);
    return $_8mc5g7lijm8ldtev.defaultView(start);
  };
  var $_2051gcpqjm8ldu9x = {
    domRange: type$2.domRange,
    relative: type$2.relative,
    exact: type$2.exact,
    exactFromRange: exactFromRange,
    range: range$2,
    getWin: getWin
  };

  var makeRange = function (start, soffset, finish, foffset) {
    var doc = $_8mc5g7lijm8ldtev.owner(start);
    var rng = doc.dom().createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var commonAncestorContainer = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    return Element$$1.fromDom(r.commonAncestorContainer);
  };
  var after$2 = function (start, soffset, finish, foffset) {
    var r = makeRange(start, soffset, finish, foffset);
    var same = $_ak7uzflkjm8ldtfb.eq(start, finish) && soffset === foffset;
    return r.collapsed && !same;
  };
  var $_af2ejptjm8lduah = {
    after: after$2,
    commonAncestorContainer: commonAncestorContainer
  };

  var fromElements = function (elements, scope) {
    var doc = scope || document;
    var fragment = doc.createDocumentFragment();
    each(elements, function (element) {
      fragment.appendChild(element.dom());
    });
    return Element$$1.fromDom(fragment);
  };
  var $_axbgpdpujm8lduai = { fromElements: fromElements };

  var selectNodeContents = function (win, element) {
    var rng = win.document.createRange();
    selectNodeContentsUsing(rng, element);
    return rng;
  };
  var selectNodeContentsUsing = function (rng, element) {
    rng.selectNodeContents(element.dom());
  };
  var isWithin$1 = function (outerRange, innerRange) {
    return innerRange.compareBoundaryPoints(outerRange.END_TO_START, outerRange) < 1 && innerRange.compareBoundaryPoints(outerRange.START_TO_END, outerRange) > -1;
  };
  var create$1 = function (win) {
    return win.document.createRange();
  };
  var setStart = function (rng, situ) {
    situ.fold(function (e) {
      rng.setStartBefore(e.dom());
    }, function (e, o) {
      rng.setStart(e.dom(), o);
    }, function (e) {
      rng.setStartAfter(e.dom());
    });
  };
  var setFinish = function (rng, situ) {
    situ.fold(function (e) {
      rng.setEndBefore(e.dom());
    }, function (e, o) {
      rng.setEnd(e.dom(), o);
    }, function (e) {
      rng.setEndAfter(e.dom());
    });
  };
  var replaceWith = function (rng, fragment) {
    deleteContents(rng);
    rng.insertNode(fragment.dom());
  };
  var relativeToNative = function (win, startSitu, finishSitu) {
    var range = win.document.createRange();
    setStart(range, startSitu);
    setFinish(range, finishSitu);
    return range;
  };
  var exactToNative = function (win, start, soffset, finish, foffset) {
    var rng = win.document.createRange();
    rng.setStart(start.dom(), soffset);
    rng.setEnd(finish.dom(), foffset);
    return rng;
  };
  var deleteContents = function (rng) {
    rng.deleteContents();
  };
  var cloneFragment = function (rng) {
    var fragment = rng.cloneContents();
    return Element$$1.fromDom(fragment);
  };
  var toRect = function (rect) {
    return {
      left: constant(rect.left),
      top: constant(rect.top),
      right: constant(rect.right),
      bottom: constant(rect.bottom),
      width: constant(rect.width),
      height: constant(rect.height)
    };
  };
  var getFirstRect = function (rng) {
    var rects = rng.getClientRects();
    var rect = rects.length > 0 ? rects[0] : rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var getBounds$1 = function (rng) {
    var rect = rng.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 ? Option.some(rect).map(toRect) : Option.none();
  };
  var toString = function (rng) {
    return rng.toString();
  };
  var $_a7h8f8pvjm8lduan = {
    create: create$1,
    replaceWith: replaceWith,
    selectNodeContents: selectNodeContents,
    selectNodeContentsUsing: selectNodeContentsUsing,
    relativeToNative: relativeToNative,
    exactToNative: exactToNative,
    deleteContents: deleteContents,
    cloneFragment: cloneFragment,
    getFirstRect: getFirstRect,
    getBounds: getBounds$1,
    isWithin: isWithin$1,
    toString: toString
  };

  var adt$1 = Adt.generate([
    {
      ltr: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    },
    {
      rtl: [
        'start',
        'soffset',
        'finish',
        'foffset'
      ]
    }
  ]);
  var fromRange = function (win, type, range) {
    return type(Element$$1.fromDom(range.startContainer), range.startOffset, Element$$1.fromDom(range.endContainer), range.endOffset);
  };
  var getRanges = function (win, selection) {
    return selection.match({
      domRange: function (rng) {
        return {
          ltr: constant(rng),
          rtl: Option.none
        };
      },
      relative: function (startSitu, finishSitu) {
        return {
          ltr: cached(function () {
            return $_a7h8f8pvjm8lduan.relativeToNative(win, startSitu, finishSitu);
          }),
          rtl: cached(function () {
            return Option.some($_a7h8f8pvjm8lduan.relativeToNative(win, finishSitu, startSitu));
          })
        };
      },
      exact: function (start, soffset, finish, foffset) {
        return {
          ltr: cached(function () {
            return $_a7h8f8pvjm8lduan.exactToNative(win, start, soffset, finish, foffset);
          }),
          rtl: cached(function () {
            return Option.some($_a7h8f8pvjm8lduan.exactToNative(win, finish, foffset, start, soffset));
          })
        };
      }
    });
  };
  var doDiagnose = function (win, ranges) {
    var rng = ranges.ltr();
    if (rng.collapsed) {
      var reversed = ranges.rtl().filter(function (rev) {
        return rev.collapsed === false;
      });
      return reversed.map(function (rev) {
        return adt$1.rtl(Element$$1.fromDom(rev.endContainer), rev.endOffset, Element$$1.fromDom(rev.startContainer), rev.startOffset);
      }).getOrThunk(function () {
        return fromRange(win, adt$1.ltr, rng);
      });
    } else {
      return fromRange(win, adt$1.ltr, rng);
    }
  };
  var diagnose = function (win, selection) {
    var ranges = getRanges(win, selection);
    return doDiagnose(win, ranges);
  };
  var asLtrRange = function (win, selection) {
    var diagnosis = diagnose(win, selection);
    return diagnosis.match({
      ltr: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(start.dom(), soffset);
        rng.setEnd(finish.dom(), foffset);
        return rng;
      },
      rtl: function (start, soffset, finish, foffset) {
        var rng = win.document.createRange();
        rng.setStart(finish.dom(), foffset);
        rng.setEnd(start.dom(), soffset);
        return rng;
      }
    });
  };
  var $_7dwdrupwjm8lduaw = {
    ltr: adt$1.ltr,
    rtl: adt$1.rtl,
    diagnose: diagnose,
    asLtrRange: asLtrRange
  };

  var searchForPoint = function (rectForOffset, x, y, maxX, length) {
    if (length === 0)
      return 0;
    else if (x === maxX)
      return length - 1;
    var xDelta = maxX;
    for (var i = 1; i < length; i++) {
      var rect = rectForOffset(i);
      var curDeltaX = Math.abs(x - rect.left);
      if (y <= rect.bottom) {
        if (y < rect.top || curDeltaX > xDelta) {
          return i - 1;
        } else {
          xDelta = curDeltaX;
        }
      }
    }
    return 0;
  };
  var inRect = function (rect, x, y) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };
  var $_coejc6pzjm8ldubm = {
    inRect: inRect,
    searchForPoint: searchForPoint
  };

  var locateOffset = function (doc, textnode, x, y, rect) {
    var rangeForOffset = function (offset) {
      var r = doc.dom().createRange();
      r.setStart(textnode.dom(), offset);
      r.collapse(true);
      return r;
    };
    var rectForOffset = function (offset) {
      var r = rangeForOffset(offset);
      return r.getBoundingClientRect();
    };
    var length = $_7dj7zlmjjm8ldtk1.get(textnode).length;
    var offset = $_coejc6pzjm8ldubm.searchForPoint(rectForOffset, x, y, rect.right, length);
    return rangeForOffset(offset);
  };
  var locate = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rects = r.getClientRects();
    var foundRect = findMap(rects, function (rect) {
      return $_coejc6pzjm8ldubm.inRect(rect, x, y) ? Option.some(rect) : Option.none();
    });
    return foundRect.map(function (rect) {
      return locateOffset(doc, node, x, y, rect);
    });
  };
  var $_cbljojq0jm8ldubo = { locate: locate };

  var searchInChildren = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    var nodes = $_8mc5g7lijm8ldtev.children(node);
    return findMap(nodes, function (n) {
      r.selectNode(n.dom());
      return $_coejc6pzjm8ldubm.inRect(r.getBoundingClientRect(), x, y) ? locateNode(doc, n, x, y) : Option.none();
    });
  };
  var locateNode = function (doc, node, x, y) {
    var locator = $_aq9fg3m2jm8ldth1.isText(node) ? $_cbljojq0jm8ldubo.locate : searchInChildren;
    return locator(doc, node, x, y);
  };
  var locate$1 = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return locateNode(doc, node, boundedX, boundedY);
  };
  var $_8zen7ypyjm8ldubf = { locate: locate$1 };

  var COLLAPSE_TO_LEFT = true;
  var COLLAPSE_TO_RIGHT = false;
  var getCollapseDirection = function (rect, x) {
    return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
  };
  var createCollapsedNode = function (doc, target, collapseDirection) {
    var r = doc.dom().createRange();
    r.selectNode(target.dom());
    r.collapse(collapseDirection);
    return r;
  };
  var locateInElement = function (doc, node, x) {
    var cursorRange = doc.dom().createRange();
    cursorRange.selectNode(node.dom());
    var rect = cursorRange.getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    var f = collapseDirection === COLLAPSE_TO_LEFT ? $_hxrvqmhjm8ldtjt.first : $_hxrvqmhjm8ldtjt.last;
    return f(node).map(function (target) {
      return createCollapsedNode(doc, target, collapseDirection);
    });
  };
  var locateInEmpty = function (doc, node, x) {
    var rect = node.dom().getBoundingClientRect();
    var collapseDirection = getCollapseDirection(rect, x);
    return Option.some(createCollapsedNode(doc, node, collapseDirection));
  };
  var search = function (doc, node, x) {
    var f = $_8mc5g7lijm8ldtev.children(node).length === 0 ? locateInEmpty : locateInElement;
    return f(doc, node, x);
  };
  var $_b7fsw0q1jm8ldubv = { search: search };

  var caretPositionFromPoint = function (doc, x, y) {
    return Option.from(doc.dom().caretPositionFromPoint(x, y)).bind(function (pos) {
      if (pos.offsetNode === null)
        return Option.none();
      var r = doc.dom().createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse();
      return Option.some(r);
    });
  };
  var caretRangeFromPoint = function (doc, x, y) {
    return Option.from(doc.dom().caretRangeFromPoint(x, y));
  };
  var searchTextNodes = function (doc, node, x, y) {
    var r = doc.dom().createRange();
    r.selectNode(node.dom());
    var rect = r.getBoundingClientRect();
    var boundedX = Math.max(rect.left, Math.min(rect.right, x));
    var boundedY = Math.max(rect.top, Math.min(rect.bottom, y));
    return $_8zen7ypyjm8ldubf.locate(doc, node, boundedX, boundedY);
  };
  var searchFromPoint = function (doc, x, y) {
    return Element$$1.fromPoint(doc, x, y).bind(function (elem) {
      var fallback = function () {
        return $_b7fsw0q1jm8ldubv.search(doc, elem, x);
      };
      return $_8mc5g7lijm8ldtev.children(elem).length === 0 ? fallback() : searchTextNodes(doc, elem, x, y).orThunk(fallback);
    });
  };
  var availableSearch = document.caretPositionFromPoint ? caretPositionFromPoint : document.caretRangeFromPoint ? caretRangeFromPoint : searchFromPoint;
  var fromPoint$1 = function (win, x, y) {
    var doc = Element$$1.fromDom(win.document);
    return availableSearch(doc, x, y).map(function (rng) {
      return $_2051gcpqjm8ldu9x.range(Element$$1.fromDom(rng.startContainer), rng.startOffset, Element$$1.fromDom(rng.endContainer), rng.endOffset);
    });
  };
  var $_31vectpxjm8lduba = { fromPoint: fromPoint$1 };

  var withinContainer = function (win, ancestor, outerRange, selector) {
    var innerRange = $_a7h8f8pvjm8lduan.create(win);
    var self = $_eqepc2lejm8ldte5.is(ancestor, selector) ? [ancestor] : [];
    var elements = self.concat($_emvpc1m3jm8ldth3.descendants(ancestor, selector));
    return filter(elements, function (elem) {
      $_a7h8f8pvjm8lduan.selectNodeContentsUsing(innerRange, elem);
      return $_a7h8f8pvjm8lduan.isWithin(outerRange, innerRange);
    });
  };
  var find$3 = function (win, selection, selector) {
    var outerRange = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    var ancestor = Element$$1.fromDom(outerRange.commonAncestorContainer);
    return $_aq9fg3m2jm8ldth1.isElement(ancestor) ? withinContainer(win, ancestor, outerRange, selector) : [];
  };
  var $_5po8qxq2jm8ldubz = { find: find$3 };

  var beforeSpecial = function (element, offset) {
    var name = $_aq9fg3m2jm8ldth1.name(element);
    if ('input' === name)
      return $_bqbmi7prjm8ldua4.after(element);
    else if (!contains([
        'br',
        'img'
      ], name))
      return $_bqbmi7prjm8ldua4.on(element, offset);
    else
      return offset === 0 ? $_bqbmi7prjm8ldua4.before(element) : $_bqbmi7prjm8ldua4.after(element);
  };
  var preprocessRelative = function (startSitu, finishSitu) {
    var start = startSitu.fold($_bqbmi7prjm8ldua4.before, beforeSpecial, $_bqbmi7prjm8ldua4.after);
    var finish = finishSitu.fold($_bqbmi7prjm8ldua4.before, beforeSpecial, $_bqbmi7prjm8ldua4.after);
    return $_2051gcpqjm8ldu9x.relative(start, finish);
  };
  var preprocessExact = function (start, soffset, finish, foffset) {
    var startSitu = beforeSpecial(start, soffset);
    var finishSitu = beforeSpecial(finish, foffset);
    return $_2051gcpqjm8ldu9x.relative(startSitu, finishSitu);
  };
  var preprocess = function (selection) {
    return selection.match({
      domRange: function (rng) {
        var start = Element$$1.fromDom(rng.startContainer);
        var finish = Element$$1.fromDom(rng.endContainer);
        return preprocessExact(start, rng.startOffset, finish, rng.endOffset);
      },
      relative: preprocessRelative,
      exact: preprocessExact
    });
  };
  var $_donej0q3jm8lduc4 = {
    beforeSpecial: beforeSpecial,
    preprocess: preprocess,
    preprocessRelative: preprocessRelative,
    preprocessExact: preprocessExact
  };

  var doSetNativeRange = function (win, rng) {
    Option.from(win.getSelection()).each(function (selection) {
      selection.removeAllRanges();
      selection.addRange(rng);
    });
  };
  var doSetRange = function (win, start, soffset, finish, foffset) {
    var rng = $_a7h8f8pvjm8lduan.exactToNative(win, start, soffset, finish, foffset);
    doSetNativeRange(win, rng);
  };
  var findWithin = function (win, selection, selector) {
    return $_5po8qxq2jm8ldubz.find(win, selection, selector);
  };
  var setLegacyRtlRange = function (win, selection, start, soffset, finish, foffset) {
    selection.collapse(start.dom(), soffset);
    selection.extend(finish.dom(), foffset);
  };
  var setRangeFromRelative = function (win, relative) {
    return $_7dwdrupwjm8lduaw.diagnose(win, relative).match({
      ltr: function (start, soffset, finish, foffset) {
        doSetRange(win, start, soffset, finish, foffset);
      },
      rtl: function (start, soffset, finish, foffset) {
        var selection = win.getSelection();
        if (selection.setBaseAndExtent) {
          selection.setBaseAndExtent(start.dom(), soffset, finish.dom(), foffset);
        } else if (selection.extend) {
          try {
            setLegacyRtlRange(win, selection, start, soffset, finish, foffset);
          } catch (e) {
            doSetRange(win, finish, foffset, start, soffset);
          }
        } else {
          doSetRange(win, finish, foffset, start, soffset);
        }
      }
    });
  };
  var setExact = function (win, start, soffset, finish, foffset) {
    var relative = $_donej0q3jm8lduc4.preprocessExact(start, soffset, finish, foffset);
    setRangeFromRelative(win, relative);
  };
  var setRelative = function (win, startSitu, finishSitu) {
    var relative = $_donej0q3jm8lduc4.preprocessRelative(startSitu, finishSitu);
    setRangeFromRelative(win, relative);
  };
  var toNative = function (selection) {
    var win = $_2051gcpqjm8ldu9x.getWin(selection).dom();
    var getDomRange = function (start, soffset, finish, foffset) {
      return $_a7h8f8pvjm8lduan.exactToNative(win, start, soffset, finish, foffset);
    };
    var filtered = $_donej0q3jm8lduc4.preprocess(selection);
    return $_7dwdrupwjm8lduaw.diagnose(win, filtered).match({
      ltr: getDomRange,
      rtl: getDomRange
    });
  };
  var readRange = function (selection) {
    if (selection.rangeCount > 0) {
      var firstRng = selection.getRangeAt(0);
      var lastRng = selection.getRangeAt(selection.rangeCount - 1);
      return Option.some($_2051gcpqjm8ldu9x.range(Element$$1.fromDom(firstRng.startContainer), firstRng.startOffset, Element$$1.fromDom(lastRng.endContainer), lastRng.endOffset));
    } else {
      return Option.none();
    }
  };
  var doGetExact = function (selection) {
    var anchorNode = Element$$1.fromDom(selection.anchorNode);
    var focusNode = Element$$1.fromDom(selection.focusNode);
    return $_af2ejptjm8lduah.after(anchorNode, selection.anchorOffset, focusNode, selection.focusOffset) ? Option.some($_2051gcpqjm8ldu9x.range(Element$$1.fromDom(selection.anchorNode), selection.anchorOffset, Element$$1.fromDom(selection.focusNode), selection.focusOffset)) : readRange(selection);
  };
  var setToElement = function (win, element) {
    var rng = $_a7h8f8pvjm8lduan.selectNodeContents(win, element);
    doSetNativeRange(win, rng);
  };
  var forElement = function (win, element) {
    var rng = $_a7h8f8pvjm8lduan.selectNodeContents(win, element);
    return $_2051gcpqjm8ldu9x.range(Element$$1.fromDom(rng.startContainer), rng.startOffset, Element$$1.fromDom(rng.endContainer), rng.endOffset);
  };
  var getExact = function (win) {
    return Option.from(win.getSelection()).filter(function (sel) {
      return sel.rangeCount > 0;
    }).bind(doGetExact);
  };
  var get$9 = function (win) {
    return getExact(win).map(function (range) {
      return $_2051gcpqjm8ldu9x.exact(range.start(), range.soffset(), range.finish(), range.foffset());
    });
  };
  var getFirstRect$1 = function (win, selection) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    return $_a7h8f8pvjm8lduan.getFirstRect(rng);
  };
  var getBounds$2 = function (win, selection) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    return $_a7h8f8pvjm8lduan.getBounds(rng);
  };
  var getAtPoint = function (win, x, y) {
    return $_31vectpxjm8lduba.fromPoint(win, x, y);
  };
  var getAsString = function (win, selection) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    return $_a7h8f8pvjm8lduan.toString(rng);
  };
  var clear$1 = function (win) {
    var selection = win.getSelection();
    selection.removeAllRanges();
  };
  var clone$2 = function (win, selection) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    return $_a7h8f8pvjm8lduan.cloneFragment(rng);
  };
  var replace$1 = function (win, selection, elements) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    var fragment = $_axbgpdpujm8lduai.fromElements(elements, win.document);
    $_a7h8f8pvjm8lduan.replaceWith(rng, fragment);
  };
  var deleteAt = function (win, selection) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    $_a7h8f8pvjm8lduan.deleteContents(rng);
  };
  var isCollapsed = function (start, soffset, finish, foffset) {
    return $_ak7uzflkjm8ldtfb.eq(start, finish) && soffset === foffset;
  };
  var $_g7gw4ppsjm8lduab = {
    setExact: setExact,
    getExact: getExact,
    get: get$9,
    setRelative: setRelative,
    toNative: toNative,
    setToElement: setToElement,
    clear: clear$1,
    clone: clone$2,
    replace: replace$1,
    deleteAt: deleteAt,
    forElement: forElement,
    getFirstRect: getFirstRect$1,
    getBounds: getBounds$2,
    getAtPoint: getAtPoint,
    findWithin: findWithin,
    getAsString: getAsString,
    isCollapsed: isCollapsed
  };

  var global$3 = tinymce.util.Tools.resolve('tinymce.util.VK');

  var forward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_2tya3opojm8ldu9n.next(cell), lazyWire);
  };
  var backward = function (editor, isRoot, cell, lazyWire) {
    return go(editor, isRoot, $_2tya3opojm8ldu9n.prev(cell), lazyWire);
  };
  var getCellFirstCursorPosition = function (editor, cell) {
    var selection = $_2051gcpqjm8ldu9x.exact(cell, 0, cell, 0);
    return $_g7gw4ppsjm8lduab.toNative(selection);
  };
  var getNewRowCursorPosition = function (editor, table) {
    var rows = $_emvpc1m3jm8ldth3.descendants(table, 'tr');
    return last(rows).bind(function (last$$1) {
      return $_6mmdzsm6jm8ldthg.descendant(last$$1, 'td,th').map(function (first) {
        return getCellFirstCursorPosition(editor, first);
      });
    });
  };
  var go = function (editor, isRoot, cell, actions, lazyWire) {
    return cell.fold(Option.none, Option.none, function (current, next) {
      return $_hxrvqmhjm8ldtjt.first(next).map(function (cell) {
        return getCellFirstCursorPosition(editor, cell);
      });
    }, function (current) {
      return $_b4ktmplcjm8ldtd5.table(current, isRoot).bind(function (table) {
        var targets = $_8xltjimmjm8ldtkc.noMenu(current);
        editor.undoManager.transact(function () {
          actions.insertRowsAfter(table, targets);
        });
        return getNewRowCursorPosition(editor, table);
      });
    });
  };
  var rootElements = [
    'table',
    'li',
    'dl'
  ];
  var handle$1 = function (event, editor, actions, lazyWire) {
    if (event.keyCode === global$3.TAB) {
      var body_1 = getBody$1(editor);
      var isRoot_1 = function (element) {
        var name = $_aq9fg3m2jm8ldth1.name(element);
        return $_ak7uzflkjm8ldtfb.eq(element, body_1) || contains(rootElements, name);
      };
      var rng = editor.selection.getRng();
      if (rng.collapsed) {
        var start = Element$$1.fromDom(rng.startContainer);
        $_b4ktmplcjm8ldtd5.cell(start, isRoot_1).each(function (cell) {
          event.preventDefault();
          var navigation = event.shiftKey ? backward : forward;
          var rng = navigation(editor, isRoot_1, cell, actions, lazyWire);
          rng.each(function (range$$1) {
            editor.selection.setRng(range$$1);
          });
        });
      }
    }
  };
  var $_f2iyqtpnjm8ldu8x = { handle: handle$1 };

  var response = Immutable('selection', 'kill');
  var $_e0zqzjq7jm8ldudc = { response: response };

  var isKey = function (key) {
    return function (keycode) {
      return keycode === key;
    };
  };
  var isUp = isKey(38);
  var isDown = isKey(40);
  var isNavigation = function (keycode) {
    return keycode >= 37 && keycode <= 40;
  };
  var $_e80r25q8jm8ldudg = {
    ltr: {
      isBackward: isKey(37),
      isForward: isKey(39)
    },
    rtl: {
      isBackward: isKey(39),
      isForward: isKey(37)
    },
    isUp: isUp,
    isDown: isDown,
    isNavigation: isNavigation
  };

  var convertToRange = function (win, selection) {
    var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, selection);
    return {
      start: constant(Element$$1.fromDom(rng.startContainer)),
      soffset: constant(rng.startOffset),
      finish: constant(Element$$1.fromDom(rng.endContainer)),
      foffset: constant(rng.endOffset)
    };
  };
  var makeSitus = function (start, soffset, finish, foffset) {
    return {
      start: constant($_bqbmi7prjm8ldua4.on(start, soffset)),
      finish: constant($_bqbmi7prjm8ldua4.on(finish, foffset))
    };
  };
  var $_bcy18yqajm8ldue1 = {
    convertToRange: convertToRange,
    makeSitus: makeSitus
  };

  var isSafari = $_cpch3zlpjm8ldtfu.detect().browser.isSafari();
  var get$10 = function (_doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
    var y = doc.body.scrollTop || doc.documentElement.scrollTop;
    return Position(x, y);
  };
  var to = function (x, y, _doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var win = doc.defaultView;
    win.scrollTo(x, y);
  };
  var by = function (x, y, _doc) {
    var doc = _doc !== undefined ? _doc.dom() : document;
    var win = doc.defaultView;
    win.scrollBy(x, y);
  };
  var setToElement$1 = function (win, element) {
    var pos = $_9noskinejm8ldtrq.absolute(element);
    var doc = Element$$1.fromDom(win.document);
    to(pos.left(), pos.top(), doc);
  };
  var preserve$1 = function (doc, f) {
    var before = get$10(doc);
    f();
    var after = get$10(doc);
    if (before.top() !== after.top() || before.left() !== after.left()) {
      to(before.left(), before.top(), doc);
    }
  };
  var capture$2 = function (doc) {
    var previous = Option.none();
    var save = function () {
      previous = Option.some(get$10(doc));
    };
    var restore = function () {
      previous.each(function (p) {
        to(p.left(), p.top(), doc);
      });
    };
    save();
    return {
      save: save,
      restore: restore
    };
  };
  var intoView = function (element, alignToTop) {
    if (isSafari && isFunction(element.dom().scrollIntoViewIfNeeded)) {
      element.dom().scrollIntoViewIfNeeded(false);
    } else {
      element.dom().scrollIntoView(alignToTop);
    }
  };
  var intoViewIfNeeded = function (element, container) {
    var containerBox = container.dom().getBoundingClientRect();
    var elementBox = element.dom().getBoundingClientRect();
    if (elementBox.top < containerBox.top) {
      intoView(element, true);
    } else if (elementBox.bottom > containerBox.bottom) {
      intoView(element, false);
    }
  };
  var scrollBarWidth = function () {
    var scrollDiv = Element$$1.fromHtml('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
    $_a4o6jqmcjm8ldtin.after($_3hsphum5jm8ldth8.body(), scrollDiv);
    var w = scrollDiv.dom().offsetWidth - scrollDiv.dom().clientWidth;
    $_dpqucgmdjm8ldtio.remove(scrollDiv);
    return w;
  };
  var $_79gkdkqbjm8ldued = {
    get: get$10,
    to: to,
    by: by,
    preserve: preserve$1,
    capture: capture$2,
    intoView: intoView,
    intoViewIfNeeded: intoViewIfNeeded,
    setToElement: setToElement$1,
    scrollBarWidth: scrollBarWidth
  };

  function WindowBridge (win) {
    var elementFromPoint = function (x, y) {
      return Element$$1.fromPoint(Element$$1.fromDom(win.document), x, y);
    };
    var getRect = function (element) {
      return element.dom().getBoundingClientRect();
    };
    var getRangedRect = function (start, soffset, finish, foffset) {
      var sel = $_2051gcpqjm8ldu9x.exact(start, soffset, finish, foffset);
      return $_g7gw4ppsjm8lduab.getFirstRect(win, sel).map(function (structRect) {
        return map$1(structRect, apply);
      });
    };
    var getSelection = function () {
      return $_g7gw4ppsjm8lduab.get(win).map(function (exactAdt) {
        return $_bcy18yqajm8ldue1.convertToRange(win, exactAdt);
      });
    };
    var fromSitus = function (situs) {
      var relative = $_2051gcpqjm8ldu9x.relative(situs.start(), situs.finish());
      return $_bcy18yqajm8ldue1.convertToRange(win, relative);
    };
    var situsFromPoint = function (x, y) {
      return $_g7gw4ppsjm8lduab.getAtPoint(win, x, y).map(function (exact) {
        return {
          start: constant($_bqbmi7prjm8ldua4.on(exact.start(), exact.soffset())),
          finish: constant($_bqbmi7prjm8ldua4.on(exact.finish(), exact.foffset()))
        };
      });
    };
    var clearSelection = function () {
      $_g7gw4ppsjm8lduab.clear(win);
    };
    var selectContents = function (element) {
      $_g7gw4ppsjm8lduab.setToElement(win, element);
    };
    var setSelection = function (sel) {
      $_g7gw4ppsjm8lduab.setExact(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
    };
    var setRelativeSelection = function (start, finish) {
      $_g7gw4ppsjm8lduab.setRelative(win, start, finish);
    };
    var getInnerHeight = function () {
      return win.innerHeight;
    };
    var getScrollY = function () {
      var pos = $_79gkdkqbjm8ldued.get(Element$$1.fromDom(win.document));
      return pos.top();
    };
    var scrollBy = function (x, y) {
      $_79gkdkqbjm8ldued.by(x, y, Element$$1.fromDom(win.document));
    };
    return {
      elementFromPoint: elementFromPoint,
      getRect: getRect,
      getRangedRect: getRangedRect,
      getSelection: getSelection,
      fromSitus: fromSitus,
      situsFromPoint: situsFromPoint,
      clearSelection: clearSelection,
      setSelection: setSelection,
      setRelativeSelection: setRelativeSelection,
      selectContents: selectContents,
      getInnerHeight: getInnerHeight,
      getScrollY: getScrollY,
      scrollBy: scrollBy
    };
  }

  var sync = function (container, isRoot, start, soffset, finish, foffset, selectRange) {
    if (!($_ak7uzflkjm8ldtfb.eq(start, finish) && soffset === foffset)) {
      return $_6mmdzsm6jm8ldthg.closest(start, 'td,th', isRoot).bind(function (s) {
        return $_6mmdzsm6jm8ldthg.closest(finish, 'td,th', isRoot).bind(function (f) {
          return detect$5(container, isRoot, s, f, selectRange);
        });
      });
    } else {
      return Option.none();
    }
  };
  var detect$5 = function (container, isRoot, start, finish, selectRange) {
    if (!$_ak7uzflkjm8ldtfb.eq(start, finish)) {
      return $_fs2a9mmpjm8ldtl5.identify(start, finish, isRoot).bind(function (cellSel) {
        var boxes = cellSel.boxes().getOr([]);
        if (boxes.length > 0) {
          selectRange(container, boxes, cellSel.start(), cellSel.finish());
          return Option.some($_e0zqzjq7jm8ldudc.response(Option.some($_bcy18yqajm8ldue1.makeSitus(start, 0, start, $_cz58icmijm8ldtjy.getEnd(start))), true));
        } else {
          return Option.none();
        }
      });
    } else {
      return Option.none();
    }
  };
  var update = function (rows, columns, container, selected, annotations) {
    var updateSelection = function (newSels) {
      annotations.clear(container);
      annotations.selectRange(container, newSels.boxes(), newSels.start(), newSels.finish());
      return newSels.boxes();
    };
    return $_fs2a9mmpjm8ldtl5.shiftSelection(selected, rows, columns, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(updateSelection);
  };
  var $_f8xp6hqcjm8lduep = {
    sync: sync,
    detect: detect$5,
    update: update
  };

  var nu$3 = MixedBag([
    'left',
    'top',
    'right',
    'bottom'
  ], []);
  var moveDown = function (caret, amount) {
    return nu$3({
      left: caret.left(),
      top: caret.top() + amount,
      right: caret.right(),
      bottom: caret.bottom() + amount
    });
  };
  var moveUp = function (caret, amount) {
    return nu$3({
      left: caret.left(),
      top: caret.top() - amount,
      right: caret.right(),
      bottom: caret.bottom() - amount
    });
  };
  var moveBottomTo = function (caret, bottom) {
    var height = caret.bottom() - caret.top();
    return nu$3({
      left: caret.left(),
      top: bottom - height,
      right: caret.right(),
      bottom: bottom
    });
  };
  var moveTopTo = function (caret, top) {
    var height = caret.bottom() - caret.top();
    return nu$3({
      left: caret.left(),
      top: top,
      right: caret.right(),
      bottom: top + height
    });
  };
  var translate = function (caret, xDelta, yDelta) {
    return nu$3({
      left: caret.left() + xDelta,
      top: caret.top() + yDelta,
      right: caret.right() + xDelta,
      bottom: caret.bottom() + yDelta
    });
  };
  var getTop$1 = function (caret) {
    return caret.top();
  };
  var getBottom = function (caret) {
    return caret.bottom();
  };
  var toString$1 = function (caret) {
    return '(' + caret.left() + ', ' + caret.top() + ') -> (' + caret.right() + ', ' + caret.bottom() + ')';
  };
  var $_bcbsfsqfjm8lduga = {
    nu: nu$3,
    moveUp: moveUp,
    moveDown: moveDown,
    moveBottomTo: moveBottomTo,
    moveTopTo: moveTopTo,
    getTop: getTop$1,
    getBottom: getBottom,
    translate: translate,
    toString: toString$1
  };

  var getPartialBox = function (bridge, element, offset) {
    if (offset >= 0 && offset < $_cz58icmijm8ldtjy.getEnd(element))
      return bridge.getRangedRect(element, offset, element, offset + 1);
    else if (offset > 0)
      return bridge.getRangedRect(element, offset - 1, element, offset);
    return Option.none();
  };
  var toCaret = function (rect) {
    return $_bcbsfsqfjm8lduga.nu({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom
    });
  };
  var getElemBox = function (bridge, element) {
    return Option.some(bridge.getRect(element));
  };
  var getBoxAt = function (bridge, element, offset) {
    if ($_aq9fg3m2jm8ldth1.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_aq9fg3m2jm8ldth1.isText(element))
      return getPartialBox(bridge, element, offset).map(toCaret);
    else
      return Option.none();
  };
  var getEntireBox = function (bridge, element) {
    if ($_aq9fg3m2jm8ldth1.isElement(element))
      return getElemBox(bridge, element).map(toCaret);
    else if ($_aq9fg3m2jm8ldth1.isText(element))
      return bridge.getRangedRect(element, 0, element, $_cz58icmijm8ldtjy.getEnd(element)).map(toCaret);
    else
      return Option.none();
  };
  var $_aknmekqgjm8lduge = {
    getBoxAt: getBoxAt,
    getEntireBox: getEntireBox
  };

  var traverse = Immutable('item', 'mode');
  var backtrack = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : sidestep;
    return universe.property().parent(item).map(function (p) {
      return traverse(p, transition);
    });
  };
  var sidestep = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : advance;
    return direction.sibling(universe, item).map(function (p) {
      return traverse(p, transition);
    });
  };
  var advance = function (universe, item, direction, _transition) {
    var transition = _transition !== undefined ? _transition : advance;
    var children = universe.property().children(item);
    var result = direction.first(children);
    return result.map(function (r) {
      return traverse(r, transition);
    });
  };
  var successors = [
    {
      current: backtrack,
      next: sidestep,
      fallback: Option.none()
    },
    {
      current: sidestep,
      next: advance,
      fallback: Option.some(backtrack)
    },
    {
      current: advance,
      next: advance,
      fallback: Option.some(sidestep)
    }
  ];
  var go$1 = function (universe, item, mode, direction, rules) {
    var rules = rules !== undefined ? rules : successors;
    var ruleOpt = find(rules, function (succ) {
      return succ.current === mode;
    });
    return ruleOpt.bind(function (rule) {
      return rule.current(universe, item, direction, rule.next).orThunk(function () {
        return rule.fallback.bind(function (fb) {
          return go$1(universe, item, fb, direction);
        });
      });
    });
  };
  var $_8cd9jvqljm8lduhk = {
    backtrack: backtrack,
    sidestep: sidestep,
    advance: advance,
    go: go$1
  };

  var left$1 = function () {
    var sibling = function (universe, item) {
      return universe.query().prevSibling(item);
    };
    var first = function (children) {
      return children.length > 0 ? Option.some(children[children.length - 1]) : Option.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var right$1 = function () {
    var sibling = function (universe, item) {
      return universe.query().nextSibling(item);
    };
    var first = function (children) {
      return children.length > 0 ? Option.some(children[0]) : Option.none();
    };
    return {
      sibling: sibling,
      first: first
    };
  };
  var $_d3v7h3qmjm8lduhv = {
    left: left$1,
    right: right$1
  };

  var hone = function (universe, item, predicate, mode, direction, isRoot) {
    var next = $_8cd9jvqljm8lduhk.go(universe, item, mode, direction);
    return next.bind(function (n) {
      if (isRoot(n.item()))
        return Option.none();
      else
        return predicate(n.item()) ? Option.some(n.item()) : hone(universe, n.item(), predicate, n.mode(), direction, isRoot);
    });
  };
  var left$2 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_8cd9jvqljm8lduhk.sidestep, $_d3v7h3qmjm8lduhv.left(), isRoot);
  };
  var right$2 = function (universe, item, predicate, isRoot) {
    return hone(universe, item, predicate, $_8cd9jvqljm8lduhk.sidestep, $_d3v7h3qmjm8lduhv.right(), isRoot);
  };
  var $_2cyescqkjm8lduhg = {
    left: left$2,
    right: right$2
  };

  var isLeaf = function (universe, element) {
    return universe.property().children(element).length === 0;
  };
  var before$2 = function (universe, item, isRoot) {
    return seekLeft(universe, item, curry(isLeaf, universe), isRoot);
  };
  var after$3 = function (universe, item, isRoot) {
    return seekRight(universe, item, curry(isLeaf, universe), isRoot);
  };
  var seekLeft = function (universe, item, predicate, isRoot) {
    return $_2cyescqkjm8lduhg.left(universe, item, predicate, isRoot);
  };
  var seekRight = function (universe, item, predicate, isRoot) {
    return $_2cyescqkjm8lduhg.right(universe, item, predicate, isRoot);
  };
  var walkers = function () {
    return {
      left: $_d3v7h3qmjm8lduhv.left,
      right: $_d3v7h3qmjm8lduhv.right
    };
  };
  var walk = function (universe, item, mode, direction, _rules) {
    return $_8cd9jvqljm8lduhk.go(universe, item, mode, direction, _rules);
  };
  var $_4xai48qjjm8lduhb = {
    before: before$2,
    after: after$3,
    seekLeft: seekLeft,
    seekRight: seekRight,
    walkers: walkers,
    walk: walk,
    backtrack: $_8cd9jvqljm8lduhk.backtrack,
    sidestep: $_8cd9jvqljm8lduhk.sidestep,
    advance: $_8cd9jvqljm8lduhk.advance
  };

  var universe$2 = DomUniverse();
  var gather = function (element, prune, transform) {
    return $_4xai48qjjm8lduhb.gather(universe$2, element, prune, transform);
  };
  var before$3 = function (element, isRoot) {
    return $_4xai48qjjm8lduhb.before(universe$2, element, isRoot);
  };
  var after$4 = function (element, isRoot) {
    return $_4xai48qjjm8lduhb.after(universe$2, element, isRoot);
  };
  var seekLeft$1 = function (element, predicate, isRoot) {
    return $_4xai48qjjm8lduhb.seekLeft(universe$2, element, predicate, isRoot);
  };
  var seekRight$1 = function (element, predicate, isRoot) {
    return $_4xai48qjjm8lduhb.seekRight(universe$2, element, predicate, isRoot);
  };
  var walkers$1 = function () {
    return $_4xai48qjjm8lduhb.walkers();
  };
  var walk$1 = function (item, mode, direction, _rules) {
    return $_4xai48qjjm8lduhb.walk(universe$2, item, mode, direction, _rules);
  };
  var $_9l6jnpqijm8lduh7 = {
    gather: gather,
    before: before$3,
    after: after$4,
    seekLeft: seekLeft$1,
    seekRight: seekRight$1,
    walkers: walkers$1,
    walk: walk$1
  };

  var JUMP_SIZE = 5;
  var NUM_RETRIES = 100;
  var adt$2 = Adt.generate([
    { 'none': [] },
    { 'retry': ['caret'] }
  ]);
  var isOutside = function (caret, box) {
    return caret.left() < box.left() || Math.abs(box.right() - caret.left()) < 1 || caret.left() > box.right();
  };
  var inOutsideBlock = function (bridge, element, caret) {
    return $_4sg7f1m7jm8ldthh.closest(element, $_1lk27jnnjm8ldtu0.isBlock).fold(constant(false), function (cell) {
      return $_aknmekqgjm8lduge.getEntireBox(bridge, cell).exists(function (box) {
        return isOutside(caret, box);
      });
    });
  };
  var adjustDown = function (bridge, element, guessBox, original, caret) {
    var lowerCaret = $_bcbsfsqfjm8lduga.moveDown(caret, JUMP_SIZE);
    if (Math.abs(guessBox.bottom() - original.bottom()) < 1)
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() > caret.bottom())
      return adt$2.retry(lowerCaret);
    else if (guessBox.top() === caret.bottom())
      return adt$2.retry($_bcbsfsqfjm8lduga.moveDown(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_bcbsfsqfjm8lduga.translate(lowerCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var adjustUp = function (bridge, element, guessBox, original, caret) {
    var higherCaret = $_bcbsfsqfjm8lduga.moveUp(caret, JUMP_SIZE);
    if (Math.abs(guessBox.top() - original.top()) < 1)
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() < caret.top())
      return adt$2.retry(higherCaret);
    else if (guessBox.bottom() === caret.top())
      return adt$2.retry($_bcbsfsqfjm8lduga.moveUp(caret, 1));
    else
      return inOutsideBlock(bridge, element, caret) ? adt$2.retry($_bcbsfsqfjm8lduga.translate(higherCaret, JUMP_SIZE, 0)) : adt$2.none();
  };
  var upMovement = {
    point: $_bcbsfsqfjm8lduga.getTop,
    adjuster: adjustUp,
    move: $_bcbsfsqfjm8lduga.moveUp,
    gather: $_9l6jnpqijm8lduh7.before
  };
  var downMovement = {
    point: $_bcbsfsqfjm8lduga.getBottom,
    adjuster: adjustDown,
    move: $_bcbsfsqfjm8lduga.moveDown,
    gather: $_9l6jnpqijm8lduh7.after
  };
  var isAtTable = function (bridge, x, y) {
    return bridge.elementFromPoint(x, y).filter(function (elm) {
      return $_aq9fg3m2jm8ldth1.name(elm) === 'table';
    }).isSome();
  };
  var adjustForTable = function (bridge, movement, original, caret, numRetries) {
    return adjustTil(bridge, movement, original, movement.move(caret, JUMP_SIZE), numRetries);
  };
  var adjustTil = function (bridge, movement, original, caret, numRetries) {
    if (numRetries === 0)
      return Option.some(caret);
    if (isAtTable(bridge, caret.left(), movement.point(caret)))
      return adjustForTable(bridge, movement, original, caret, numRetries - 1);
    return bridge.situsFromPoint(caret.left(), movement.point(caret)).bind(function (guess) {
      return guess.start().fold(Option.none, function (element, offset) {
        return $_aknmekqgjm8lduge.getEntireBox(bridge, element, offset).bind(function (guessBox) {
          return movement.adjuster(bridge, element, guessBox, original, caret).fold(Option.none, function (newCaret) {
            return adjustTil(bridge, movement, original, newCaret, numRetries - 1);
          });
        }).orThunk(function () {
          return Option.some(caret);
        });
      }, Option.none);
    });
  };
  var ieTryDown = function (bridge, caret) {
    return bridge.situsFromPoint(caret.left(), caret.bottom() + JUMP_SIZE);
  };
  var ieTryUp = function (bridge, caret) {
    return bridge.situsFromPoint(caret.left(), caret.top() - JUMP_SIZE);
  };
  var checkScroll = function (movement, adjusted, bridge) {
    if (movement.point(adjusted) > bridge.getInnerHeight())
      return Option.some(movement.point(adjusted) - bridge.getInnerHeight());
    else if (movement.point(adjusted) < 0)
      return Option.some(-movement.point(adjusted));
    else
      return Option.none();
  };
  var retry = function (movement, bridge, caret) {
    var moved = movement.move(caret, JUMP_SIZE);
    var adjusted = adjustTil(bridge, movement, caret, moved, NUM_RETRIES).getOr(moved);
    return checkScroll(movement, adjusted, bridge).fold(function () {
      return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted));
    }, function (delta) {
      bridge.scrollBy(0, delta);
      return bridge.situsFromPoint(adjusted.left(), movement.point(adjusted) - delta);
    });
  };
  var $_5lh5wqqhjm8ldugn = {
    tryUp: curry(retry, upMovement),
    tryDown: curry(retry, downMovement),
    ieTryUp: ieTryUp,
    ieTryDown: ieTryDown,
    getJumpSize: constant(JUMP_SIZE)
  };

  var adt$3 = Adt.generate([
    { 'none': ['message'] },
    { 'success': [] },
    { 'failedUp': ['cell'] },
    { 'failedDown': ['cell'] }
  ]);
  var isOverlapping = function (bridge, before, after) {
    var beforeBounds = bridge.getRect(before);
    var afterBounds = bridge.getRect(after);
    return afterBounds.right > beforeBounds.left && afterBounds.left < beforeBounds.right;
  };
  var verify = function (bridge, before, beforeOffset, after, afterOffset, failure, isRoot) {
    return $_6mmdzsm6jm8ldthg.closest(after, 'td,th', isRoot).bind(function (afterCell) {
      return $_6mmdzsm6jm8ldthg.closest(before, 'td,th', isRoot).map(function (beforeCell) {
        if (!$_ak7uzflkjm8ldtfb.eq(afterCell, beforeCell)) {
          return $_g6vmhymqjm8ldtlz.sharedOne(isRow, [
            afterCell,
            beforeCell
          ]).fold(function () {
            return isOverlapping(bridge, beforeCell, afterCell) ? adt$3.success() : failure(beforeCell);
          }, function (sharedRow) {
            return failure(beforeCell);
          });
        } else {
          return $_ak7uzflkjm8ldtfb.eq(after, afterCell) && $_cz58icmijm8ldtjy.getEnd(afterCell) === afterOffset ? failure(beforeCell) : adt$3.none('in same cell');
        }
      });
    }).getOr(adt$3.none('default'));
  };
  var isRow = function (elem) {
    return $_6mmdzsm6jm8ldthg.closest(elem, 'tr');
  };
  var cata$2 = function (subject, onNone, onSuccess, onFailedUp, onFailedDown) {
    return subject.fold(onNone, onSuccess, onFailedUp, onFailedDown);
  };
  var $_1168zuqnjm8lduhz = {
    verify: verify,
    cata: cata$2,
    adt: adt$3
  };

  var point = Immutable('element', 'offset');
  var delta = Immutable('element', 'deltaOffset');
  var range$3 = Immutable('element', 'start', 'finish');
  var points = Immutable('begin', 'end');
  var text = Immutable('element', 'text');
  var $_5gns6nqpjm8lduiy = {
    point: point,
    delta: delta,
    range: range$3,
    points: points,
    text: text
  };

  var inAncestor = Immutable('ancestor', 'descendants', 'element', 'index');
  var inParent = Immutable('parent', 'children', 'element', 'index');
  var childOf = function (element, ancestor) {
    return $_4sg7f1m7jm8ldthh.closest(element, function (elem) {
      return $_8mc5g7lijm8ldtev.parent(elem).exists(function (parent) {
        return $_ak7uzflkjm8ldtfb.eq(parent, ancestor);
      });
    });
  };
  var indexInParent = function (element) {
    return $_8mc5g7lijm8ldtev.parent(element).bind(function (parent) {
      var children = $_8mc5g7lijm8ldtev.children(parent);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var indexOf$1 = function (elements, element) {
    return findIndex(elements, curry($_ak7uzflkjm8ldtfb.eq, element));
  };
  var selectorsInParent = function (element, selector) {
    return $_8mc5g7lijm8ldtev.parent(element).bind(function (parent) {
      var children = $_emvpc1m3jm8ldth3.children(parent, selector);
      return indexOf$1(children, element).map(function (index) {
        return inParent(parent, children, element, index);
      });
    });
  };
  var descendantsInAncestor = function (element, ancestorSelector, descendantSelector) {
    return $_6mmdzsm6jm8ldthg.closest(element, ancestorSelector).bind(function (ancestor) {
      var descendants = $_emvpc1m3jm8ldth3.descendants(ancestor, descendantSelector);
      return indexOf$1(descendants, element).map(function (index) {
        return inAncestor(ancestor, descendants, element, index);
      });
    });
  };
  var $_9g8lk6qqjm8lduj4 = {
    childOf: childOf,
    indexOf: indexOf$1,
    indexInParent: indexInParent,
    selectorsInParent: selectorsInParent,
    descendantsInAncestor: descendantsInAncestor
  };

  var isBr = function (elem) {
    return $_aq9fg3m2jm8ldth1.name(elem) === 'br';
  };
  var gatherer = function (cand, gather, isRoot) {
    return gather(cand, isRoot).bind(function (target) {
      return $_aq9fg3m2jm8ldth1.isText(target) && $_7dj7zlmjjm8ldtk1.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Option.some(target);
    });
  };
  var handleBr = function (isRoot, element, direction) {
    return direction.traverse(element).orThunk(function () {
      return gatherer(element, direction.gather, isRoot);
    }).map(direction.relative);
  };
  var findBr = function (element, offset) {
    return $_8mc5g7lijm8ldtev.child(element, offset).filter(isBr).orThunk(function () {
      return $_8mc5g7lijm8ldtev.child(element, offset - 1).filter(isBr);
    });
  };
  var handleParent = function (isRoot, element, offset, direction) {
    return findBr(element, offset).bind(function (br) {
      return direction.traverse(br).fold(function () {
        return gatherer(br, direction.gather, isRoot).map(direction.relative);
      }, function (adjacent) {
        return $_9g8lk6qqjm8lduj4.indexInParent(adjacent).map(function (info) {
          return $_bqbmi7prjm8ldua4.on(info.parent(), info.index());
        });
      });
    });
  };
  var tryBr = function (isRoot, element, offset, direction) {
    var target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
    return target.map(function (tgt) {
      return {
        start: constant(tgt),
        finish: constant(tgt)
      };
    });
  };
  var process = function (analysis) {
    return $_1168zuqnjm8lduhz.cata(analysis, function (message) {
      return Option.none();
    }, function () {
      return Option.none();
    }, function (cell) {
      return Option.some($_5gns6nqpjm8lduiy.point(cell, 0));
    }, function (cell) {
      return Option.some($_5gns6nqpjm8lduiy.point(cell, $_cz58icmijm8ldtjy.getEnd(cell)));
    });
  };
  var $_db3fzkqojm8lduic = {
    tryBr: tryBr,
    process: process
  };

  var MAX_RETRIES = 20;
  var platform$1 = $_cpch3zlpjm8ldtfu.detect();
  var findSpot = function (bridge, isRoot, direction) {
    return bridge.getSelection().bind(function (sel) {
      return $_db3fzkqojm8lduic.tryBr(isRoot, sel.finish(), sel.foffset(), direction).fold(function () {
        return Option.some($_5gns6nqpjm8lduiy.point(sel.finish(), sel.foffset()));
      }, function (brNeighbour) {
        var range = bridge.fromSitus(brNeighbour);
        var analysis = $_1168zuqnjm8lduhz.verify(bridge, sel.finish(), sel.foffset(), range.finish(), range.foffset(), direction.failure, isRoot);
        return $_db3fzkqojm8lduic.process(analysis);
      });
    });
  };
  var scan = function (bridge, isRoot, element, offset, direction, numRetries) {
    if (numRetries === 0)
      return Option.none();
    return tryCursor(bridge, isRoot, element, offset, direction).bind(function (situs) {
      var range = bridge.fromSitus(situs);
      var analysis = $_1168zuqnjm8lduhz.verify(bridge, element, offset, range.finish(), range.foffset(), direction.failure, isRoot);
      return $_1168zuqnjm8lduhz.cata(analysis, function () {
        return Option.none();
      }, function () {
        return Option.some(situs);
      }, function (cell) {
        if ($_ak7uzflkjm8ldtfb.eq(element, cell) && offset === 0)
          return tryAgain(bridge, element, offset, $_bcbsfsqfjm8lduga.moveUp, direction);
        else
          return scan(bridge, isRoot, cell, 0, direction, numRetries - 1);
      }, function (cell) {
        if ($_ak7uzflkjm8ldtfb.eq(element, cell) && offset === $_cz58icmijm8ldtjy.getEnd(cell))
          return tryAgain(bridge, element, offset, $_bcbsfsqfjm8lduga.moveDown, direction);
        else
          return scan(bridge, isRoot, cell, $_cz58icmijm8ldtjy.getEnd(cell), direction, numRetries - 1);
      });
    });
  };
  var tryAgain = function (bridge, element, offset, move, direction) {
    return $_aknmekqgjm8lduge.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, move(box, $_5lh5wqqhjm8ldugn.getJumpSize()));
    });
  };
  var tryAt = function (bridge, direction, box) {
    if (platform$1.browser.isChrome() || platform$1.browser.isSafari() || platform$1.browser.isFirefox() || platform$1.browser.isEdge())
      return direction.otherRetry(bridge, box);
    else if (platform$1.browser.isIE())
      return direction.ieRetry(bridge, box);
    else
      return Option.none();
  };
  var tryCursor = function (bridge, isRoot, element, offset, direction) {
    return $_aknmekqgjm8lduge.getBoxAt(bridge, element, offset).bind(function (box) {
      return tryAt(bridge, direction, box);
    });
  };
  var handle$2 = function (bridge, isRoot, direction) {
    return findSpot(bridge, isRoot, direction).bind(function (spot) {
      return scan(bridge, isRoot, spot.element(), spot.offset(), direction, MAX_RETRIES).map(bridge.fromSitus);
    });
  };
  var $_9wk4qrqejm8ldufx = { handle: handle$2 };

  var any$1 = function (predicate) {
    return $_4sg7f1m7jm8ldthh.first(predicate).isSome();
  };
  var ancestor$3 = function (scope, predicate, isRoot) {
    return $_4sg7f1m7jm8ldthh.ancestor(scope, predicate, isRoot).isSome();
  };
  var closest$3 = function (scope, predicate, isRoot) {
    return $_4sg7f1m7jm8ldthh.closest(scope, predicate, isRoot).isSome();
  };
  var sibling$3 = function (scope, predicate) {
    return $_4sg7f1m7jm8ldthh.sibling(scope, predicate).isSome();
  };
  var child$4 = function (scope, predicate) {
    return $_4sg7f1m7jm8ldthh.child(scope, predicate).isSome();
  };
  var descendant$3 = function (scope, predicate) {
    return $_4sg7f1m7jm8ldthh.descendant(scope, predicate).isSome();
  };
  var $_2wsj79qrjm8ldujf = {
    any: any$1,
    ancestor: ancestor$3,
    closest: closest$3,
    sibling: sibling$3,
    child: child$4,
    descendant: descendant$3
  };

  var detection = $_cpch3zlpjm8ldtfu.detect();
  var inSameTable = function (elem, table) {
    return $_2wsj79qrjm8ldujf.ancestor(elem, function (e) {
      return $_8mc5g7lijm8ldtev.parent(e).exists(function (p) {
        return $_ak7uzflkjm8ldtfb.eq(p, table);
      });
    });
  };

  var simulate = function (bridge, isRoot, direction, initial, anchor) {
    return $_6mmdzsm6jm8ldthg.closest(initial, 'td,th', isRoot).bind(function (start) {
      return $_6mmdzsm6jm8ldthg.closest(start, 'table', isRoot).bind(function (table) {
        if (!inSameTable(anchor, table))
          return Option.none();
        return $_9wk4qrqejm8ldufx.handle(bridge, isRoot, direction).bind(function (range) {
          return $_6mmdzsm6jm8ldthg.closest(range.finish(), 'td,th', isRoot).map(function (finish) {
            return {
              start: constant(start),
              finish: constant(finish),
              range: constant(range)
            };
          });
        });
      });
    });
  };
  var navigate = function (bridge, isRoot, direction, initial, anchor, precheck) {
    if (detection.browser.isIE()) {
      return Option.none();
    } else {
      return precheck(initial, isRoot).orThunk(function () {
        return simulate(bridge, isRoot, direction, initial, anchor).map(function (info) {
          var range = info.range();
          return $_e0zqzjq7jm8ldudc.response(Option.some($_bcy18yqajm8ldue1.makeSitus(range.start(), range.soffset(), range.finish(), range.foffset())), true);
        });
      });
    }
  };
  var firstUpCheck = function (initial, isRoot) {
    return $_6mmdzsm6jm8ldthg.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_6mmdzsm6jm8ldthg.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_emvpc1m3jm8ldth3.descendants(table, 'tr');
        if ($_ak7uzflkjm8ldtfb.eq(startRow, rows[0])) {
          return $_9l6jnpqijm8lduh7.seekLeft(table, function (element) {
            return $_hxrvqmhjm8ldtjt.last(element).isSome();
          }, isRoot).map(function (last) {
            var lastOffset = $_cz58icmijm8ldtjy.getEnd(last);
            return $_e0zqzjq7jm8ldudc.response(Option.some($_bcy18yqajm8ldue1.makeSitus(last, lastOffset, last, lastOffset)), true);
          });
        } else {
          return Option.none();
        }
      });
    });
  };
  var lastDownCheck = function (initial, isRoot) {
    return $_6mmdzsm6jm8ldthg.closest(initial, 'tr', isRoot).bind(function (startRow) {
      return $_6mmdzsm6jm8ldthg.closest(startRow, 'table', isRoot).bind(function (table) {
        var rows = $_emvpc1m3jm8ldth3.descendants(table, 'tr');
        if ($_ak7uzflkjm8ldtfb.eq(startRow, rows[rows.length - 1])) {
          return $_9l6jnpqijm8lduh7.seekRight(table, function (element) {
            return $_hxrvqmhjm8ldtjt.first(element).isSome();
          }, isRoot).map(function (first) {
            return $_e0zqzjq7jm8ldudc.response(Option.some($_bcy18yqajm8ldue1.makeSitus(first, 0, first, 0)), true);
          });
        } else {
          return Option.none();
        }
      });
    });
  };
  var select = function (bridge, container, isRoot, direction, initial, anchor, selectRange) {
    return simulate(bridge, isRoot, direction, initial, anchor).bind(function (info) {
      return $_f8xp6hqcjm8lduep.detect(container, isRoot, info.start(), info.finish(), selectRange);
    });
  };
  var $_7hx9rsqdjm8lduf1 = {
    navigate: navigate,
    select: select,
    firstUpCheck: firstUpCheck,
    lastDownCheck: lastDownCheck
  };

  var findCell = function (target, isRoot) {
    return $_6mmdzsm6jm8ldthg.closest(target, 'td,th', isRoot);
  };
  function MouseSelection (bridge, container, isRoot, annotations) {
    var cursor = Option.none();
    var clearState = function () {
      cursor = Option.none();
    };
    var mousedown = function (event) {
      annotations.clear(container);
      cursor = findCell(event.target(), isRoot);
    };
    var mouseover = function (event) {
      cursor.each(function (start) {
        annotations.clear(container);
        findCell(event.target(), isRoot).each(function (finish) {
          $_fs2a9mmpjm8ldtl5.identify(start, finish, isRoot).each(function (cellSel) {
            var boxes = cellSel.boxes().getOr([]);
            if (boxes.length > 1 || boxes.length === 1 && !$_ak7uzflkjm8ldtfb.eq(start, finish)) {
              annotations.selectRange(container, boxes, cellSel.start(), cellSel.finish());
              bridge.selectContents(finish);
            }
          });
        });
      });
    };
    var mouseup = function () {
      cursor.each(clearState);
    };
    return {
      mousedown: mousedown,
      mouseover: mouseover,
      mouseup: mouseup
    };
  }

  var $_aw42bcqtjm8ldujq = {
    down: {
      traverse: $_8mc5g7lijm8ldtev.nextSibling,
      gather: $_9l6jnpqijm8lduh7.after,
      relative: $_bqbmi7prjm8ldua4.before,
      otherRetry: $_5lh5wqqhjm8ldugn.tryDown,
      ieRetry: $_5lh5wqqhjm8ldugn.ieTryDown,
      failure: $_1168zuqnjm8lduhz.adt.failedDown
    },
    up: {
      traverse: $_8mc5g7lijm8ldtev.prevSibling,
      gather: $_9l6jnpqijm8lduh7.before,
      relative: $_bqbmi7prjm8ldua4.before,
      otherRetry: $_5lh5wqqhjm8ldugn.tryUp,
      ieRetry: $_5lh5wqqhjm8ldugn.ieTryUp,
      failure: $_1168zuqnjm8lduhz.adt.failedUp
    }
  };

  var rc = Immutable('rows', 'cols');
  var mouse = function (win, container, isRoot, annotations) {
    var bridge = WindowBridge(win);
    var handlers = MouseSelection(bridge, container, isRoot, annotations);
    return {
      mousedown: handlers.mousedown,
      mouseover: handlers.mouseover,
      mouseup: handlers.mouseup
    };
  };
  var keyboard = function (win, container, isRoot, annotations) {
    var bridge = WindowBridge(win);
    var clearToNavigate = function () {
      annotations.clear(container);
      return Option.none();
    };
    var keydown = function (event, start, soffset, finish, foffset, direction) {
      var keycode = event.raw().which;
      var shiftKey = event.raw().shiftKey === true;
      var handler = $_fs2a9mmpjm8ldtl5.retrieve(container, annotations.selectedSelector()).fold(function () {
        if ($_e80r25q8jm8ldudg.isDown(keycode) && shiftKey) {
          return curry($_7hx9rsqdjm8lduf1.select, bridge, container, isRoot, $_aw42bcqtjm8ldujq.down, finish, start, annotations.selectRange);
        } else if ($_e80r25q8jm8ldudg.isUp(keycode) && shiftKey) {
          return curry($_7hx9rsqdjm8lduf1.select, bridge, container, isRoot, $_aw42bcqtjm8ldujq.up, finish, start, annotations.selectRange);
        } else if ($_e80r25q8jm8ldudg.isDown(keycode)) {
          return curry($_7hx9rsqdjm8lduf1.navigate, bridge, isRoot, $_aw42bcqtjm8ldujq.down, finish, start, $_7hx9rsqdjm8lduf1.lastDownCheck);
        } else if ($_e80r25q8jm8ldudg.isUp(keycode)) {
          return curry($_7hx9rsqdjm8lduf1.navigate, bridge, isRoot, $_aw42bcqtjm8ldujq.up, finish, start, $_7hx9rsqdjm8lduf1.firstUpCheck);
        } else {
          return Option.none;
        }
      }, function (selected) {
        var update = function (attempts) {
          return function () {
            var navigation = findMap(attempts, function (delta) {
              return $_f8xp6hqcjm8lduep.update(delta.rows(), delta.cols(), container, selected, annotations);
            });
            return navigation.fold(function () {
              return $_fs2a9mmpjm8ldtl5.getEdges(container, annotations.firstSelectedSelector(), annotations.lastSelectedSelector()).map(function (edges) {
                var relative = $_e80r25q8jm8ldudg.isDown(keycode) || direction.isForward(keycode) ? $_bqbmi7prjm8ldua4.after : $_bqbmi7prjm8ldua4.before;
                bridge.setRelativeSelection($_bqbmi7prjm8ldua4.on(edges.first(), 0), relative(edges.table()));
                annotations.clear(container);
                return $_e0zqzjq7jm8ldudc.response(Option.none(), true);
              });
            }, function (_) {
              return Option.some($_e0zqzjq7jm8ldudc.response(Option.none(), true));
            });
          };
        };
        if ($_e80r25q8jm8ldudg.isDown(keycode) && shiftKey)
          return update([rc(+1, 0)]);
        else if ($_e80r25q8jm8ldudg.isUp(keycode) && shiftKey)
          return update([rc(-1, 0)]);
        else if (direction.isBackward(keycode) && shiftKey)
          return update([
            rc(0, -1),
            rc(-1, 0)
          ]);
        else if (direction.isForward(keycode) && shiftKey)
          return update([
            rc(0, +1),
            rc(+1, 0)
          ]);
        else if ($_e80r25q8jm8ldudg.isNavigation(keycode) && shiftKey === false)
          return clearToNavigate;
        else
          return Option.none;
      });
      return handler();
    };
    var keyup = function (event, start, soffset, finish, foffset) {
      return $_fs2a9mmpjm8ldtl5.retrieve(container, annotations.selectedSelector()).fold(function () {
        var keycode = event.raw().which;
        var shiftKey = event.raw().shiftKey === true;
        if (shiftKey === false)
          return Option.none();
        if ($_e80r25q8jm8ldudg.isNavigation(keycode))
          return $_f8xp6hqcjm8lduep.sync(container, isRoot, start, soffset, finish, foffset, annotations.selectRange);
        else
          return Option.none();
      }, Option.none);
    };
    return {
      keydown: keydown,
      keyup: keyup
    };
  };
  var $_fsqw20q6jm8lducw = {
    mouse: mouse,
    keyboard: keyboard
  };

  var add$3 = function (element, classes) {
    each(classes, function (x) {
      $_ersi15o2jm8ldtxp.add(element, x);
    });
  };
  var remove$7 = function (element, classes) {
    each(classes, function (x) {
      $_ersi15o2jm8ldtxp.remove(element, x);
    });
  };
  var toggle$2 = function (element, classes) {
    each(classes, function (x) {
      $_ersi15o2jm8ldtxp.toggle(element, x);
    });
  };
  var hasAll = function (element, classes) {
    return forall(classes, function (clazz) {
      return $_ersi15o2jm8ldtxp.has(element, clazz);
    });
  };
  var hasAny = function (element, classes) {
    return exists(classes, function (clazz) {
      return $_ersi15o2jm8ldtxp.has(element, clazz);
    });
  };
  var getNative = function (element) {
    var classList = element.dom().classList;
    var r = new Array(classList.length);
    for (var i = 0; i < classList.length; i++) {
      r[i] = classList.item(i);
    }
    return r;
  };
  var get$11 = function (element) {
    return $_309xago4jm8ldtxs.supports(element) ? getNative(element) : $_309xago4jm8ldtxs.get(element);
  };
  var $_8sciiaqwjm8ldukf = {
    add: add$3,
    remove: remove$7,
    toggle: toggle$2,
    hasAll: hasAll,
    hasAny: hasAny,
    get: get$11
  };

  var addClass = function (clazz) {
    return function (element) {
      $_ersi15o2jm8ldtxp.add(element, clazz);
    };
  };
  var removeClass = function (clazz) {
    return function (element) {
      $_ersi15o2jm8ldtxp.remove(element, clazz);
    };
  };
  var removeClasses = function (classes) {
    return function (element) {
      $_8sciiaqwjm8ldukf.remove(element, classes);
    };
  };
  var hasClass = function (clazz) {
    return function (element) {
      return $_ersi15o2jm8ldtxp.has(element, clazz);
    };
  };
  var $_667cpnqvjm8ldukd = {
    addClass: addClass,
    removeClass: removeClass,
    removeClasses: removeClasses,
    hasClass: hasClass
  };

  var byClass = function (ephemera) {
    var addSelectionClass = $_667cpnqvjm8ldukd.addClass(ephemera.selected());
    var removeSelectionClasses = $_667cpnqvjm8ldukd.removeClasses([
      ephemera.selected(),
      ephemera.lastSelected(),
      ephemera.firstSelected()
    ]);
    var clear = function (container) {
      var sels = $_emvpc1m3jm8ldth3.descendants(container, ephemera.selectedSelector());
      each(sels, removeSelectionClasses);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      each(cells, addSelectionClass);
      $_ersi15o2jm8ldtxp.add(start, ephemera.firstSelected());
      $_ersi15o2jm8ldtxp.add(finish, ephemera.lastSelected());
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var byAttr = function (ephemera) {
    var removeSelectionAttributes = function (element) {
      $_dz8wvwm1jm8ldtgt.remove(element, ephemera.selected());
      $_dz8wvwm1jm8ldtgt.remove(element, ephemera.firstSelected());
      $_dz8wvwm1jm8ldtgt.remove(element, ephemera.lastSelected());
    };
    var addSelectionAttribute = function (element) {
      $_dz8wvwm1jm8ldtgt.set(element, ephemera.selected(), '1');
    };
    var clear = function (container) {
      var sels = $_emvpc1m3jm8ldth3.descendants(container, ephemera.selectedSelector());
      each(sels, removeSelectionAttributes);
    };
    var selectRange = function (container, cells, start, finish) {
      clear(container);
      each(cells, addSelectionAttribute);
      $_dz8wvwm1jm8ldtgt.set(start, ephemera.firstSelected(), '1');
      $_dz8wvwm1jm8ldtgt.set(finish, ephemera.lastSelected(), '1');
    };
    return {
      clear: clear,
      selectRange: selectRange,
      selectedSelector: ephemera.selectedSelector,
      firstSelectedSelector: ephemera.firstSelectedSelector,
      lastSelectedSelector: ephemera.lastSelectedSelector
    };
  };
  var $_fy98equjm8lduk1 = {
    byClass: byClass,
    byAttr: byAttr
  };

  var hasInternalTarget = function (e) {
    return $_ersi15o2jm8ldtxp.has(Element$$1.fromDom(e.target), 'ephox-snooker-resizer-bar') === false;
  };
  function CellSelection$1 (editor, lazyResize) {
    var handlerStruct = MixedBag([
      'mousedown',
      'mouseover',
      'mouseup',
      'keyup',
      'keydown'
    ], []);
    var handlers = Option.none();
    var annotations = $_fy98equjm8lduk1.byAttr($_4r0i1yn1jm8ldtp2);
    editor.on('init', function (e) {
      var win = editor.getWin();
      var body = getBody$1(editor);
      var isRoot = getIsRoot(editor);
      var syncSelection = function () {
        var sel = editor.selection;
        var start = Element$$1.fromDom(sel.getStart());
        var end = Element$$1.fromDom(sel.getEnd());
        var shared = $_g6vmhymqjm8ldtlz.sharedOne($_b4ktmplcjm8ldtd5.table, [
          start,
          end
        ]);
        shared.fold(function () {
          annotations.clear(body);
        }, noop);
      };
      var mouseHandlers = $_fsqw20q6jm8lducw.mouse(win, body, isRoot, annotations);
      var keyHandlers = $_fsqw20q6jm8lducw.keyboard(win, body, isRoot, annotations);
      var hasShiftKey = function (event) {
        return event.raw().shiftKey === true;
      };
      var handleResponse = function (event, response) {
        if (!hasShiftKey(event)) {
          return;
        }
        if (response.kill()) {
          event.kill();
        }
        response.selection().each(function (ns) {
          var relative = $_2051gcpqjm8ldu9x.relative(ns.start(), ns.finish());
          var rng = $_7dwdrupwjm8lduaw.asLtrRange(win, relative);
          editor.selection.setRng(rng);
        });
      };
      var keyup = function (event) {
        var wrappedEvent = wrapEvent(event);
        if (wrappedEvent.raw().shiftKey && $_e80r25q8jm8ldudg.isNavigation(wrappedEvent.raw().which)) {
          var rng = editor.selection.getRng();
          var start = Element$$1.fromDom(rng.startContainer);
          var end = Element$$1.fromDom(rng.endContainer);
          keyHandlers.keyup(wrappedEvent, start, rng.startOffset, end, rng.endOffset).each(function (response) {
            handleResponse(wrappedEvent, response);
          });
        }
      };
      var keydown = function (event) {
        var wrappedEvent = wrapEvent(event);
        lazyResize().each(function (resize) {
          resize.hideBars();
        });
        var rng = editor.selection.getRng();
        var startContainer = Element$$1.fromDom(editor.selection.getStart());
        var start = Element$$1.fromDom(rng.startContainer);
        var end = Element$$1.fromDom(rng.endContainer);
        var direction = $_7ns090okjm8ldu0r.directionAt(startContainer).isRtl() ? $_e80r25q8jm8ldudg.rtl : $_e80r25q8jm8ldudg.ltr;
        keyHandlers.keydown(wrappedEvent, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
          handleResponse(wrappedEvent, response);
        });
        lazyResize().each(function (resize) {
          resize.showBars();
        });
      };
      var isMouseEvent = function (event) {
        return event.hasOwnProperty('x') && event.hasOwnProperty('y');
      };
      var wrapEvent = function (event) {
        var target = Element$$1.fromDom(event.target);
        var stop = function () {
          event.stopPropagation();
        };
        var prevent = function () {
          event.preventDefault();
        };
        var kill = compose(prevent, stop);
        return {
          target: constant(target),
          x: constant(isMouseEvent(event) ? event.x : null),
          y: constant(isMouseEvent(event) ? event.y : null),
          stop: stop,
          prevent: prevent,
          kill: kill,
          raw: constant(event)
        };
      };
      var isLeftMouse = function (raw) {
        return raw.button === 0;
      };
      var isLeftButtonPressed = function (raw) {
        if (raw.buttons === undefined) {
          return true;
        }
        return (raw.buttons & 1) !== 0;
      };
      var mouseDown = function (e) {
        if (isLeftMouse(e) && hasInternalTarget(e)) {
          mouseHandlers.mousedown(wrapEvent(e));
        }
      };
      var mouseOver = function (e) {
        if (isLeftButtonPressed(e) && hasInternalTarget(e)) {
          mouseHandlers.mouseover(wrapEvent(e));
        }
      };
      var mouseUp = function (e) {
        if (isLeftMouse(e) && hasInternalTarget(e)) {
          mouseHandlers.mouseup(wrapEvent(e));
        }
      };
      editor.on('mousedown', mouseDown);
      editor.on('mouseover', mouseOver);
      editor.on('mouseup', mouseUp);
      editor.on('keyup', keyup);
      editor.on('keydown', keydown);
      editor.on('nodechange', syncSelection);
      handlers = Option.some(handlerStruct({
        mousedown: mouseDown,
        mouseover: mouseOver,
        mouseup: mouseUp,
        keyup: keyup,
        keydown: keydown
      }));
    });
    var destroy = function () {
      handlers.each(function (handlers) {
      });
    };
    return {
      clear: annotations.clear,
      destroy: destroy
    };
  }

  var Selections = function (editor) {
    var get = function () {
      var body = getBody$1(editor);
      return $_focu8ymojm8ldtku.retrieve(body, $_4r0i1yn1jm8ldtp2.selectedSelector()).fold(function () {
        if (editor.selection.getStart() === undefined) {
          return $_9a98sin2jm8ldtp4.none();
        } else {
          return $_9a98sin2jm8ldtp4.single(editor.selection);
        }
      }, function (cells) {
        return $_9a98sin2jm8ldtp4.multiple(cells);
      });
    };
    return { get: get };
  };

  var each$4 = global$1.each;
  var addButtons = function (editor) {
    var menuItems = [];
    each$4('inserttable tableprops deletetable | cell row column'.split(' '), function (name) {
      if (name === '|') {
        menuItems.push({ text: '-' });
      } else {
        menuItems.push(editor.menuItems[name]);
      }
    });
    editor.addButton('table', {
      type: 'menubutton',
      title: 'Table',
      menu: menuItems
    });
    function cmd(command) {
      return function () {
        editor.execCommand(command);
      };
    }
    editor.addButton('tableprops', {
      title: 'Table properties',
      onclick: cmd('mceTableProps'),
      icon: 'table'
    });
    editor.addButton('tabledelete', {
      title: 'Delete table',
      onclick: cmd('mceTableDelete')
    });
    editor.addButton('tablecellprops', {
      title: 'Cell properties',
      onclick: cmd('mceTableCellProps')
    });
    editor.addButton('tablemergecells', {
      title: 'Merge cells',
      onclick: cmd('mceTableMergeCells')
    });
    editor.addButton('tablesplitcells', {
      title: 'Split cell',
      onclick: cmd('mceTableSplitCells')
    });
    editor.addButton('tableinsertrowbefore', {
      title: 'Insert row before',
      onclick: cmd('mceTableInsertRowBefore')
    });
    editor.addButton('tableinsertrowafter', {
      title: 'Insert row after',
      onclick: cmd('mceTableInsertRowAfter')
    });
    editor.addButton('tabledeleterow', {
      title: 'Delete row',
      onclick: cmd('mceTableDeleteRow')
    });
    editor.addButton('tablerowprops', {
      title: 'Row properties',
      onclick: cmd('mceTableRowProps')
    });
    editor.addButton('tablecutrow', {
      title: 'Cut row',
      onclick: cmd('mceTableCutRow')
    });
    editor.addButton('tablecopyrow', {
      title: 'Copy row',
      onclick: cmd('mceTableCopyRow')
    });
    editor.addButton('tablepasterowbefore', {
      title: 'Paste row before',
      onclick: cmd('mceTablePasteRowBefore')
    });
    editor.addButton('tablepasterowafter', {
      title: 'Paste row after',
      onclick: cmd('mceTablePasteRowAfter')
    });
    editor.addButton('tableinsertcolbefore', {
      title: 'Insert column before',
      onclick: cmd('mceTableInsertColBefore')
    });
    editor.addButton('tableinsertcolafter', {
      title: 'Insert column after',
      onclick: cmd('mceTableInsertColAfter')
    });
    editor.addButton('tabledeletecol', {
      title: 'Delete column',
      onclick: cmd('mceTableDeleteCol')
    });
  };
  var addToolbars = function (editor) {
    var isTable = function (table) {
      var selectorMatched = editor.dom.is(table, 'table') && editor.getBody().contains(table);
      return selectorMatched;
    };
    var toolbar = getToolbar(editor);
    if (toolbar.length > 0) {
      editor.addContextToolbar(isTable, toolbar.join(' '));
    }
  };
  var $_6o7ssgqyjm8ldukm = {
    addButtons: addButtons,
    addToolbars: addToolbars
  };

  var addMenuItems = function (editor, selections) {
    var targets = Option.none();
    var tableCtrls = [];
    var cellCtrls = [];
    var mergeCtrls = [];
    var unmergeCtrls = [];
    var noTargetDisable = function (ctrl) {
      ctrl.disabled(true);
    };
    var ctrlEnable = function (ctrl) {
      ctrl.disabled(false);
    };
    var pushTable = function () {
      var self = this;
      tableCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        ctrlEnable(self);
      });
    };
    var pushCell = function () {
      var self = this;
      cellCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        ctrlEnable(self);
      });
    };
    var pushMerge = function () {
      var self = this;
      mergeCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        self.disabled(targets.mergable().isNone());
      });
    };
    var pushUnmerge = function () {
      var self = this;
      unmergeCtrls.push(self);
      targets.fold(function () {
        noTargetDisable(self);
      }, function (targets) {
        self.disabled(targets.unmergable().isNone());
      });
    };
    var setDisabledCtrls = function () {
      targets.fold(function () {
        each(tableCtrls, noTargetDisable);
        each(cellCtrls, noTargetDisable);
        each(mergeCtrls, noTargetDisable);
        each(unmergeCtrls, noTargetDisable);
      }, function (targets) {
        each(tableCtrls, ctrlEnable);
        each(cellCtrls, ctrlEnable);
        each(mergeCtrls, function (mergeCtrl) {
          mergeCtrl.disabled(targets.mergable().isNone());
        });
        each(unmergeCtrls, function (unmergeCtrl) {
          unmergeCtrl.disabled(targets.unmergable().isNone());
        });
      });
    };
    editor.on('init', function () {
      editor.on('nodechange', function (e) {
        var cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
        targets = cellOpt.bind(function (cellDom) {
          var cell = Element$$1.fromDom(cellDom);
          var table = $_b4ktmplcjm8ldtd5.table(cell);
          return table.map(function (table) {
            return $_8xltjimmjm8ldtkc.forMenu(selections, table, cell);
          });
        });
        setDisabledCtrls();
      });
    });
    var generateTableGrid = function () {
      var html = '';
      html = '<table role="grid" class="mce-grid mce-grid-border" aria-readonly="true">';
      for (var y = 0; y < 10; y++) {
        html += '<tr>';
        for (var x = 0; x < 10; x++) {
          html += '<td role="gridcell" tabindex="-1"><a id="mcegrid' + (y * 10 + x) + '" href="#" ' + 'data-mce-x="' + x + '" data-mce-y="' + y + '"></a></td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      html += '<div class="mce-text-center" role="presentation">1 x 1</div>';
      return html;
    };
    var selectGrid = function (editor, tx, ty, control) {
      var table = control.getEl().getElementsByTagName('table')[0];
      var x, y, focusCell, cell, active;
      var rtl = control.isRtl() || control.parent().rel === 'tl-tr';
      table.nextSibling.innerHTML = tx + 1 + ' x ' + (ty + 1);
      if (rtl) {
        tx = 9 - tx;
      }
      for (y = 0; y < 10; y++) {
        for (x = 0; x < 10; x++) {
          cell = table.rows[y].childNodes[x].firstChild;
          active = (rtl ? x >= tx : x <= tx) && y <= ty;
          editor.dom.toggleClass(cell, 'mce-active', active);
          if (active) {
            focusCell = cell;
          }
        }
      }
      return focusCell.parentNode;
    };
    var insertTable = hasTableGrid(editor) === false ? {
      text: 'Table',
      icon: 'table',
      context: 'table',
      onclick: cmd('mceInsertTable')
    } : {
      text: 'Table',
      icon: 'table',
      context: 'table',
      ariaHideMenu: true,
      onclick: function (e) {
        if (e.aria) {
          this.parent().hideAll();
          e.stopImmediatePropagation();
          editor.execCommand('mceInsertTable');
        }
      },
      onshow: function () {
        selectGrid(editor, 0, 0, this.menu.items()[0]);
      },
      onhide: function () {
        var elements = this.menu.items()[0].getEl().getElementsByTagName('a');
        editor.dom.removeClass(elements, 'mce-active');
        editor.dom.addClass(elements[0], 'mce-active');
      },
      menu: [{
          type: 'container',
          html: generateTableGrid(),
          onPostRender: function () {
            this.lastX = this.lastY = 0;
          },
          onmousemove: function (e) {
            var target = e.target;
            var x, y;
            if (target.tagName.toUpperCase() === 'A') {
              x = parseInt(target.getAttribute('data-mce-x'), 10);
              y = parseInt(target.getAttribute('data-mce-y'), 10);
              if (this.isRtl() || this.parent().rel === 'tl-tr') {
                x = 9 - x;
              }
              if (x !== this.lastX || y !== this.lastY) {
                selectGrid(editor, x, y, e.control);
                this.lastX = x;
                this.lastY = y;
              }
            }
          },
          onclick: function (e) {
            var self = this;
            if (e.target.tagName.toUpperCase() === 'A') {
              e.preventDefault();
              e.stopPropagation();
              self.parent().cancel();
              editor.undoManager.transact(function () {
                $_9g4jitoxjm8ldu2p.insert(editor, self.lastX + 1, self.lastY + 1);
              });
              editor.addVisual();
            }
          }
        }]
    };
    function cmd(command) {
      return function () {
        editor.execCommand(command);
      };
    }
    var tableProperties = {
      text: 'Table properties',
      context: 'table',
      onPostRender: pushTable,
      onclick: cmd('mceTableProps')
    };
    var deleteTable = {
      text: 'Delete table',
      context: 'table',
      onPostRender: pushTable,
      cmd: 'mceTableDelete'
    };
    var row = {
      text: 'Row',
      context: 'table',
      menu: [
        {
          text: 'Insert row before',
          onclick: cmd('mceTableInsertRowBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Insert row after',
          onclick: cmd('mceTableInsertRowAfter'),
          onPostRender: pushCell
        },
        {
          text: 'Delete row',
          onclick: cmd('mceTableDeleteRow'),
          onPostRender: pushCell
        },
        {
          text: 'Row properties',
          onclick: cmd('mceTableRowProps'),
          onPostRender: pushCell
        },
        { text: '-' },
        {
          text: 'Cut row',
          onclick: cmd('mceTableCutRow'),
          onPostRender: pushCell
        },
        {
          text: 'Copy row',
          onclick: cmd('mceTableCopyRow'),
          onPostRender: pushCell
        },
        {
          text: 'Paste row before',
          onclick: cmd('mceTablePasteRowBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Paste row after',
          onclick: cmd('mceTablePasteRowAfter'),
          onPostRender: pushCell
        }
      ]
    };
    var column = {
      text: 'Column',
      context: 'table',
      menu: [
        {
          text: 'Insert column before',
          onclick: cmd('mceTableInsertColBefore'),
          onPostRender: pushCell
        },
        {
          text: 'Insert column after',
          onclick: cmd('mceTableInsertColAfter'),
          onPostRender: pushCell
        },
        {
          text: 'Delete column',
          onclick: cmd('mceTableDeleteCol'),
          onPostRender: pushCell
        }
      ]
    };
    var cell = {
      separator: 'before',
      text: 'Cell',
      context: 'table',
      menu: [
        {
          text: 'Cell properties',
          onclick: cmd('mceTableCellProps'),
          onPostRender: pushCell
        },
        {
          text: 'Merge cells',
          onclick: cmd('mceTableMergeCells'),
          onPostRender: pushMerge
        },
        {
          text: 'Split cell',
          onclick: cmd('mceTableSplitCells'),
          onPostRender: pushUnmerge
        }
      ]
    };
    editor.addMenuItem('inserttable', insertTable);
    editor.addMenuItem('tableprops', tableProperties);
    editor.addMenuItem('deletetable', deleteTable);
    editor.addMenuItem('row', row);
    editor.addMenuItem('column', column);
    editor.addMenuItem('cell', cell);
  };
  var $_fotrnqqzjm8ldukp = { addMenuItems: addMenuItems };

  var getClipboardRows = function (clipboardRows) {
    return clipboardRows.get().fold(function () {
      return;
    }, function (rows) {
      return map(rows, function (row) {
        return row.dom();
      });
    });
  };
  var setClipboardRows = function (rows, clipboardRows) {
    var sugarRows = map(rows, Element$$1.fromDom);
    clipboardRows.set(Option.from(sugarRows));
  };
  var getApi = function (editor, clipboardRows) {
    return {
      insertTable: function (columns, rows) {
        return $_9g4jitoxjm8ldu2p.insert(editor, columns, rows);
      },
      setClipboardRows: function (rows) {
        return setClipboardRows(rows, clipboardRows);
      },
      getClipboardRows: function () {
        return getClipboardRows(clipboardRows);
      }
    };
  };

  function Plugin(editor) {
    var resizeHandler = ResizeHandler(editor);
    var cellSelection = CellSelection$1(editor, resizeHandler.lazyResize);
    var actions = TableActions(editor, resizeHandler.lazyWire);
    var selections = Selections(editor);
    var clipboardRows = Cell(Option.none());
    $_65378coojm8ldu15.registerCommands(editor, actions, cellSelection, selections, clipboardRows);
    $_77gh87kzjm8ldtav.registerEvents(editor, selections, actions, cellSelection);
    $_fotrnqqzjm8ldukp.addMenuItems(editor, selections);
    $_6o7ssgqyjm8ldukm.addButtons(editor);
    $_6o7ssgqyjm8ldukm.addToolbars(editor);
    editor.on('PreInit', function () {
      editor.serializer.addTempAttr($_4r0i1yn1jm8ldtp2.firstSelected());
      editor.serializer.addTempAttr($_4r0i1yn1jm8ldtp2.lastSelected());
    });
    if (hasTabNavigation(editor)) {
      editor.on('keydown', function (e) {
        $_f2iyqtpnjm8ldu8x.handle(e, editor, actions, resizeHandler.lazyWire);
      });
    }
    editor.on('remove', function () {
      resizeHandler.destroy();
      cellSelection.destroy();
    });
    return getApi(editor, clipboardRows);
  }
  global.add('table', Plugin);
  function Plugin$1 () {
  }

  return Plugin$1;

}());
})();
