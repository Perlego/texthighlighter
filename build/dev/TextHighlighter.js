(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IGNORE_TAGS = exports.LENGTH_ATTR = exports.START_OFFSET_ATTR = exports.TIMESTAMP_ATTR = exports.DATA_ATTR = void 0;

/**
 * Attribute added by default to every highlight.
 * @type {string}
 */
var DATA_ATTR = "data-highlighted";
/**
 * Attribute used to group highlight wrappers.
 * @type {string}
 */

exports.DATA_ATTR = DATA_ATTR;
var TIMESTAMP_ATTR = "data-timestamp";
exports.TIMESTAMP_ATTR = TIMESTAMP_ATTR;
var START_OFFSET_ATTR = "data-start-offset";
exports.START_OFFSET_ATTR = START_OFFSET_ATTR;
var LENGTH_ATTR = "data-length";
/**
 * Don't highlight content of these tags.
 * @type {string[]}
 */

exports.LENGTH_ATTR = LENGTH_ATTR;
var IGNORE_TAGS = ["SCRIPT", "STYLE", "SELECT", "OPTION", "BUTTON", "OBJECT", "APPLET", "VIDEO", "AUDIO", "CANVAS", "EMBED", "PARAM", "METER", "PROGRESS"];
exports.IGNORE_TAGS = IGNORE_TAGS;

},{}],2:[function(require,module,exports){
(function (global){
"use strict";

var _textHighlighter = _interopRequireDefault(require("./text-highlighter"));

require("./jquery-plugin");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/**
 * Expose the TextHighlighter class globally to be
 * used in demos and to be injected directly into html files.
 */
global.TextHighlighter = _textHighlighter["default"];
/**
 * Load the jquery plugin globally expecting jQuery and TextHighlighter to be globally
 * avaiable, this means this library doesn't need a hard requirement of jQuery.
 */

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./jquery-plugin":5,"./text-highlighter":6}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _highlights = require("../utils/highlights");

var _config = require("../config");

var _dom = _interopRequireDefault(require("../utils/dom"));

var _arrays = require("../utils/arrays");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * IndependenciaHighlighter that provides text highlighting functionality to dom elements
 * with a focus on removing interdependence between highlights and other element nodes in the context element.
 */
var IndependenciaHighlighter =
/*#__PURE__*/
function () {
  /**
   * Creates an IndependenciaHighlighter instance for functionality that focuses for highlight independence.
   *
   * @param {HTMLElement} element - DOM element to which highlighted will be applied.
   * @param {object} [options] - additional options.
   * @param {string} options.color - highlight color.
   * @param {string} options.highlightedClass - class added to highlight, 'highlighted' by default.
   * @param {string} options.contextClass - class added to element to which highlighter is applied,
   *  'highlighter-context' by default.
   * @param {function} options.onRemoveHighlight - function called before highlight is removed. Highlight is
   *  passed as param. Function should return true if highlight should be removed, or false - to prevent removal.
   * @param {function} options.onBeforeHighlight - function called before highlight is created. Range object is
   *  passed as param. Function should return true to continue processing, or false - to prevent highlighting.
   * @param {function} options.onAfterHighlight - function called after highlight is created. Array of created
   * wrappers is passed as param.
   * @class IndependenciaHighlighter
   */
  function IndependenciaHighlighter(element, options) {
    _classCallCheck(this, IndependenciaHighlighter);

    this.el = element;
    this.options = options;
  }
  /**
   * Highlights the range allowing isolation for overlapping highlights.
   * This solution steals the text or other nodes in the DOM from overlapping (NOT NESTED) highlights
   * for representation in the DOM.
   *
   * For the purpose of serialisation this will maintain a data attribute on the highlight wrapper
   * with the start text and end text offsets relative to the context root element.
   *
   * Wraps text of given range object in wrapper element.
   *
   * @param {Range} range
   * @param {HTMLElement} wrapper
   * @returns {Array} - array of created highlights.
   * @memberof IndependenciaHighlighter
   */


  _createClass(IndependenciaHighlighter, [{
    key: "highlightRange",
    value: function highlightRange(range, wrapper) {
      if (!range || range.collapsed) {
        return [];
      }

      console.log("ALSDebug29: RANGE: ", range);
      var highlights = [];
      var wrapperClone = wrapper.cloneNode(true);
      var startOffset = (0, _highlights.getElementOffset)(range.startContainer, this.el) + range.startOffset;
      var endOffset = range.startContainer === range.endContainer ? startOffset + (range.endOffset - range.startOffset) : (0, _highlights.getElementOffset)(range.endContainer, this.el) + range.endOffset;
      console.log("ALSDebug29: startOffset: ", startOffset, "endOffset: ", endOffset);
      wrapperClone.setAttribute(_config.START_OFFSET_ATTR, startOffset); // wrapperClone.setAttribute(END_OFFSET_ATTR, endOffset);

      wrapperClone.setAttribute(_config.DATA_ATTR, true);
      console.log("\n\n\n FINDING START CONTAINER FIRST TEXT NODE ");
      console.log("range.startContainer: ", range.startContainer);
      var startContainer = (0, _highlights.findTextNodeAtLocation)(range.startContainer, "start");
      console.log("\n\n\n FINDING END CONTAINER FIRST TEXT NODE ");
      console.log("range.endContainer: ", range.endContainer);
      var endContainer = (0, _highlights.findTextNodeAtLocation)(range.endContainer, "start");

      if (!startContainer || !endContainer) {
        throw new Error("Failed to find the text node for the start or the end of the selected range");
      }

      var afterNewHighlight = range.endOffset < endContainer.textContent.length - 1 ? endContainer.splitText(range.endOffset) : endContainer;

      if (startContainer === endContainer) {
        var startOfNewHighlight = range.startOffset > 0 ? startContainer.splitText(range.startOffset) : startContainer; // Simply wrap the selected range in the same container as a highlight.

        var highlight = (0, _dom["default"])(startOfNewHighlight).wrap(wrapperClone);
        highlights.push(highlight);
      } else if (endContainer.textContent.length >= range.endOffset) {
        var _startOfNewHighlight = startContainer.splitText(range.startOffset);

        var endOfNewHighlight = afterNewHighlight.previousSibling;
        console.log("Node at the start of the new highlight: ", _startOfNewHighlight);
        console.log("Node at the end of new highlight: ", endOfNewHighlight);
        var startElementParent = (0, _highlights.findFirstNonSharedParent)({
          childElement: _startOfNewHighlight,
          otherElement: endOfNewHighlight
        });
        var startElementParentCopy;
        var startOfNewHighlightCopy;

        if (startElementParent) {
          var _extractElementConten = (0, _highlights.extractElementContentForHighlight)({
            element: _startOfNewHighlight,
            elementAncestor: startElementParent,
            options: this.options,
            locationInSelection: "start"
          });

          startElementParentCopy = _extractElementConten.elementAncestorCopy;
          startOfNewHighlightCopy = _extractElementConten.elementCopy;
          console.log("startElementParent:", startElementParent);
          console.log("startElementParentCopy: ", startElementParentCopy);
        }

        var endElementParent = (0, _highlights.findFirstNonSharedParent)({
          childElement: endOfNewHighlight,
          otherElement: _startOfNewHighlight
        });
        var endElementParentCopy;
        var endOfNewHighlightCopy;

        if (endElementParent) {
          var _extractElementConten2 = (0, _highlights.extractElementContentForHighlight)({
            element: endOfNewHighlight,
            elementAncestor: endElementParent,
            options: this.options,
            locationInSelection: "end"
          });

          endElementParentCopy = _extractElementConten2.elementAncestorCopy;
          endOfNewHighlightCopy = _extractElementConten2.elementcopy;
          console.log("Node that is the wrapper of the end of the new highlight: ", endElementParent);
          console.log("Cloned of node that is the wrapper of the end of the new highlight after removing siblings and unwrapping highlight spans: ", endElementParentCopy);
        }

        (0, _highlights.addNodesToHighlightAfterElement)({
          element: startOfNewHighlightCopy || _startOfNewHighlight,
          elementAncestor: startElementParentCopy,
          highlightWrapper: wrapperClone,
          highlightedClass: this.options.highlightedClass
        }); // TODO: add containers in between.

        var containersInBetween = (0, _highlights.nodesInBetween)(startContainer, endContainer);
        console.log("CONTAINERS IN BETWEEN: ", containersInBetween);
        containersInBetween.forEach(function (container) {
          wrapperClone.appendChild(container);
        });

        if (endElementParentCopy) {
          // Only copy the children of a highlighted span into our new highlight.
          if (endElementParentCopy.classList.contains(this.options.highlightedClass)) {
            endElementParentCopy.childNodes.forEach(function (childNode) {
              wrapperClone.appendChild(childNode);
            });
          } else {
            wrapperClone.appendChild(endElementParentCopy);
          }
        } else {
          wrapperClone.appendChild(endOfNewHighlight);
        }

        (0, _dom["default"])(wrapperClone).insertBefore(endElementParent ? endElementParent : afterNewHighlight);
      }

      return highlights;
    }
    /**
     * Highlights current range.
     * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
     * @memberof IndependenciaHighlighter
     */

  }, {
    key: "doHighlight",
    value: function doHighlight(keepRange) {
      var range = (0, _dom["default"])(this.el).getRange(),
          wrapper,
          timestamp;

      if (!range || range.collapsed) {
        return;
      }

      if (this.options.onBeforeHighlight(range) === true) {
        timestamp = +new Date();
        wrapper = (0, _highlights.createWrapper)(this.options);
        wrapper.setAttribute(_config.TIMESTAMP_ATTR, timestamp);
        var descriptors = (0, _highlights.createDescriptors)({
          rootElement: this.el,
          range: range,
          wrapper: wrapper
        }); // createdHighlights = this.highlightRange(range, wrapper);
        // normalizedHighlights = this.normalizeHighlights(createdHighlights);

        var processedDescriptors = this.options.onAfterHighlight(range, descriptors, timestamp);
        this.deserializeHighlights(processedDescriptors);
      }

      if (!keepRange) {
        (0, _dom["default"])(this.el).removeAllRanges();
      }
    }
    /**
     * Normalizes highlights. Ensures text nodes within any given element node are merged together.
     *
     * @param {Array} highlights - highlights to normalize.
     * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
     * input highlights.
     * @memberof IndependenciaHighlighter
     */

  }, {
    key: "normalizeHighlights",
    value: function normalizeHighlights(highlights) {
      var normalizedHighlights; //Since we're not merging or flattening, we need to normalise the text nodes.

      highlights.forEach(function (highlight) {
        (0, _dom["default"])(highlight).normalizeTextNodes();
      }); // omit removed nodes

      normalizedHighlights = highlights.filter(function (hl) {
        return hl.parentElement ? hl : null;
      });
      normalizedHighlights = (0, _arrays.unique)(normalizedHighlights);
      normalizedHighlights.sort(function (a, b) {
        return a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft;
      });
      return normalizedHighlights;
    }
    /**
     * Removes highlights from element. If element is a highlight itself, it is removed as well.
     * If no element is given, all highlights are removed.
     * @param {HTMLElement} [element] - element to remove highlights from
     * @memberof IndependenciaHighlighter
     */

  }, {
    key: "removeHighlights",
    value: function removeHighlights(element) {
      var container = element || this.el,
          highlights = this.getHighlights(),
          self = this;

      function removeHighlight(highlight) {
        if (highlight.className === container.className) {
          (0, _dom["default"])(highlight).unwrap();
        }
      }

      highlights.forEach(function (hl) {
        if (self.options.onRemoveHighlight(hl) === true) {
          removeHighlight(hl);
        }
      });
    }
    /**
     * Returns highlights from given container.
     * @param params
     * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
     * highlighter is applied to.
     * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
     * returned results. Default: true.
     * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
     * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
     * property. Default: false.
     * @returns {Array} - array of highlights.
     * @memberof IndependenciaHighlighter
     */

  }, {
    key: "getHighlights",
    value: function getHighlights(params) {
      var mergedParams = _objectSpread({
        container: this.el,
        dataAttr: _config.DATA_ATTR,
        timestampAttr: _config.TIMESTAMP_ATTR
      }, params);

      return (0, _highlights.retrieveHighlights)(mergedParams);
    }
    /**
     * Returns true if element is a highlight.
     *
     * @param el - element to check.
     * @returns {boolean}
     * @memberof IndependenciaHighlighter
     */

  }, {
    key: "isHighlight",
    value: function isHighlight(el, dataAttr) {
      return (0, _highlights.isElementHighlight)(el, dataAttr);
    }
    /**
     * Serializes all highlights in the element the highlighter is applied to.
     * @returns {string} - stringified JSON with highlights definition
     * @memberof IndependenciaHighlighter
     */

  }, {
    key: "serializeHighlights",
    value: function serializeHighlights(id) {
      var highlights = this.getHighlights(),
          hlDescriptors = [];
      (0, _highlights.sortByDepth)(highlights, false);
      highlights.forEach(function (highlight) {
        var length = highlight.getAttribute(_config.LENGTH_ATTR),
            offset = highlight.getAttribute(_config.START_OFFSET_ATTR),
            wrapper = highlight.cloneNode(true);
        var containsIdAsClass = wrapper.classList.contains(id);
        wrapper.innerHTML = "";
        wrapper = wrapper.outerHTML;

        if (containsIdAsClass) {
          hlDescriptors.push([wrapper, highlight.textContent, offset, length]);
        }
      });
      return JSON.stringify(hlDescriptors);
    }
    /**
     * Deserializes the independent form of highlights.
     *
     * @throws exception when can't parse JSON or JSON has invalid structure.
     * @param {object} json - JSON object with highlights definition.
     * @returns {Array} - array of deserialized highlights.
     * @memberof TextHighlighter
     */

  }, {
    key: "deserializeHighlights",
    value: function deserializeHighlights(json) {
      var hlDescriptors,
          highlights = [],
          self = this;

      if (!json) {
        return highlights;
      }

      try {
        hlDescriptors = JSON.parse(json);
      } catch (e) {
        throw "Can't parse JSON: " + e;
      }

      function deserializationFnCustom(hlDescriptor) {
        var hl = {
          wrapper: hlDescriptor[0],
          text: hlDescriptor[1],
          offset: Number.parseInt(hlDescriptor[2]),
          length: Number.parseInt(hlDescriptor[3])
        },
            hlNode,
            highlight;
        var parentNode = self.el;

        var _findNodeAndOffset = (0, _highlights.findNodeAndOffset)(hl, parentNode),
            node = _findNodeAndOffset.node,
            offsetWithinNode = _findNodeAndOffset.offset;

        hlNode = node.splitText(offsetWithinNode);
        hlNode.splitText(hl.length);

        if (hlNode.nextSibling && !hlNode.nextSibling.nodeValue) {
          (0, _dom["default"])(hlNode.nextSibling).remove();
        }

        if (hlNode.previousSibling && !hlNode.previousSibling.nodeValue) {
          (0, _dom["default"])(hlNode.previousSibling).remove();
        }

        highlight = (0, _dom["default"])(hlNode).wrap((0, _dom["default"])().fromHTML(hl.wrapper)[0]);
        highlights.push(highlight);
      }

      hlDescriptors.forEach(function (hlDescriptor) {
        try {
          console.log("Highlight: ", hlDescriptor);
          deserializationFnCustom(hlDescriptor);
        } catch (e) {
          if (console && console.warn) {
            console.warn("Can't deserialize highlight descriptor. Cause: " + e);
          }
        }
      });
      return highlights;
    }
  }]);

  return IndependenciaHighlighter;
}();

var _default = IndependenciaHighlighter;
exports["default"] = _default;

},{"../config":1,"../utils/arrays":7,"../utils/dom":8,"../utils/highlights":10}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _highlights = require("../utils/highlights");

var _dom = _interopRequireWildcard(require("../utils/dom"));

var _config = require("../config");

var _arrays = require("../utils/arrays");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * PrimitivoHighlighter that provides text highlighting functionality to dom elements
 * for simple use cases.
 */
var PrimitivoHighlighter =
/*#__PURE__*/
function () {
  /**
   * Creates a PrimitivoHighlighter instance for functionality specific to the original implementation.
   *
   * @param {HTMLElement} element - DOM element to which highlighted will be applied.
   * @param {object} [options] - additional options.
   * @param {string} options.color - highlight color.
   * @param {string} options.highlightedClass - class added to highlight, 'highlighted' by default.
   * @param {string} options.contextClass - class added to element to which highlighter is applied,
   *  'highlighter-context' by default.
   * @param {function} options.onRemoveHighlight - function called before highlight is removed. Highlight is
   *  passed as param. Function should return true if highlight should be removed, or false - to prevent removal.
   * @param {function} options.onBeforeHighlight - function called before highlight is created. Range object is
   *  passed as param. Function should return true to continue processing, or false - to prevent highlighting.
   * @param {function} options.onAfterHighlight - function called after highlight is created. Array of created
   * wrappers is passed as param.
   * @class TextHighlighter
   */
  function PrimitivoHighlighter(element, options) {
    _classCallCheck(this, PrimitivoHighlighter);

    this.el = element;
    this.options = options;
  }
  /**
   * Highlights range.
   * Wraps text of given range object in wrapper element.
   * @param {Range} range
   * @param {HTMLElement} wrapper
   * @returns {Array} - array of created highlights.
   * @memberof PrimitivoHighlighter
   */


  _createClass(PrimitivoHighlighter, [{
    key: "highlightRange",
    value: function highlightRange(range, wrapper) {
      if (!range || range.collapsed) {
        return [];
      }

      console.log("ALSDebug28: range before refined! ", range);
      var result = (0, _highlights.refineRangeBoundaries)(range),
          startContainer = result.startContainer,
          endContainer = result.endContainer,
          goDeeper = result.goDeeper,
          done = false,
          node = startContainer,
          highlights = [],
          highlight,
          wrapperClone,
          nodeParent;

      do {
        if (goDeeper && node.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
          if (_config.IGNORE_TAGS.indexOf(node.parentNode.tagName) === -1 && node.nodeValue.trim() !== "") {
            wrapperClone = wrapper.cloneNode(true);
            wrapperClone.setAttribute(_config.DATA_ATTR, true);
            nodeParent = node.parentNode; // highlight if a node is inside the el

            if ((0, _dom["default"])(this.el).contains(nodeParent) || nodeParent === this.el) {
              highlight = (0, _dom["default"])(node).wrap(wrapperClone);
              highlights.push(highlight);
            }
          }

          goDeeper = false;
        }

        if (node === endContainer && !(endContainer.hasChildNodes() && goDeeper)) {
          done = true;
        }

        if (node.tagName && _config.IGNORE_TAGS.indexOf(node.tagName) > -1) {
          if (endContainer.parentNode === node) {
            done = true;
          }

          goDeeper = false;
        }

        if (goDeeper && node.hasChildNodes()) {
          node = node.firstChild;
        } else if (node.nextSibling) {
          node = node.nextSibling;
          goDeeper = true;
        } else {
          node = node.parentNode;
          goDeeper = false;
        }
      } while (!done);

      return highlights;
    }
    /**
     * Normalizes highlights. Ensures that highlighting is done with use of the smallest possible number of
     * wrapping HTML elements.
     * Flattens highlights structure and merges sibling highlights. Normalizes text nodes within highlights.
     * @param {Array} highlights - highlights to normalize.
     * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
     * input highlights.
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "normalizeHighlights",
    value: function normalizeHighlights(highlights) {
      var normalizedHighlights;
      this.flattenNestedHighlights(highlights);
      this.mergeSiblingHighlights(highlights); // omit removed nodes

      normalizedHighlights = highlights.filter(function (hl) {
        return hl.parentElement ? hl : null;
      });
      normalizedHighlights = (0, _arrays.unique)(normalizedHighlights);
      normalizedHighlights.sort(function (a, b) {
        return a.offsetTop - b.offsetTop || a.offsetLeft - b.offsetLeft;
      });
      return normalizedHighlights;
    }
    /**
     * Flattens highlights structure.
     * Note: this method changes input highlights - their order and number after calling this method may change.
     * @param {Array} highlights - highlights to flatten.
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "flattenNestedHighlights",
    value: function flattenNestedHighlights(highlights) {
      var again,
          self = this;
      (0, _highlights.sortByDepth)(highlights, true);

      function flattenOnce() {
        var again = false;
        highlights.forEach(function (hl, i) {
          var parent = hl.parentElement,
              parentPrev = parent.previousSibling,
              parentNext = parent.nextSibling;

          if (self.isHighlight(parent, _config.DATA_ATTR)) {
            if (!(0, _highlights.haveSameColor)(parent, hl)) {
              if (!hl.nextSibling) {
                if (!parentNext) {
                  (0, _dom["default"])(hl).insertAfter(parent);
                } else {
                  (0, _dom["default"])(hl).insertBefore(parentNext);
                }

                (0, _dom["default"])(hl).insertBefore(parentNext || parent);
                again = true;
              }

              if (!hl.previousSibling) {
                if (!parentPrev) {
                  (0, _dom["default"])(hl).insertBefore(parent);
                } else {
                  (0, _dom["default"])(hl).insertAfter(parentPrev);
                }

                (0, _dom["default"])(hl).insertAfter(parentPrev || parent);
                again = true;
              }

              if (hl.previousSibling && hl.previousSibling.nodeType == 3 && hl.nextSibling && hl.nextSibling.nodeType == 3) {
                var spanleft = document.createElement("span");
                spanleft.style.backgroundColor = parent.style.backgroundColor;
                spanleft.className = parent.className;
                var timestamp = parent.attributes[_config.TIMESTAMP_ATTR].nodeValue;
                spanleft.setAttribute(_config.TIMESTAMP_ATTR, timestamp);
                spanleft.setAttribute(_config.DATA_ATTR, true);
                var spanright = spanleft.cloneNode(true);
                (0, _dom["default"])(hl.previousSibling).wrap(spanleft);
                (0, _dom["default"])(hl.nextSibling).wrap(spanright);
                var nodes = Array.prototype.slice.call(parent.childNodes);
                nodes.forEach(function (node) {
                  (0, _dom["default"])(node).insertBefore(node.parentNode);
                });
                again = true;
              }

              if (!parent.hasChildNodes()) {
                (0, _dom["default"])(parent).remove();
              }
            } else {
              parent.replaceChild(hl.firstChild, hl);
              highlights[i] = parent;
              again = true;
            }
          }
        });
        return again;
      }

      do {
        again = flattenOnce();
      } while (again);
    }
    /**
     * Merges sibling highlights and normalizes descendant text nodes.
     * Note: this method changes input highlights - their order and number after calling this method may change.
     * @param highlights
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "mergeSiblingHighlights",
    value: function mergeSiblingHighlights(highlights) {
      var self = this;

      function shouldMerge(current, node) {
        return node && node.nodeType === _dom.NODE_TYPE.ELEMENT_NODE && (0, _highlights.haveSameColor)(current, node) && self.isHighlight(node, _config.DATA_ATTR);
      }

      highlights.forEach(function (highlight) {
        var prev = highlight.previousSibling,
            next = highlight.nextSibling;

        if (shouldMerge(highlight, prev)) {
          (0, _dom["default"])(highlight).prepend(prev.childNodes);
          (0, _dom["default"])(prev).remove();
        }

        if (shouldMerge(highlight, next)) {
          (0, _dom["default"])(highlight).append(next.childNodes);
          (0, _dom["default"])(next).remove();
        }

        (0, _dom["default"])(highlight).normalizeTextNodes();
      });
    }
    /**
     * Highlights current range.
     * @param {boolean} keepRange - Don't remove range after highlighting. Default: false.
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "doHighlight",
    value: function doHighlight(keepRange) {
      var range = (0, _dom["default"])(this.el).getRange(),
          wrapper,
          createdHighlights,
          normalizedHighlights,
          timestamp;

      if (!range || range.collapsed) {
        return;
      }

      if (this.options.onBeforeHighlight(range) === true) {
        timestamp = +new Date();
        wrapper = (0, _highlights.createWrapper)(this.options);
        wrapper.setAttribute(_config.TIMESTAMP_ATTR, timestamp);
        createdHighlights = this.highlightRange(range, wrapper);
        normalizedHighlights = this.normalizeHighlights(createdHighlights);

        if (!this.options.onAfterHighlight) {
          console.log("ALSDEbug24: Primitivo: this.options: ", this.options, "\n\n\n\n");
        }

        this.options.onAfterHighlight(range, normalizedHighlights, timestamp);
      }

      if (!keepRange) {
        (0, _dom["default"])(this.el).removeAllRanges();
      }
    }
    /**
     * Removes highlights from element. If element is a highlight itself, it is removed as well.
     * If no element is given, all highlights all removed.
     * @param {HTMLElement} [element] - element to remove highlights from
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "removeHighlights",
    value: function removeHighlights(element) {
      var container = element || this.el,
          highlights = this.getHighlights({
        container: container
      }),
          self = this;

      function mergeSiblingTextNodes(textNode) {
        var prev = textNode.previousSibling,
            next = textNode.nextSibling;

        if (prev && prev.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
          textNode.nodeValue = prev.nodeValue + textNode.nodeValue;
          (0, _dom["default"])(prev).remove();
        }

        if (next && next.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
          textNode.nodeValue = textNode.nodeValue + next.nodeValue;
          (0, _dom["default"])(next).remove();
        }
      }

      function removeHighlight(highlight) {
        var textNodes = (0, _dom["default"])(highlight).unwrap();
        textNodes.forEach(function (node) {
          mergeSiblingTextNodes(node);
        });
      }

      (0, _highlights.sortByDepth)(highlights, true);
      highlights.forEach(function (hl) {
        if (self.options.onRemoveHighlight(hl) === true) {
          removeHighlight(hl);
        }
      });
    }
    /**
     * Returns highlights from given container.
     * @param params
     * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
     * highlighter is applied to.
     * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
     * returned results. Default: true.
     * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
     * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
     * property. Default: false.
     * @returns {Array} - array of highlights.
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "getHighlights",
    value: function getHighlights(params) {
      var mergedParams = _objectSpread({
        container: this.el,
        dataAttr: _config.DATA_ATTR,
        timestampAttr: _config.TIMESTAMP_ATTR
      }, params);

      return (0, _highlights.retrieveHighlights)(mergedParams);
    }
    /**
     * Returns true if element is a highlight.
     *
     * @param el - element to check.
     * @returns {boolean}
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "isHighlight",
    value: function isHighlight(el, dataAttr) {
      return (0, _highlights.isElementHighlight)(el, dataAttr);
    }
    /**
     * Serializes all highlights in the element the highlighter is applied to.
     * @returns {string} - stringified JSON with highlights definition
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "serializeHighlights",
    value: function serializeHighlights() {
      var highlights = this.getHighlights(),
          refEl = this.el,
          hlDescriptors = [];

      function getElementPath(el, refElement) {
        var path = [],
            childNodes;

        do {
          childNodes = Array.prototype.slice.call(el.parentNode.childNodes);
          path.unshift(childNodes.indexOf(el));
          el = el.parentNode;
        } while (el !== refElement || !el);

        return path;
      }

      (0, _highlights.sortByDepth)(highlights, false);
      highlights.forEach(function (highlight) {
        var offset = 0,
            // Hl offset from previous sibling within parent node.
        length = highlight.textContent.length,
            hlPath = getElementPath(highlight, refEl),
            wrapper = highlight.cloneNode(true);
        wrapper.innerHTML = "";
        wrapper = wrapper.outerHTML;

        if (highlight.previousSibling && highlight.previousSibling.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
          offset = highlight.previousSibling.length;
        }

        hlDescriptors.push([wrapper, highlight.textContent, hlPath.join(":"), offset, length]);
      });
      return JSON.stringify(hlDescriptors);
    }
    /**
     * Deserializes highlights.
     * @throws exception when can't parse JSON or JSON has invalid structure.
     * @param {object} json - JSON object with highlights definition.
     * @returns {Array} - array of deserialized highlights.
     * @memberof PrimitivoHighlighter
     */

  }, {
    key: "deserializeHighlights",
    value: function deserializeHighlights(json) {
      var hlDescriptors,
          highlights = [],
          self = this;

      if (!json) {
        return highlights;
      }

      try {
        hlDescriptors = JSON.parse(json);
      } catch (e) {
        throw "Can't parse JSON: " + e;
      }

      function deserializationFn(hlDescriptor) {
        var hl = {
          wrapper: hlDescriptor[0],
          text: hlDescriptor[1],
          path: hlDescriptor[2].split(":"),
          offset: hlDescriptor[3],
          length: hlDescriptor[4]
        },
            elIndex = hl.path.pop(),
            node = self.el,
            hlNode,
            highlight,
            idx;

        while (idx = hl.path.shift()) {
          node = node.childNodes[idx];
        }

        if (node.childNodes[elIndex - 1] && node.childNodes[elIndex - 1].nodeType === _dom.NODE_TYPE.TEXT_NODE) {
          elIndex -= 1;
        }

        node = node.childNodes[elIndex];
        hlNode = node.splitText(hl.offset);
        hlNode.splitText(hl.length);

        if (hlNode.nextSibling && !hlNode.nextSibling.nodeValue) {
          (0, _dom["default"])(hlNode.nextSibling).remove();
        }

        if (hlNode.previousSibling && !hlNode.previousSibling.nodeValue) {
          (0, _dom["default"])(hlNode.previousSibling).remove();
        }

        highlight = (0, _dom["default"])(hlNode).wrap((0, _dom["default"])().fromHTML(hl.wrapper)[0]);
        highlights.push(highlight);
      }

      hlDescriptors.forEach(function (hlDescriptor) {
        try {
          deserializationFn(hlDescriptor);
        } catch (e) {
          if (console && console.warn) {
            console.warn("Can't deserialize highlight descriptor. Cause: " + e);
          }
        }
      });
      return highlights;
    }
  }]);

  return PrimitivoHighlighter;
}();

var _default = PrimitivoHighlighter;
exports["default"] = _default;

},{"../config":1,"../utils/arrays":7,"../utils/dom":8,"../utils/highlights":10}],5:[function(require,module,exports){
"use strict";

/* global jQuery TextHighlighter */
if (typeof jQuery !== "undefined") {
  (function ($) {
    "use strict";

    var PLUGIN_NAME = "textHighlighter";

    function wrap(fn, wrapper) {
      return function () {
        wrapper.call(this, fn);
      };
    }
    /**
     * The jQuery plugin namespace.
     * @external "jQuery.fn"
     * @see {@link http://docs.jquery.com/Plugins/Authoring The jQuery Plugin Guide}
     */

    /**
     * Creates TextHighlighter instance and applies it to the given jQuery object.
     * @param {object} options Same as {@link TextHighlighter} options.
     * @returns {jQuery}
     * @example $('#sandbox').textHighlighter({ color: 'red' });
     * @function external:"jQuery.fn".textHighlighter
     */


    $.fn.textHighlighter = function (options) {
      return this.each(function () {
        var el = this,
            hl;

        if (!$.data(el, PLUGIN_NAME)) {
          hl = new TextHighlighter(el, options);
          hl.destroy = wrap(hl.destroy, function (destroy) {
            destroy.call(hl);
            $(el).removeData(PLUGIN_NAME);
          });
          $.data(el, PLUGIN_NAME, hl);
        }
      });
    };

    $.fn.getHighlighter = function () {
      return this.data(PLUGIN_NAME);
    };
  })(jQuery);
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _dom = _interopRequireDefault(require("./utils/dom"));

var _events = require("./utils/events");

var _primitivo = _interopRequireDefault(require("./highlighters/primitivo"));

var _independencia = _interopRequireDefault(require("./highlighters/independencia"));

var _config = require("./config");

var _highlights = require("./utils/highlights");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var highlighters = {
  primitivo: _primitivo["default"],
  "v1-2014": _primitivo["default"],
  independencia: _independencia["default"],
  "v2-2019": _independencia["default"]
};
/**
 * TextHighlighter that provides text highlighting functionality to dom elements.
 */

var TextHighlighter =
/*#__PURE__*/
function () {
  _createClass(TextHighlighter, null, [{
    key: "createWrapper",

    /**
     * Creates wrapper for highlights.
     * TextHighlighter instance calls this method each time it needs to create highlights and pass options retrieved
     * in constructor.
     *
     * @param {object} options - the same object as in TextHighlighter constructor.
     * @returns {HTMLElement}
     */
    value: function createWrapper(options) {
      return (0, _highlights.createWrapper)(options);
    }
    /**
     * Creates TextHighlighter instance and binds to given DOM elements.
     *
     * @param {HTMLElement} element - DOM element to which highlighted will be applied.
     * @param {object} [options] - additional options.
     * @param {string} options.version - The version of the text highlighting functionality to use.
     * There are two options:
     *   primitivo (v1-2014) is for the initial implementation using interdependent highlight locators.
     *   (Lots of issues for requirements beyond simple all or nothing highlights)
     *
     *   independencia (v2-2019) is for an improved implementation focusing on making highlights independent
     *   from eachother and other element nodes within the context DOM object. v2 uses data attributes
     *   as the source of truth about the text range selected to create the original highlight.
     *   This allows us freedom to manipulate the DOM at will and handle overlapping highlights a lot better.
     *
     * @param {string} options.color - highlight color.
     * @param {string} options.highlightedClass - class added to highlight, 'highlighted' by default.
     * @param {string} options.contextClass - class added to element to which highlighter is applied,
     *  'highlighter-context' by default.
     * @param {function} options.onRemoveHighlight - function called before highlight is removed. Highlight is
     *  passed as param. Function should return true if highlight should be removed, or false - to prevent removal.
     * @param {function} options.onBeforeHighlight - function called before highlight is created. Range object is
     *  passed as param. Function should return true to continue processing, or false - to prevent highlighting.
     * @param {function} options.onAfterHighlight - function called after highlight is created. Array of created
     * wrappers is passed as param.
     * @class TextHighlighter
     */

  }]);

  function TextHighlighter(element, options) {
    _classCallCheck(this, TextHighlighter);

    if (!element) {
      throw new Error("Missing anchor element");
    }

    this.el = element;
    this.options = _objectSpread({
      color: "#ffff7b",
      highlightedClass: "highlighted",
      contextClass: "highlighter-context",
      version: "independencia",
      onRemoveHighlight: function onRemoveHighlight() {
        return true;
      },
      onBeforeHighlight: function onBeforeHighlight() {
        return true;
      },
      onAfterHighlight: function onAfterHighlight() {}
    }, options);
    console.log("\n\n\n\nALSDEbug24: TextHighlighter: options constructor param: ", options);
    console.log("ALSDEbug24: TextHighlighter: this.options: ", this.options);

    if (!highlighters[this.options.version]) {
      throw new Error("Please provide a valid version of the text highlighting functionality");
    }

    this.highlighter = new highlighters[this.options.version](this.el, this.options);
    (0, _dom["default"])(this.el).addClass(this.options.contextClass);
    (0, _events.bindEvents)(this.el, this);
  }
  /**
   * Permanently disables highlighting.
   * Unbinds events and remove context element class.
   * @memberof TextHighlighter
   */


  _createClass(TextHighlighter, [{
    key: "destroy",
    value: function destroy() {
      (0, _events.unbindEvents)(this.el, this);
      (0, _dom["default"])(this.el).removeClass(this.options.contextClass);
    }
  }, {
    key: "highlightHandler",
    value: function highlightHandler() {
      this.doHighlight();
    }
  }, {
    key: "doHighlight",
    value: function doHighlight(keepRange) {
      this.highlighter.doHighlight(keepRange);
    }
    /**
     * Highlights range.
     * Wraps text of given range object in wrapper element.
     * @param {Range} range
     * @param {HTMLElement} wrapper
     * @returns {Array} - array of created highlights.
     * @memberof TextHighlighter
     */

  }, {
    key: "highlightRange",
    value: function highlightRange(range, wrapper) {
      return this.highlighter.highlightRange(range, wrapper);
    }
    /**
     * Normalizes highlights. Ensure at least text nodes are normalized, carries out some flattening and nesting
     * where necessary.
     *
     * @param {Array} highlights - highlights to normalize.
     * @returns {Array} - array of normalized highlights. Order and number of returned highlights may be different than
     * input highlights.
     * @memberof TextHighlighter
     */

  }, {
    key: "normalizeHighlights",
    value: function normalizeHighlights(highlights) {
      return this.highlighter.normalizeHighlights(highlights);
    }
    /**
     * Sets highlighting color.
     * @param {string} color - valid CSS color.
     * @memberof TextHighlighter
     */

  }, {
    key: "setColor",
    value: function setColor(color) {
      this.options.color = color;
    }
    /**
     * Returns highlighting color.
     * @returns {string}
     * @memberof TextHighlighter
     */

  }, {
    key: "getColor",
    value: function getColor() {
      return this.options.color;
    }
    /**
     * Removes highlights from element. If element is a highlight itself, it is removed as well.
     * If no element is given, all highlights all removed.
     * @param {HTMLElement} [element] - element to remove highlights from
     * @memberof TextHighlighter
     */

  }, {
    key: "removeHighlights",
    value: function removeHighlights(element) {
      this.highlighter.removeHighlights(element);
    }
    /**
     * Returns highlights from given container.
     * @param params
     * @param {HTMLElement} [params.container] - return highlights from this element. Default: the element the
     * highlighter is applied to.
     * @param {boolean} [params.andSelf] - if set to true and container is a highlight itself, add container to
     * returned results. Default: true.
     * @param {boolean} [params.grouped] - if set to true, highlights are grouped in logical groups of highlights added
     * in the same moment. Each group is an object which has got array of highlights, 'toString' method and 'timestamp'
     * property. Default: false.
     * @returns {Array} - array of highlights.
     * @memberof TextHighlighter
     */

  }, {
    key: "getHighlights",
    value: function getHighlights(params) {
      return this.highlighter.getHighlights(params);
    }
    /**
     * Returns true if element is a highlight.
     * All highlights have 'data-highlighted' attribute.
     * @param el - element to check.
     * @returns {boolean}
     * @memberof TextHighlighter
     */

  }, {
    key: "isHighlight",
    value: function isHighlight(el) {
      return this.highlighter.isHighlight(el, _config.DATA_ATTR);
    }
    /**
     * Serializes all highlights in the element the highlighter is applied to.
     * the id is not used in the initial version of the highlighter.
     *
     * @param {string} id - The unique identifier grouping a set of highlight elements together.
     * @returns {string} - stringified JSON with highlights definition
     * @memberof TextHighlighter
     */

  }, {
    key: "serializeHighlights",
    value: function serializeHighlights(id) {
      return this.highlighter.serializeHighlights(id);
    }
    /**
     * Deserializes highlights.
     * @throws exception when can't parse JSON or JSON has invalid structure.
     * @param {object} json - JSON object with highlights definition.
     * @returns {Array} - array of deserialized highlights.
     * @memberof TextHighlighter
     */

  }, {
    key: "deserializeHighlights",
    value: function deserializeHighlights(json) {
      return this.highlighter.deserializeHighlights(json);
    }
    /**
     * Finds and highlights given text.
     * @param {string} text - text to search for
     * @param {boolean} [caseSensitive] - if set to true, performs case sensitive search (default: true)
     * @memberof TextHighlighter
     */

  }, {
    key: "find",
    value: function find(text, caseSensitive) {
      var wnd = (0, _dom["default"])(this.el).getWindow(),
          scrollX = wnd.scrollX,
          scrollY = wnd.scrollY,
          caseSens = typeof caseSensitive === "undefined" ? true : caseSensitive;
      (0, _dom["default"])(this.el).removeAllRanges();

      if (wnd.find) {
        while (wnd.find(text, caseSens)) {
          this.doHighlight(true);
        }
      } else if (wnd.document.body.createTextRange) {
        var textRange = wnd.document.body.createTextRange();
        textRange.moveToElementText(this.el);

        while (textRange.findText(text, 1, caseSens ? 4 : 0)) {
          if (!(0, _dom["default"])(this.el).contains(textRange.parentElement()) && textRange.parentElement() !== this.el) {
            break;
          }

          textRange.select();
          this.doHighlight(true);
          textRange.collapse(false);
        }
      }

      (0, _dom["default"])(this.el).removeAllRanges();
      wnd.scrollTo(scrollX, scrollY);
    }
  }]);

  return TextHighlighter;
}();

var _default = TextHighlighter;
exports["default"] = _default;

},{"./config":1,"./highlighters/independencia":3,"./highlighters/primitivo":4,"./utils/dom":8,"./utils/events":9,"./utils/highlights":10}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unique = unique;

/**
 * Returns array without duplicated values.
 * @param {Array} arr
 * @returns {Array}
 */
function unique(arr) {
  return arr.filter(function (value, idx, self) {
    return self.indexOf(value) === idx;
  });
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.NODE_TYPE = void 0;
var NODE_TYPE = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3
};
/**
 * Utility functions to make DOM manipulation easier.
 * @param {Node|HTMLElement} [el] - base DOM element to manipulate
 * @returns {object}
 */

exports.NODE_TYPE = NODE_TYPE;

var dom = function dom(el) {
  return (
    /** @lends dom **/
    {
      /**
       * Adds class to element.
       * @param {string} className
       */
      addClass: function addClass(className) {
        if (el.classList) {
          el.classList.add(className);
        } else {
          el.className += " " + className;
        }
      },

      /**
       * Removes class from element.
       * @param {string} className
       */
      removeClass: function removeClass(className) {
        if (el.classList) {
          el.classList.remove(className);
        } else {
          el.className = el.className.replace(new RegExp("(^|\\b)" + className + "(\\b|$)", "gi"), " ");
        }
      },

      /**
       * Prepends child nodes to base element.
       * @param {Node[]} nodesToPrepend
       */
      prepend: function prepend(nodesToPrepend) {
        var nodes = Array.prototype.slice.call(nodesToPrepend),
            i = nodes.length;

        while (i--) {
          el.insertBefore(nodes[i], el.firstChild);
        }
      },

      /**
       * Appends child nodes to base element.
       * @param {Node[]} nodesToAppend
       */
      append: function append(nodesToAppend) {
        var nodes = Array.prototype.slice.call(nodesToAppend);

        for (var i = 0, len = nodes.length; i < len; ++i) {
          el.appendChild(nodes[i]);
        }
      },

      /**
       * Inserts base element after refEl.
       * @param {Node} refEl - node after which base element will be inserted
       * @returns {Node} - inserted element
       */
      insertAfter: function insertAfter(refEl) {
        return refEl.parentNode.insertBefore(el, refEl.nextSibling);
      },

      /**
       * Inserts base element before refEl.
       * @param {Node} refEl - node before which base element will be inserted
       * @returns {Node} - inserted element
       */
      insertBefore: function insertBefore(refEl) {
        return refEl.parentNode.insertBefore(el, refEl);
      },

      /**
       * Removes base element from DOM.
       */
      remove: function remove() {
        el.parentNode.removeChild(el);
        el = null;
      },

      /**
       * Returns true if base element contains given child.
       * @param {Node|HTMLElement} child
       * @returns {boolean}
       */
      contains: function contains(child) {
        return el !== child && el.contains(child);
      },

      /**
       * Wraps base element in wrapper element.
       * @param {HTMLElement} wrapper
       * @returns {HTMLElement} wrapper element
       */
      wrap: function wrap(wrapper) {
        if (el.parentNode) {
          el.parentNode.insertBefore(wrapper, el);
        }

        wrapper.appendChild(el);
        return wrapper;
      },

      /**
       * Unwraps base element.
       * @returns {Node[]} - child nodes of unwrapped element.
       */
      unwrap: function unwrap() {
        var nodes = Array.prototype.slice.call(el.childNodes),
            wrapper;
        nodes.forEach(function (node) {
          wrapper = node.parentNode;
          dom(node).insertBefore(node.parentNode);
        });
        dom(wrapper).remove();
        return nodes;
      },

      /**
       * Returns array of base element parents.
       * @returns {HTMLElement[]}
       */
      parents: function parents() {
        var parent,
            path = [];

        while (parent = el.parentNode) {
          path.push(parent);
          el = parent;
        }

        return path;
      },

      /**
       * Returns array of base element parents, excluding the document.
       * @returns {HTMLElement[]}
       */
      parentsWithoutDocument: function parentsWithoutDocument() {
        return this.parents().filter(function (elem) {
          return elem !== document;
        });
      },

      /**
       * Normalizes text nodes within base element, ie. merges sibling text nodes and assures that every
       * element node has only one text node.
       * It should does the same as standard element.normalize, but IE implements it incorrectly.
       */
      normalizeTextNodes: function normalizeTextNodes() {
        if (!el) {
          return;
        }

        if (el.nodeType === NODE_TYPE.TEXT_NODE) {
          while (el.nextSibling && el.nextSibling.nodeType === NODE_TYPE.TEXT_NODE) {
            el.nodeValue += el.nextSibling.nodeValue;
            el.parentNode.removeChild(el.nextSibling);
          }
        } else {
          dom(el.firstChild).normalizeTextNodes();
        }

        dom(el.nextSibling).normalizeTextNodes();
      },

      /**
       * Returns element background color.
       * @returns {CSSStyleDeclaration.backgroundColor}
       */
      color: function color() {
        return el.style.backgroundColor;
      },

      /**
       * Creates dom element from given html string.
       * @param {string} html
       * @returns {NodeList}
       */
      fromHTML: function fromHTML(html) {
        var div = document.createElement("div");
        div.innerHTML = html;
        return div.childNodes;
      },

      /**
       * Returns first range of the window of base element.
       * @returns {Range}
       */
      getRange: function getRange() {
        var selection = dom(el).getSelection(),
            range;

        if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        }

        return range;
      },

      /**
       * Removes all ranges of the window of base element.
       */
      removeAllRanges: function removeAllRanges() {
        var selection = dom(el).getSelection();
        selection.removeAllRanges();
      },

      /**
       * Returns selection object of the window of base element.
       * @returns {Selection}
       */
      getSelection: function getSelection() {
        return dom(el).getWindow().getSelection();
      },

      /**
       * Returns window of the base element.
       * @returns {Window}
       */
      getWindow: function getWindow() {
        return dom(el).getDocument().defaultView;
      },

      /**
       * Returns document of the base element.
       * @returns {HTMLDocument}
       */
      getDocument: function getDocument() {
        // if ownerDocument is null then el is the document itself.
        return el.ownerDocument || el;
      },

      /**
       * Returns whether the provided element comes after the base element.
       *
       * @param {HTMLElement} otherElement
       *
       * @returns {boolean}
       */
      isAfter: function isAfter(otherElement, rootElement) {
        var sibling = el.nextSibling;
        var isAfter = false;

        while (sibling && !isAfter) {
          if (sibling === otherElement) {
            isAfter = true;
          } else {
            if (!sibling.nextSibling) {
              sibling = el.parentNode.nextSibling;
            } else {
              sibling = sibling.nextSibling;
            }
          }
        }

        return isAfter;
      }
    }
  );
};

var _default = dom;
exports["default"] = _default;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindEvents = bindEvents;
exports.unbindEvents = unbindEvents;

function bindEvents(el, scope) {
  el.addEventListener("mouseup", scope.highlightHandler.bind(scope));
  el.addEventListener("touchend", scope.highlightHandler.bind(scope));
}

function unbindEvents(el, scope) {
  el.removeEventListener("mouseup", scope.highlightHandler.bind(scope));
  el.removeEventListener("touchend", scope.highlightHandler.bind(scope));
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.refineRangeBoundaries = refineRangeBoundaries;
exports.sortByDepth = sortByDepth;
exports.haveSameColor = haveSameColor;
exports.createWrapper = createWrapper;
exports.findTextNodeAtLocation = findTextNodeAtLocation;
exports.findNodeAndOffset = findNodeAndOffset;
exports.getElementOffset = getElementOffset;
exports.findFirstNonSharedParent = findFirstNonSharedParent;
exports.extractElementContentForHighlight = extractElementContentForHighlight;
exports.nodesInBetween = nodesInBetween;
exports.groupHighlights = groupHighlights;
exports.retrieveHighlights = retrieveHighlights;
exports.isElementHighlight = isElementHighlight;
exports.addNodesToHighlightAfterElement = addNodesToHighlightAfterElement;
exports.getHighlightedText = getHighlightedText;
exports.createDescriptors = createDescriptors;

var _dom = _interopRequireWildcard(require("./dom"));

var _config = require("../config");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Takes range object as parameter and refines it boundaries
 * @param range
 * @returns {object} refined boundaries and initial state of highlighting algorithm.
 */
function refineRangeBoundaries(range) {
  var startContainer = range.startContainer,
      endContainer = range.endContainer,
      ancestor = range.commonAncestorContainer,
      goDeeper = true;

  if (range.endOffset === 0) {
    while (!endContainer.previousSibling && endContainer.parentNode !== ancestor) {
      endContainer = endContainer.parentNode;
    }

    endContainer = endContainer.previousSibling;
  } else if (endContainer.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
    if (range.endOffset < endContainer.nodeValue.length) {
      endContainer.splitText(range.endOffset);
    }
  } else if (range.endOffset > 0) {
    endContainer = endContainer.childNodes.item(range.endOffset - 1);
  }

  if (startContainer.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
    if (range.startOffset === startContainer.nodeValue.length) {
      goDeeper = false;
    } else if (range.startOffset > 0) {
      startContainer = startContainer.splitText(range.startOffset);

      if (endContainer === startContainer.previousSibling) {
        endContainer = startContainer;
      }
    }
  } else if (range.startOffset < startContainer.childNodes.length) {
    startContainer = startContainer.childNodes.item(range.startOffset);
  } else {
    startContainer = startContainer.nextSibling;
  }

  return {
    startContainer: startContainer,
    endContainer: endContainer,
    goDeeper: goDeeper
  };
}
/**
 * Sorts array of DOM elements by its depth in DOM tree.
 * @param {HTMLElement[]} arr - array to sort.
 * @param {boolean} descending - order of sort.
 */


function sortByDepth(arr, descending) {
  arr.sort(function (a, b) {
    return (0, _dom["default"])(descending ? b : a).parents().length - (0, _dom["default"])(descending ? a : b).parents().length;
  });
}
/**
 * Returns true if elements a i b have the same color.
 * @param {Node} a
 * @param {Node} b
 * @returns {boolean}
 */


function haveSameColor(a, b) {
  return (0, _dom["default"])(a).color() === (0, _dom["default"])(b).color();
}
/**
 * Creates wrapper for highlights.
 * TextHighlighter instance calls this method each time it needs to create highlights and pass options retrieved
 * in constructor.
 * @param {object} options - the same object as in TextHighlighter constructor.
 * @returns {HTMLElement}
 */


function createWrapper(options) {
  var span = document.createElement("span");
  span.style.backgroundColor = options.color;
  span.className = options.highlightedClass;
  return span;
}

function findTextNodeAtLocation(element, locationInChildNodes) {
  console.log("Element as parameter: ", element);
  var textNodeElement = element;
  var i = 0;

  while (textNodeElement && textNodeElement.nodeType !== _dom.NODE_TYPE.TEXT_NODE) {
    console.log("textNodeElement step ".concat(i), textNodeElement);

    if (locationInChildNodes === "start") {
      if (textNodeElement.childNodes.length > 0) {
        textNodeElement = textNodeElement.childNodes[0];
      } else {
        textNodeElement = textNodeElement.nextSibling;
      }
    } else if (locationInChildNodes === "end") {
      if (textNodeElement.childNodes.length > 0) {
        var lastIndex = textNodeElement.childNodes.length - 1;
        textNodeElement = textNodeElement.childNodes[lastIndex];
      } else {
        textNodeElement = textNodeElement.previousSibling;
      }
    } else {
      textNodeElement = null;
    }

    i++;
  }

  console.log("text node element returned: ", textNodeElement);
  return textNodeElement;
}
/**
 * Determine where to inject a highlight based on it's offset.
 *
 * @param {*} highlight
 * @param {*} parentNode
 */


function findNodeAndOffset(highlight, parentNode) {
  var currentNode = parentNode;
  var currentOffset = 0;
  var offsetWithinNode = 0;
  var locationFound = false;

  while (currentNode && !locationFound && (currentOffset < highlight.offset || currentOffset === highlight.offset && currentNode.childNodes.length > 0)) {
    var endOfNodeOffset = currentOffset + currentNode.textContent.length;

    if (endOfNodeOffset > highlight.offset) {
      if (currentNode.childNodes.length === 0) {
        offsetWithinNode = highlight.offset - currentOffset;
        locationFound = true;
        currentOffset = currentOffset + offsetWithinNode;
      } else {
        currentNode = currentNode.childNodes[0];
      }
    } else {
      currentOffset = endOfNodeOffset;
      currentNode = currentNode.nextSibling;
    }
  }

  return {
    node: currentNode,
    offset: offsetWithinNode
  };
}

function getElementOffset(childElement, rootElement) {
  var offset = 0;
  var childNodes;
  var currentElement = childElement;

  do {
    childNodes = Array.prototype.slice.call(currentElement.parentNode.childNodes);
    var childElementIndex = childNodes.indexOf(currentElement);
    var offsetInCurrentParent = getTextOffsetBefore(childNodes, childElementIndex);
    offset += offsetInCurrentParent;
    currentElement = currentElement.parentNode;
  } while (currentElement !== rootElement || !currentElement);

  return offset;
}

function getTextOffsetBefore(childNodes, cutIndex) {
  var textOffset = 0;

  for (var i = 0; i < cutIndex; i++) {
    var currentNode = childNodes[i]; // Use textContent and not innerHTML to account for invisible characters as well.
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent

    var text = currentNode.textContent;

    if (text && text.length > 0) {
      textOffset += text.length;
    }
  }

  return textOffset;
}

function findFirstNonSharedParent(elements) {
  var childElement = elements.childElement;
  var otherElement = elements.otherElement;
  var parents = (0, _dom["default"])(childElement).parentsWithoutDocument();
  var i = 0;
  var firstNonSharedParent = null;
  var allParentsAreShared = false;

  while (!firstNonSharedParent && !allParentsAreShared && i < parents.length) {
    var currentParent = parents[i];

    if (currentParent.contains(otherElement)) {
      console.log("currentParent contains other element!", currentParent);

      if (i > 0) {
        firstNonSharedParent = parents[i - 1];
      } else {
        allParentsAreShared = true;
      }
    }

    i++;
  }

  return firstNonSharedParent;
}

var siblingRemovalDirections = {
  start: "previousSibling",
  end: "nextSibling"
};
var siblingTextNodeMergeDirections = {
  start: "nextSibling",
  end: "previousSibling"
};

function removeSiblingsInDirection(startNode, direction) {
  var sibling = startNode[direction];

  while (sibling) {
    startNode.parentNode.removeChild(sibling);
    sibling = sibling[direction];
  }
}
/**
 * Merges the text of all sibling text nodes with the start node.
 *
 * @param {HTMLElement} startNode
 * @param {string} direction
 */


function mergeSiblingTextNodesInDirection(startNode, direction) {
  var sibling = startNode[direction];

  while (sibling) {
    if (sibling.nodeType === _dom.NODE_TYPE.TEXT_NODE) {
      startNode.textContent += sibling.textContent;
      startNode.parentNode.removeChild(sibling);
      sibling = sibling[direction];
    }
  }
}

function extractElementContentForHighlight(params) {
  var element = params.element;
  var elementAncestor = params.elementAncestor;
  var options = params.options;
  var locationInSelection = params.locationInSelection;
  var elementAncestorCopy = elementAncestor.cloneNode(true); // Beginning of childNodes list for end container in selection
  // and end of childNodes list for start container in selection.

  var locationInChildNodes = locationInSelection === "start" ? "end" : "start";
  var elementCopy = findTextNodeAtLocation(elementAncestorCopy, locationInChildNodes);
  var elementCopyParent = elementCopy.parentNode;
  removeSiblingsInDirection(elementCopy, siblingRemovalDirections[locationInSelection]);
  mergeSiblingTextNodesInDirection(elementCopy, siblingTextNodeMergeDirections[locationInSelection]);
  console.log("elementCopy: ", elementCopy);
  console.log("elementCopyParent: ", elementCopyParent); // Clean out any nested highlight wrappers.

  if (elementCopyParent !== elementAncestorCopy && elementCopyParent.classList.contains(options.highlightedClass)) {
    (0, _dom["default"])(elementCopyParent).unwrap();
  } // Remove the text node that we need for the new highlight
  // from the existing highlight or other element.


  element.parentNode.removeChild(element);
  return {
    elementAncestorCopy: elementAncestorCopy,
    elementCopy: elementCopy
  };
}

function gatherSiblingsUpToEndNode(startNodeOrContainer, endNode) {
  var gatheredSiblings = [];
  var foundEndNodeSibling = false;
  var currentNode = startNodeOrContainer.nextSibling;

  while (currentNode && !foundEndNodeSibling) {
    if (currentNode === endNode || currentNode.contains(endNode)) {
      foundEndNodeSibling = true;
    } else {
      gatheredSiblings.push(currentNode);
      currentNode = currentNode.nextSibling;
    }
  }

  return {
    gatheredSiblings: gatheredSiblings,
    foundEndNodeSibling: foundEndNodeSibling
  };
}
/**
 * Gets all the nodes in between the provided start and end.
 *
 * @param {HTMLElement} startNode
 * @param {HTMLElement} endNode
 * @returns {HTMLElement[]} Nodes that live in between the two.
 */


function nodesInBetween(startNode, endNode) {
  if (startNode === endNode) {
    return [];
  } // First attempt the easiest solution, hoping endNode will be at the same level
  // as the start node or contained in an element at the same level.


  var _gatherSiblingsUpToEn = gatherSiblingsUpToEndNode(startNode, endNode),
      foundEndNodeSiblingOnSameLevel = _gatherSiblingsUpToEn.foundEndNodeSibling,
      gatheredSiblings = _gatherSiblingsUpToEn.gatheredSiblings;

  if (foundEndNodeSiblingOnSameLevel) {
    return gatheredSiblings;
  } // Now go for the route that goes to the highest parent of the start node in the tree
  // that is not the parent of the end node.


  var startNodeParent = findFirstNonSharedParent({
    childElement: startNode,
    otherElement: endNode
  });

  if (startNodeParent) {
    var _gatherSiblingsUpToEn2 = gatherSiblingsUpToEndNode(startNodeParent, endNode),
        foundEndNodeSiblingFromParentLevel = _gatherSiblingsUpToEn2.foundEndNodeSibling,
        gatheredSiblingsFromParent = _gatherSiblingsUpToEn2.gatheredSiblings;

    if (foundEndNodeSiblingFromParentLevel) {
      return gatheredSiblingsFromParent;
    }
  }

  return [];
}
/**
 * Groups given highlights by timestamp.
 * @param {Array} highlights
 * @param {string} timestampAttr
 * @returns {Array} Grouped highlights.
 */


function groupHighlights(highlights, timestampAttr) {
  var order = [],
      chunks = {},
      grouped = [];
  highlights.forEach(function (hl) {
    var timestamp = hl.getAttribute(timestampAttr);

    if (typeof chunks[timestamp] === "undefined") {
      chunks[timestamp] = [];
      order.push(timestamp);
    }

    chunks[timestamp].push(hl);
  });
  order.forEach(function (timestamp) {
    var group = chunks[timestamp];
    grouped.push({
      chunks: group,
      timestamp: timestamp,
      toString: function toString() {
        return group.map(function (h) {
          return h.textContent;
        }).join("");
      }
    });
  });
  return grouped;
}

function retrieveHighlights(params) {
  params = _objectSpread({
    andSelf: true,
    grouped: false
  }, params);
  var nodeList = params.container.querySelectorAll("[" + params.dataAttr + "]"),
      highlights = Array.prototype.slice.call(nodeList);

  if (params.andSelf === true && params.container.hasAttribute(params.dataAttr)) {
    highlights.push(params.container);
  }

  if (params.grouped) {
    highlights = groupHighlights(highlights, params.timestampAttr);
  }

  return highlights;
}

function isElementHighlight(el, dataAttr) {
  return el && el.nodeType === _dom.NODE_TYPE.ELEMENT_NODE && el.hasAttribute(dataAttr);
}

function addNodesToHighlightAfterElement(_ref) {
  var element = _ref.element,
      elementAncestor = _ref.elementAncestor,
      highlightWrapper = _ref.highlightWrapper,
      highlightedClass = _ref.highlightedClass;

  if (elementAncestor) {
    if (elementAncestor.classList.contains(highlightedClass)) {
      // Ensure we only take the children from a parent that is a highlight.
      elementAncestor.childNodes.forEach(function (childNode) {
        if ((0, _dom["default"])(childNode).isAfter(element)) {}

        elementAncestor.appendChild(childNode);
      });
    } else {
      highlightWrapper.appendChild(elementAncestor);
    }
  } else {
    highlightWrapper.appendChild(element);
  }
}
/**
 * Collects the human-readable highlighted text for all nodes in the selected range.
 *
 * @param {Range} range
 *
 * @return {string} The human-readable highlighted text for the given range.
 */


function getHighlightedText(range) {
  var startContainerCopy = range.startContainer.clone(true);
  return "";
}

function createDescriptors(_ref2) {
  var rootElement = _ref2.rootElement,
      range = _ref2.range,
      wrapper = _ref2.wrapper;
  var wrapperClone = wrapper.cloneNode(true);
  var startOffset = getElementOffset(range.startContainer, rootElement) + range.startOffset;
  var endOffset = range.startContainer === range.endContainer ? startOffset + (range.endOffset - range.startOffset) : getElementOffset(range.endContainer, rootElement) + range.endOffset;
  var length = endOffset - startOffset;
  wrapperClone.setAttribute(_config.DATA_ATTR, true);
  wrapperClone.innerHTML = "";
  var wrapperHTML = wrapperClone.outerHTML;
  var descriptor = [wrapperHTML, // retrieve all the text content between the start and end offsets.
  getHighlightedText(range), startOffset, length]; // TODO: chunk up highlights for PDFs (or any element with absolutely positioned elements).

  return [descriptor];
}

},{"../config":1,"./dom":8}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2dsb2JhbC1zY3JpcHQuanMiLCJzcmMvaGlnaGxpZ2h0ZXJzL2luZGVwZW5kZW5jaWEuanMiLCJzcmMvaGlnaGxpZ2h0ZXJzL3ByaW1pdGl2by5qcyIsInNyYy9qcXVlcnktcGx1Z2luLmpzIiwic3JjL3RleHQtaGlnaGxpZ2h0ZXIuanMiLCJzcmMvdXRpbHMvYXJyYXlzLmpzIiwic3JjL3V0aWxzL2RvbS5qcyIsInNyYy91dGlscy9ldmVudHMuanMiLCJzcmMvdXRpbHMvaGlnaGxpZ2h0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUNBQTs7OztBQUlPLElBQU0sU0FBUyxHQUFHLGtCQUFsQjtBQUVQOzs7Ozs7QUFJTyxJQUFNLGNBQWMsR0FBRyxnQkFBdkI7O0FBRUEsSUFBTSxpQkFBaUIsR0FBRyxtQkFBMUI7O0FBQ0EsSUFBTSxXQUFXLEdBQUcsYUFBcEI7QUFFUDs7Ozs7O0FBSU8sSUFBTSxXQUFXLEdBQUcsQ0FDekIsUUFEeUIsRUFFekIsT0FGeUIsRUFHekIsUUFIeUIsRUFJekIsUUFKeUIsRUFLekIsUUFMeUIsRUFNekIsUUFOeUIsRUFPekIsUUFQeUIsRUFRekIsT0FSeUIsRUFTekIsT0FUeUIsRUFVekIsUUFWeUIsRUFXekIsT0FYeUIsRUFZekIsT0FaeUIsRUFhekIsT0FieUIsRUFjekIsVUFkeUIsQ0FBcEI7Ozs7Ozs7QUNuQlA7O0FBWUE7Ozs7QUFWQTs7OztBQUlBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLDJCQUF6QjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7QUNSQTs7QUFjQTs7QUFNQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQUVBOzs7O0lBSU0sd0I7OztBQUNKOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQSxvQ0FBWSxPQUFaLEVBQXFCLE9BQXJCLEVBQThCO0FBQUE7O0FBQzVCLFNBQUssRUFBTCxHQUFVLE9B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QUF6QjtBQUNBLE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxTQUFqQztBQUVBLE1BQU0sVUFBVSxHQUFHLENBQ2pCLFdBRGlCLEVBRWpCO0FBQ0EsRUFBQSxrQkFBa0IsQ0FBQyxLQUFELENBSEQsRUFJakIsV0FKaUIsRUFLakIsTUFMaUIsQ0FBbkIsQ0FmaUUsQ0FzQmpFOztBQUNBLFNBQU8sQ0FBQyxVQUFELENBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qKlxuICogQXR0cmlidXRlIGFkZGVkIGJ5IGRlZmF1bHQgdG8gZXZlcnkgaGlnaGxpZ2h0LlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuZXhwb3J0IGNvbnN0IERBVEFfQVRUUiA9IFwiZGF0YS1oaWdobGlnaHRlZFwiO1xuXG4vKipcbiAqIEF0dHJpYnV0ZSB1c2VkIHRvIGdyb3VwIGhpZ2hsaWdodCB3cmFwcGVycy5cbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBUSU1FU1RBTVBfQVRUUiA9IFwiZGF0YS10aW1lc3RhbXBcIjtcblxuZXhwb3J0IGNvbnN0IFNUQVJUX09GRlNFVF9BVFRSID0gXCJkYXRhLXN0YXJ0LW9mZnNldFwiO1xuZXhwb3J0IGNvbnN0IExFTkdUSF9BVFRSID0gXCJkYXRhLWxlbmd0aFwiO1xuXG4vKipcbiAqIERvbid0IGhpZ2hsaWdodCBjb250ZW50IG9mIHRoZXNlIHRhZ3MuXG4gKiBAdHlwZSB7c3RyaW5nW119XG4gKi9cbmV4cG9ydCBjb25zdCBJR05PUkVfVEFHUyA9IFtcbiAgXCJTQ1JJUFRcIixcbiAgXCJTVFlMRVwiLFxuICBcIlNFTEVDVFwiLFxuICBcIk9QVElPTlwiLFxuICBcIkJVVFRPTlwiLFxuICBcIk9CSkVDVFwiLFxuICBcIkFQUExFVFwiLFxuICBcIlZJREVPXCIsXG4gIFwiQVVESU9cIixcbiAgXCJDQU5WQVNcIixcbiAgXCJFTUJFRFwiLFxuICBcIlBBUkFNXCIsXG4gIFwiTUVURVJcIixcbiAgXCJQUk9HUkVTU1wiXG5dO1xuIiwiaW1wb3J0IFRleHRIaWdobGlnaHRlciBmcm9tIFwiLi90ZXh0LWhpZ2hsaWdodGVyXCI7XG5cbi8qKlxuICogRXhwb3NlIHRoZSBUZXh0SGlnaGxpZ2h0ZXIgY2xhc3MgZ2xvYmFsbHkgdG8gYmVcbiAqIHVzZWQgaW4gZGVtb3MgYW5kIHRvIGJlIGluamVjdGVkIGRpcmVjdGx5IGludG8gaHRtbCBmaWxlcy5cbiAqL1xuZ2xvYmFsLlRleHRIaWdobGlnaHRlciA9IFRleHRIaWdobGlnaHRlcjtcblxuLyoqXG4gKiBMb2FkIHRoZSBqcXVlcnkgcGx1Z2luIGdsb2JhbGx5IGV4cGVjdGluZyBqUXVlcnkgYW5kIFRleHRIaWdobGlnaHRlciB0byBiZSBnbG9iYWxseVxuICogYXZhaWFibGUsIHRoaXMgbWVhbnMgdGhpcyBsaWJyYXJ5IGRvZXNuJ3QgbmVlZCBhIGhhcmQgcmVxdWlyZW1lbnQgb2YgalF1ZXJ5LlxuICovXG5pbXBvcnQgXCIuL2pxdWVyeS1wbHVnaW5cIjtcbiIsImltcG9ydCB7XG4gIHJldHJpZXZlSGlnaGxpZ2h0cyxcbiAgaXNFbGVtZW50SGlnaGxpZ2h0LFxuICBnZXRFbGVtZW50T2Zmc2V0LFxuICBmaW5kVGV4dE5vZGVBdExvY2F0aW9uLFxuICBmaW5kRmlyc3ROb25TaGFyZWRQYXJlbnQsXG4gIGV4dHJhY3RFbGVtZW50Q29udGVudEZvckhpZ2hsaWdodCxcbiAgbm9kZXNJbkJldHdlZW4sXG4gIHNvcnRCeURlcHRoLFxuICBmaW5kTm9kZUFuZE9mZnNldCxcbiAgYWRkTm9kZXNUb0hpZ2hsaWdodEFmdGVyRWxlbWVudCxcbiAgY3JlYXRlV3JhcHBlcixcbiAgY3JlYXRlRGVzY3JpcHRvcnNcbn0gZnJvbSBcIi4uL3V0aWxzL2hpZ2hsaWdodHNcIjtcbmltcG9ydCB7XG4gIFNUQVJUX09GRlNFVF9BVFRSLFxuICBMRU5HVEhfQVRUUixcbiAgREFUQV9BVFRSLFxuICBUSU1FU1RBTVBfQVRUUlxufSBmcm9tIFwiLi4vY29uZmlnXCI7XG5pbXBvcnQgZG9tIGZyb20gXCIuLi91dGlscy9kb21cIjtcbmltcG9ydCB7IHVuaXF1ZSB9IGZyb20gXCIuLi91dGlscy9hcnJheXNcIjtcblxuLyoqXG4gKiBJbmRlcGVuZGVuY2lhSGlnaGxpZ2h0ZXIgdGhhdCBwcm92aWRlcyB0ZXh0IGhpZ2hsaWdodGluZyBmdW5jdGlvbmFsaXR5IHRvIGRvbSBlbGVtZW50c1xuICogd2l0aCBhIGZvY3VzIG9uIHJlbW92aW5nIGludGVyZGVwZW5kZW5jZSBiZXR3ZWVuIGhpZ2hsaWdodHMgYW5kIG90aGVyIGVsZW1lbnQgbm9kZXMgaW4gdGhlIGNvbnRleHQgZWxlbWVudC5cbiAqL1xuY2xhc3MgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyIGluc3RhbmNlIGZvciBmdW5jdGlvbmFsaXR5IHRoYXQgZm9jdXNlcyBmb3IgaGlnaGxpZ2h0IGluZGVwZW5kZW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIERPTSBlbGVtZW50IHRvIHdoaWNoIGhpZ2hsaWdodGVkIHdpbGwgYmUgYXBwbGllZC5cbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIGFkZGl0aW9uYWwgb3B0aW9ucy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY29sb3IgLSBoaWdobGlnaHQgY29sb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmhpZ2hsaWdodGVkQ2xhc3MgLSBjbGFzcyBhZGRlZCB0byBoaWdobGlnaHQsICdoaWdobGlnaHRlZCcgYnkgZGVmYXVsdC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuY29udGV4dENsYXNzIC0gY2xhc3MgYWRkZWQgdG8gZWxlbWVudCB0byB3aGljaCBoaWdobGlnaHRlciBpcyBhcHBsaWVkLFxuICAgKiAgJ2hpZ2hsaWdodGVyLWNvbnRleHQnIGJ5IGRlZmF1bHQuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMub25SZW1vdmVIaWdobGlnaHQgLSBmdW5jdGlvbiBjYWxsZWQgYmVmb3JlIGhpZ2hsaWdodCBpcyByZW1vdmVkLiBIaWdobGlnaHQgaXNcbiAgICogIHBhc3NlZCBhcyBwYXJhbS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIGlmIGhpZ2hsaWdodCBzaG91bGQgYmUgcmVtb3ZlZCwgb3IgZmFsc2UgLSB0byBwcmV2ZW50IHJlbW92YWwuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMub25CZWZvcmVIaWdobGlnaHQgLSBmdW5jdGlvbiBjYWxsZWQgYmVmb3JlIGhpZ2hsaWdodCBpcyBjcmVhdGVkLiBSYW5nZSBvYmplY3QgaXNcbiAgICogIHBhc3NlZCBhcyBwYXJhbS4gRnVuY3Rpb24gc2hvdWxkIHJldHVybiB0cnVlIHRvIGNvbnRpbnVlIHByb2Nlc3NpbmcsIG9yIGZhbHNlIC0gdG8gcHJldmVudCBoaWdobGlnaHRpbmcuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdGlvbnMub25BZnRlckhpZ2hsaWdodCAtIGZ1bmN0aW9uIGNhbGxlZCBhZnRlciBoaWdobGlnaHQgaXMgY3JlYXRlZC4gQXJyYXkgb2YgY3JlYXRlZFxuICAgKiB3cmFwcGVycyBpcyBwYXNzZWQgYXMgcGFyYW0uXG4gICAqIEBjbGFzcyBJbmRlcGVuZGVuY2lhSGlnaGxpZ2h0ZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVsID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZ2hsaWdodHMgdGhlIHJhbmdlIGFsbG93aW5nIGlzb2xhdGlvbiBmb3Igb3ZlcmxhcHBpbmcgaGlnaGxpZ2h0cy5cbiAgICogVGhpcyBzb2x1dGlvbiBzdGVhbHMgdGhlIHRleHQgb3Igb3RoZXIgbm9kZXMgaW4gdGhlIERPTSBmcm9tIG92ZXJsYXBwaW5nIChOT1QgTkVTVEVEKSBoaWdobGlnaHRzXG4gICAqIGZvciByZXByZXNlbnRhdGlvbiBpbiB0aGUgRE9NLlxuICAgKlxuICAgKiBGb3IgdGhlIHB1cnBvc2Ugb2Ygc2VyaWFsaXNhdGlvbiB0aGlzIHdpbGwgbWFpbnRhaW4gYSBkYXRhIGF0dHJpYnV0ZSBvbiB0aGUgaGlnaGxpZ2h0IHdyYXBwZXJcbiAgICogd2l0aCB0aGUgc3RhcnQgdGV4dCBhbmQgZW5kIHRleHQgb2Zmc2V0cyByZWxhdGl2ZSB0byB0aGUgY29udGV4dCByb290IGVsZW1lbnQuXG4gICAqXG4gICAqIFdyYXBzIHRleHQgb2YgZ2l2ZW4gcmFuZ2Ugb2JqZWN0IGluIHdyYXBwZXIgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gd3JhcHBlclxuICAgKiBAcmV0dXJucyB7QXJyYXl9IC0gYXJyYXkgb2YgY3JlYXRlZCBoaWdobGlnaHRzLlxuICAgKiBAbWVtYmVyb2YgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyXG4gICAqL1xuICBoaWdobGlnaHRSYW5nZShyYW5nZSwgd3JhcHBlcikge1xuICAgIGlmICghcmFuZ2UgfHwgcmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJBTFNEZWJ1ZzI5OiBSQU5HRTogXCIsIHJhbmdlKTtcblxuICAgIGxldCBoaWdobGlnaHRzID0gW107XG4gICAgbGV0IHdyYXBwZXJDbG9uZSA9IHdyYXBwZXIuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgbGV0IHN0YXJ0T2Zmc2V0ID1cbiAgICAgIGdldEVsZW1lbnRPZmZzZXQocmFuZ2Uuc3RhcnRDb250YWluZXIsIHRoaXMuZWwpICsgcmFuZ2Uuc3RhcnRPZmZzZXQ7XG4gICAgbGV0IGVuZE9mZnNldCA9XG4gICAgICByYW5nZS5zdGFydENvbnRhaW5lciA9PT0gcmFuZ2UuZW5kQ29udGFpbmVyXG4gICAgICAgID8gc3RhcnRPZmZzZXQgKyAocmFuZ2UuZW5kT2Zmc2V0IC0gcmFuZ2Uuc3RhcnRPZmZzZXQpXG4gICAgICAgIDogZ2V0RWxlbWVudE9mZnNldChyYW5nZS5lbmRDb250YWluZXIsIHRoaXMuZWwpICsgcmFuZ2UuZW5kT2Zmc2V0O1xuXG4gICAgY29uc29sZS5sb2coXG4gICAgICBcIkFMU0RlYnVnMjk6IHN0YXJ0T2Zmc2V0OiBcIixcbiAgICAgIHN0YXJ0T2Zmc2V0LFxuICAgICAgXCJlbmRPZmZzZXQ6IFwiLFxuICAgICAgZW5kT2Zmc2V0XG4gICAgKTtcblxuICAgIHdyYXBwZXJDbG9uZS5zZXRBdHRyaWJ1dGUoU1RBUlRfT0ZGU0VUX0FUVFIsIHN0YXJ0T2Zmc2V0KTtcbiAgICAvLyB3cmFwcGVyQ2xvbmUuc2V0QXR0cmlidXRlKEVORF9PRkZTRVRfQVRUUiwgZW5kT2Zmc2V0KTtcbiAgICB3cmFwcGVyQ2xvbmUuc2V0QXR0cmlidXRlKERBVEFfQVRUUiwgdHJ1ZSk7XG5cbiAgICBjb25zb2xlLmxvZyhcIlxcblxcblxcbiBGSU5ESU5HIFNUQVJUIENPTlRBSU5FUiBGSVJTVCBURVhUIE5PREUgXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicmFuZ2Uuc3RhcnRDb250YWluZXI6IFwiLCByYW5nZS5zdGFydENvbnRhaW5lcik7XG4gICAgbGV0IHN0YXJ0Q29udGFpbmVyID0gZmluZFRleHROb2RlQXRMb2NhdGlvbihyYW5nZS5zdGFydENvbnRhaW5lciwgXCJzdGFydFwiKTtcblxuICAgIGNvbnNvbGUubG9nKFwiXFxuXFxuXFxuIEZJTkRJTkcgRU5EIENPTlRBSU5FUiBGSVJTVCBURVhUIE5PREUgXCIpO1xuICAgIGNvbnNvbGUubG9nKFwicmFuZ2UuZW5kQ29udGFpbmVyOiBcIiwgcmFuZ2UuZW5kQ29udGFpbmVyKTtcbiAgICBsZXQgZW5kQ29udGFpbmVyID0gZmluZFRleHROb2RlQXRMb2NhdGlvbihyYW5nZS5lbmRDb250YWluZXIsIFwic3RhcnRcIik7XG5cbiAgICBpZiAoIXN0YXJ0Q29udGFpbmVyIHx8ICFlbmRDb250YWluZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJGYWlsZWQgdG8gZmluZCB0aGUgdGV4dCBub2RlIGZvciB0aGUgc3RhcnQgb3IgdGhlIGVuZCBvZiB0aGUgc2VsZWN0ZWQgcmFuZ2VcIlxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgYWZ0ZXJOZXdIaWdobGlnaHQgPVxuICAgICAgcmFuZ2UuZW5kT2Zmc2V0IDwgZW5kQ29udGFpbmVyLnRleHRDb250ZW50Lmxlbmd0aCAtIDFcbiAgICAgICAgPyBlbmRDb250YWluZXIuc3BsaXRUZXh0KHJhbmdlLmVuZE9mZnNldClcbiAgICAgICAgOiBlbmRDb250YWluZXI7XG5cbiAgICBpZiAoc3RhcnRDb250YWluZXIgPT09IGVuZENvbnRhaW5lcikge1xuICAgICAgbGV0IHN0YXJ0T2ZOZXdIaWdobGlnaHQgPVxuICAgICAgICByYW5nZS5zdGFydE9mZnNldCA+IDBcbiAgICAgICAgICA/IHN0YXJ0Q29udGFpbmVyLnNwbGl0VGV4dChyYW5nZS5zdGFydE9mZnNldClcbiAgICAgICAgICA6IHN0YXJ0Q29udGFpbmVyO1xuICAgICAgLy8gU2ltcGx5IHdyYXAgdGhlIHNlbGVjdGVkIHJhbmdlIGluIHRoZSBzYW1lIGNvbnRhaW5lciBhcyBhIGhpZ2hsaWdodC5cbiAgICAgIGxldCBoaWdobGlnaHQgPSBkb20oc3RhcnRPZk5ld0hpZ2hsaWdodCkud3JhcCh3cmFwcGVyQ2xvbmUpO1xuICAgICAgaGlnaGxpZ2h0cy5wdXNoKGhpZ2hsaWdodCk7XG4gICAgfSBlbHNlIGlmIChlbmRDb250YWluZXIudGV4dENvbnRlbnQubGVuZ3RoID49IHJhbmdlLmVuZE9mZnNldCkge1xuICAgICAgbGV0IHN0YXJ0T2ZOZXdIaWdobGlnaHQgPSBzdGFydENvbnRhaW5lci5zcGxpdFRleHQocmFuZ2Uuc3RhcnRPZmZzZXQpO1xuICAgICAgbGV0IGVuZE9mTmV3SGlnaGxpZ2h0ID0gYWZ0ZXJOZXdIaWdobGlnaHQucHJldmlvdXNTaWJsaW5nO1xuICAgICAgY29uc29sZS5sb2coXG4gICAgICAgIFwiTm9kZSBhdCB0aGUgc3RhcnQgb2YgdGhlIG5ldyBoaWdobGlnaHQ6IFwiLFxuICAgICAgICBzdGFydE9mTmV3SGlnaGxpZ2h0XG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCJOb2RlIGF0IHRoZSBlbmQgb2YgbmV3IGhpZ2hsaWdodDogXCIsIGVuZE9mTmV3SGlnaGxpZ2h0KTtcblxuICAgICAgY29uc3Qgc3RhcnRFbGVtZW50UGFyZW50ID0gZmluZEZpcnN0Tm9uU2hhcmVkUGFyZW50KHtcbiAgICAgICAgY2hpbGRFbGVtZW50OiBzdGFydE9mTmV3SGlnaGxpZ2h0LFxuICAgICAgICBvdGhlckVsZW1lbnQ6IGVuZE9mTmV3SGlnaGxpZ2h0XG4gICAgICB9KTtcblxuICAgICAgbGV0IHN0YXJ0RWxlbWVudFBhcmVudENvcHk7XG4gICAgICBsZXQgc3RhcnRPZk5ld0hpZ2hsaWdodENvcHk7XG4gICAgICBpZiAoc3RhcnRFbGVtZW50UGFyZW50KSB7XG4gICAgICAgICh7XG4gICAgICAgICAgZWxlbWVudEFuY2VzdG9yQ29weTogc3RhcnRFbGVtZW50UGFyZW50Q29weSxcbiAgICAgICAgICBlbGVtZW50Q29weTogc3RhcnRPZk5ld0hpZ2hsaWdodENvcHlcbiAgICAgICAgfSA9IGV4dHJhY3RFbGVtZW50Q29udGVudEZvckhpZ2hsaWdodCh7XG4gICAgICAgICAgZWxlbWVudDogc3RhcnRPZk5ld0hpZ2hsaWdodCxcbiAgICAgICAgICBlbGVtZW50QW5jZXN0b3I6IHN0YXJ0RWxlbWVudFBhcmVudCxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgbG9jYXRpb25JblNlbGVjdGlvbjogXCJzdGFydFwiXG4gICAgICAgIH0pKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInN0YXJ0RWxlbWVudFBhcmVudDpcIiwgc3RhcnRFbGVtZW50UGFyZW50KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzdGFydEVsZW1lbnRQYXJlbnRDb3B5OiBcIiwgc3RhcnRFbGVtZW50UGFyZW50Q29weSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVuZEVsZW1lbnRQYXJlbnQgPSBmaW5kRmlyc3ROb25TaGFyZWRQYXJlbnQoe1xuICAgICAgICBjaGlsZEVsZW1lbnQ6IGVuZE9mTmV3SGlnaGxpZ2h0LFxuICAgICAgICBvdGhlckVsZW1lbnQ6IHN0YXJ0T2ZOZXdIaWdobGlnaHRcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgZW5kRWxlbWVudFBhcmVudENvcHk7XG4gICAgICBsZXQgZW5kT2ZOZXdIaWdobGlnaHRDb3B5O1xuICAgICAgaWYgKGVuZEVsZW1lbnRQYXJlbnQpIHtcbiAgICAgICAgKHtcbiAgICAgICAgICBlbGVtZW50QW5jZXN0b3JDb3B5OiBlbmRFbGVtZW50UGFyZW50Q29weSxcbiAgICAgICAgICBlbGVtZW50Y29weTogZW5kT2ZOZXdIaWdobGlnaHRDb3B5XG4gICAgICAgIH0gPSBleHRyYWN0RWxlbWVudENvbnRlbnRGb3JIaWdobGlnaHQoe1xuICAgICAgICAgIGVsZW1lbnQ6IGVuZE9mTmV3SGlnaGxpZ2h0LFxuICAgICAgICAgIGVsZW1lbnRBbmNlc3RvcjogZW5kRWxlbWVudFBhcmVudCxcbiAgICAgICAgICBvcHRpb25zOiB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgbG9jYXRpb25JblNlbGVjdGlvbjogXCJlbmRcIlxuICAgICAgICB9KSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiTm9kZSB0aGF0IGlzIHRoZSB3cmFwcGVyIG9mIHRoZSBlbmQgb2YgdGhlIG5ldyBoaWdobGlnaHQ6IFwiLFxuICAgICAgICAgIGVuZEVsZW1lbnRQYXJlbnRcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcIkNsb25lZCBvZiBub2RlIHRoYXQgaXMgdGhlIHdyYXBwZXIgb2YgdGhlIGVuZCBvZiB0aGUgbmV3IGhpZ2hsaWdodCBhZnRlciByZW1vdmluZyBzaWJsaW5ncyBhbmQgdW53cmFwcGluZyBoaWdobGlnaHQgc3BhbnM6IFwiLFxuICAgICAgICAgIGVuZEVsZW1lbnRQYXJlbnRDb3B5XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGFkZE5vZGVzVG9IaWdobGlnaHRBZnRlckVsZW1lbnQoe1xuICAgICAgICBlbGVtZW50OiBzdGFydE9mTmV3SGlnaGxpZ2h0Q29weSB8fCBzdGFydE9mTmV3SGlnaGxpZ2h0LFxuICAgICAgICBlbGVtZW50QW5jZXN0b3I6IHN0YXJ0RWxlbWVudFBhcmVudENvcHksXG4gICAgICAgIGhpZ2hsaWdodFdyYXBwZXI6IHdyYXBwZXJDbG9uZSxcbiAgICAgICAgaGlnaGxpZ2h0ZWRDbGFzczogdGhpcy5vcHRpb25zLmhpZ2hsaWdodGVkQ2xhc3NcbiAgICAgIH0pO1xuXG4gICAgICAvLyBUT0RPOiBhZGQgY29udGFpbmVycyBpbiBiZXR3ZWVuLlxuICAgICAgY29uc3QgY29udGFpbmVyc0luQmV0d2VlbiA9IG5vZGVzSW5CZXR3ZWVuKHN0YXJ0Q29udGFpbmVyLCBlbmRDb250YWluZXIpO1xuICAgICAgY29uc29sZS5sb2coXCJDT05UQUlORVJTIElOIEJFVFdFRU46IFwiLCBjb250YWluZXJzSW5CZXR3ZWVuKTtcbiAgICAgIGNvbnRhaW5lcnNJbkJldHdlZW4uZm9yRWFjaChjb250YWluZXIgPT4ge1xuICAgICAgICB3cmFwcGVyQ2xvbmUuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZW5kRWxlbWVudFBhcmVudENvcHkpIHtcbiAgICAgICAgLy8gT25seSBjb3B5IHRoZSBjaGlsZHJlbiBvZiBhIGhpZ2hsaWdodGVkIHNwYW4gaW50byBvdXIgbmV3IGhpZ2hsaWdodC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIGVuZEVsZW1lbnRQYXJlbnRDb3B5LmNsYXNzTGlzdC5jb250YWlucyh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0ZWRDbGFzcylcbiAgICAgICAgKSB7XG4gICAgICAgICAgZW5kRWxlbWVudFBhcmVudENvcHkuY2hpbGROb2Rlcy5mb3JFYWNoKGNoaWxkTm9kZSA9PiB7XG4gICAgICAgICAgICB3cmFwcGVyQ2xvbmUuYXBwZW5kQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3cmFwcGVyQ2xvbmUuYXBwZW5kQ2hpbGQoZW5kRWxlbWVudFBhcmVudENvcHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3cmFwcGVyQ2xvbmUuYXBwZW5kQ2hpbGQoZW5kT2ZOZXdIaWdobGlnaHQpO1xuICAgICAgfVxuXG4gICAgICBkb20od3JhcHBlckNsb25lKS5pbnNlcnRCZWZvcmUoXG4gICAgICAgIGVuZEVsZW1lbnRQYXJlbnQgPyBlbmRFbGVtZW50UGFyZW50IDogYWZ0ZXJOZXdIaWdobGlnaHRcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhpZ2hsaWdodHM7XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0cyBjdXJyZW50IHJhbmdlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGtlZXBSYW5nZSAtIERvbid0IHJlbW92ZSByYW5nZSBhZnRlciBoaWdobGlnaHRpbmcuIERlZmF1bHQ6IGZhbHNlLlxuICAgKiBAbWVtYmVyb2YgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyXG4gICAqL1xuICBkb0hpZ2hsaWdodChrZWVwUmFuZ2UpIHtcbiAgICBsZXQgcmFuZ2UgPSBkb20odGhpcy5lbCkuZ2V0UmFuZ2UoKSxcbiAgICAgIHdyYXBwZXIsXG4gICAgICB0aW1lc3RhbXA7XG5cbiAgICBpZiAoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMub25CZWZvcmVIaWdobGlnaHQocmFuZ2UpID09PSB0cnVlKSB7XG4gICAgICB0aW1lc3RhbXAgPSArbmV3IERhdGUoKTtcbiAgICAgIHdyYXBwZXIgPSBjcmVhdGVXcmFwcGVyKHRoaXMub3B0aW9ucyk7XG4gICAgICB3cmFwcGVyLnNldEF0dHJpYnV0ZShUSU1FU1RBTVBfQVRUUiwgdGltZXN0YW1wKTtcblxuICAgICAgY29uc3QgZGVzY3JpcHRvcnMgPSBjcmVhdGVEZXNjcmlwdG9ycyh7XG4gICAgICAgIHJvb3RFbGVtZW50OiB0aGlzLmVsLFxuICAgICAgICByYW5nZSxcbiAgICAgICAgd3JhcHBlclxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNyZWF0ZWRIaWdobGlnaHRzID0gdGhpcy5oaWdobGlnaHRSYW5nZShyYW5nZSwgd3JhcHBlcik7XG4gICAgICAvLyBub3JtYWxpemVkSGlnaGxpZ2h0cyA9IHRoaXMubm9ybWFsaXplSGlnaGxpZ2h0cyhjcmVhdGVkSGlnaGxpZ2h0cyk7XG5cbiAgICAgIGNvbnN0IHByb2Nlc3NlZERlc2NyaXB0b3JzID0gdGhpcy5vcHRpb25zLm9uQWZ0ZXJIaWdobGlnaHQoXG4gICAgICAgIHJhbmdlLFxuICAgICAgICBkZXNjcmlwdG9ycyxcbiAgICAgICAgdGltZXN0YW1wXG4gICAgICApO1xuICAgICAgdGhpcy5kZXNlcmlhbGl6ZUhpZ2hsaWdodHMocHJvY2Vzc2VkRGVzY3JpcHRvcnMpO1xuICAgIH1cblxuICAgIGlmICgha2VlcFJhbmdlKSB7XG4gICAgICBkb20odGhpcy5lbCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgaGlnaGxpZ2h0cy4gRW5zdXJlcyB0ZXh0IG5vZGVzIHdpdGhpbiBhbnkgZ2l2ZW4gZWxlbWVudCBub2RlIGFyZSBtZXJnZWQgdG9nZXRoZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IGhpZ2hsaWdodHMgLSBoaWdobGlnaHRzIHRvIG5vcm1hbGl6ZS5cbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIG5vcm1hbGl6ZWQgaGlnaGxpZ2h0cy4gT3JkZXIgYW5kIG51bWJlciBvZiByZXR1cm5lZCBoaWdobGlnaHRzIG1heSBiZSBkaWZmZXJlbnQgdGhhblxuICAgKiBpbnB1dCBoaWdobGlnaHRzLlxuICAgKiBAbWVtYmVyb2YgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyXG4gICAqL1xuICBub3JtYWxpemVIaWdobGlnaHRzKGhpZ2hsaWdodHMpIHtcbiAgICBsZXQgbm9ybWFsaXplZEhpZ2hsaWdodHM7XG5cbiAgICAvL1NpbmNlIHdlJ3JlIG5vdCBtZXJnaW5nIG9yIGZsYXR0ZW5pbmcsIHdlIG5lZWQgdG8gbm9ybWFsaXNlIHRoZSB0ZXh0IG5vZGVzLlxuICAgIGhpZ2hsaWdodHMuZm9yRWFjaChmdW5jdGlvbihoaWdobGlnaHQpIHtcbiAgICAgIGRvbShoaWdobGlnaHQpLm5vcm1hbGl6ZVRleHROb2RlcygpO1xuICAgIH0pO1xuXG4gICAgLy8gb21pdCByZW1vdmVkIG5vZGVzXG4gICAgbm9ybWFsaXplZEhpZ2hsaWdodHMgPSBoaWdobGlnaHRzLmZpbHRlcihmdW5jdGlvbihobCkge1xuICAgICAgcmV0dXJuIGhsLnBhcmVudEVsZW1lbnQgPyBobCA6IG51bGw7XG4gICAgfSk7XG5cbiAgICBub3JtYWxpemVkSGlnaGxpZ2h0cyA9IHVuaXF1ZShub3JtYWxpemVkSGlnaGxpZ2h0cyk7XG4gICAgbm9ybWFsaXplZEhpZ2hsaWdodHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5vZmZzZXRUb3AgLSBiLm9mZnNldFRvcCB8fCBhLm9mZnNldExlZnQgLSBiLm9mZnNldExlZnQ7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbm9ybWFsaXplZEhpZ2hsaWdodHM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBoaWdobGlnaHRzIGZyb20gZWxlbWVudC4gSWYgZWxlbWVudCBpcyBhIGhpZ2hsaWdodCBpdHNlbGYsIGl0IGlzIHJlbW92ZWQgYXMgd2VsbC5cbiAgICogSWYgbm8gZWxlbWVudCBpcyBnaXZlbiwgYWxsIGhpZ2hsaWdodHMgYXJlIHJlbW92ZWQuXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtlbGVtZW50XSAtIGVsZW1lbnQgdG8gcmVtb3ZlIGhpZ2hsaWdodHMgZnJvbVxuICAgKiBAbWVtYmVyb2YgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyXG4gICAqL1xuICByZW1vdmVIaWdobGlnaHRzKGVsZW1lbnQpIHtcbiAgICBsZXQgY29udGFpbmVyID0gZWxlbWVudCB8fCB0aGlzLmVsLFxuICAgICAgaGlnaGxpZ2h0cyA9IHRoaXMuZ2V0SGlnaGxpZ2h0cygpLFxuICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiByZW1vdmVIaWdobGlnaHQoaGlnaGxpZ2h0KSB7XG4gICAgICBpZiAoaGlnaGxpZ2h0LmNsYXNzTmFtZSA9PT0gY29udGFpbmVyLmNsYXNzTmFtZSkge1xuICAgICAgICBkb20oaGlnaGxpZ2h0KS51bndyYXAoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBoaWdobGlnaHRzLmZvckVhY2goZnVuY3Rpb24oaGwpIHtcbiAgICAgIGlmIChzZWxmLm9wdGlvbnMub25SZW1vdmVIaWdobGlnaHQoaGwpID09PSB0cnVlKSB7XG4gICAgICAgIHJlbW92ZUhpZ2hsaWdodChobCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBoaWdobGlnaHRzIGZyb20gZ2l2ZW4gY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcGFyYW1zXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJhbXMuY29udGFpbmVyXSAtIHJldHVybiBoaWdobGlnaHRzIGZyb20gdGhpcyBlbGVtZW50LiBEZWZhdWx0OiB0aGUgZWxlbWVudCB0aGVcbiAgICogaGlnaGxpZ2h0ZXIgaXMgYXBwbGllZCB0by5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcGFyYW1zLmFuZFNlbGZdIC0gaWYgc2V0IHRvIHRydWUgYW5kIGNvbnRhaW5lciBpcyBhIGhpZ2hsaWdodCBpdHNlbGYsIGFkZCBjb250YWluZXIgdG9cbiAgICogcmV0dXJuZWQgcmVzdWx0cy4gRGVmYXVsdDogdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcGFyYW1zLmdyb3VwZWRdIC0gaWYgc2V0IHRvIHRydWUsIGhpZ2hsaWdodHMgYXJlIGdyb3VwZWQgaW4gbG9naWNhbCBncm91cHMgb2YgaGlnaGxpZ2h0cyBhZGRlZFxuICAgKiBpbiB0aGUgc2FtZSBtb21lbnQuIEVhY2ggZ3JvdXAgaXMgYW4gb2JqZWN0IHdoaWNoIGhhcyBnb3QgYXJyYXkgb2YgaGlnaGxpZ2h0cywgJ3RvU3RyaW5nJyBtZXRob2QgYW5kICd0aW1lc3RhbXAnXG4gICAqIHByb3BlcnR5LiBEZWZhdWx0OiBmYWxzZS5cbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIGhpZ2hsaWdodHMuXG4gICAqIEBtZW1iZXJvZiBJbmRlcGVuZGVuY2lhSGlnaGxpZ2h0ZXJcbiAgICovXG4gIGdldEhpZ2hsaWdodHMocGFyYW1zKSB7XG4gICAgY29uc3QgbWVyZ2VkUGFyYW1zID0ge1xuICAgICAgY29udGFpbmVyOiB0aGlzLmVsLFxuICAgICAgZGF0YUF0dHI6IERBVEFfQVRUUixcbiAgICAgIHRpbWVzdGFtcEF0dHI6IFRJTUVTVEFNUF9BVFRSLFxuICAgICAgLi4ucGFyYW1zXG4gICAgfTtcbiAgICByZXR1cm4gcmV0cmlldmVIaWdobGlnaHRzKG1lcmdlZFBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIGVsZW1lbnQgaXMgYSBoaWdobGlnaHQuXG4gICAqXG4gICAqIEBwYXJhbSBlbCAtIGVsZW1lbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAbWVtYmVyb2YgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyXG4gICAqL1xuICBpc0hpZ2hsaWdodChlbCwgZGF0YUF0dHIpIHtcbiAgICByZXR1cm4gaXNFbGVtZW50SGlnaGxpZ2h0KGVsLCBkYXRhQXR0cik7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplcyBhbGwgaGlnaGxpZ2h0cyBpbiB0aGUgZWxlbWVudCB0aGUgaGlnaGxpZ2h0ZXIgaXMgYXBwbGllZCB0by5cbiAgICogQHJldHVybnMge3N0cmluZ30gLSBzdHJpbmdpZmllZCBKU09OIHdpdGggaGlnaGxpZ2h0cyBkZWZpbml0aW9uXG4gICAqIEBtZW1iZXJvZiBJbmRlcGVuZGVuY2lhSGlnaGxpZ2h0ZXJcbiAgICovXG4gIHNlcmlhbGl6ZUhpZ2hsaWdodHMoaWQpIHtcbiAgICBsZXQgaGlnaGxpZ2h0cyA9IHRoaXMuZ2V0SGlnaGxpZ2h0cygpLFxuICAgICAgaGxEZXNjcmlwdG9ycyA9IFtdO1xuXG4gICAgc29ydEJ5RGVwdGgoaGlnaGxpZ2h0cywgZmFsc2UpO1xuXG4gICAgaGlnaGxpZ2h0cy5mb3JFYWNoKGZ1bmN0aW9uKGhpZ2hsaWdodCkge1xuICAgICAgbGV0IGxlbmd0aCA9IGhpZ2hsaWdodC5nZXRBdHRyaWJ1dGUoTEVOR1RIX0FUVFIpLFxuICAgICAgICBvZmZzZXQgPSBoaWdobGlnaHQuZ2V0QXR0cmlidXRlKFNUQVJUX09GRlNFVF9BVFRSKSxcbiAgICAgICAgd3JhcHBlciA9IGhpZ2hsaWdodC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgIGNvbnN0IGNvbnRhaW5zSWRBc0NsYXNzID0gd3JhcHBlci5jbGFzc0xpc3QuY29udGFpbnMoaWQpO1xuICAgICAgd3JhcHBlci5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgd3JhcHBlciA9IHdyYXBwZXIub3V0ZXJIVE1MO1xuXG4gICAgICBpZiAoY29udGFpbnNJZEFzQ2xhc3MpIHtcbiAgICAgICAgaGxEZXNjcmlwdG9ycy5wdXNoKFt3cmFwcGVyLCBoaWdobGlnaHQudGV4dENvbnRlbnQsIG9mZnNldCwgbGVuZ3RoXSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoaGxEZXNjcmlwdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIHRoZSBpbmRlcGVuZGVudCBmb3JtIG9mIGhpZ2hsaWdodHMuXG4gICAqXG4gICAqIEB0aHJvd3MgZXhjZXB0aW9uIHdoZW4gY2FuJ3QgcGFyc2UgSlNPTiBvciBKU09OIGhhcyBpbnZhbGlkIHN0cnVjdHVyZS5cbiAgICogQHBhcmFtIHtvYmplY3R9IGpzb24gLSBKU09OIG9iamVjdCB3aXRoIGhpZ2hsaWdodHMgZGVmaW5pdGlvbi5cbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIGRlc2VyaWFsaXplZCBoaWdobGlnaHRzLlxuICAgKiBAbWVtYmVyb2YgVGV4dEhpZ2hsaWdodGVyXG4gICAqL1xuICBkZXNlcmlhbGl6ZUhpZ2hsaWdodHMoanNvbikge1xuICAgIGxldCBobERlc2NyaXB0b3JzLFxuICAgICAgaGlnaGxpZ2h0cyA9IFtdLFxuICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoIWpzb24pIHtcbiAgICAgIHJldHVybiBoaWdobGlnaHRzO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBobERlc2NyaXB0b3JzID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBcIkNhbid0IHBhcnNlIEpTT046IFwiICsgZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXNlcmlhbGl6YXRpb25GbkN1c3RvbShobERlc2NyaXB0b3IpIHtcbiAgICAgIGxldCBobCA9IHtcbiAgICAgICAgICB3cmFwcGVyOiBobERlc2NyaXB0b3JbMF0sXG4gICAgICAgICAgdGV4dDogaGxEZXNjcmlwdG9yWzFdLFxuICAgICAgICAgIG9mZnNldDogTnVtYmVyLnBhcnNlSW50KGhsRGVzY3JpcHRvclsyXSksXG4gICAgICAgICAgbGVuZ3RoOiBOdW1iZXIucGFyc2VJbnQoaGxEZXNjcmlwdG9yWzNdKVxuICAgICAgICB9LFxuICAgICAgICBobE5vZGUsXG4gICAgICAgIGhpZ2hsaWdodDtcblxuICAgICAgY29uc3QgcGFyZW50Tm9kZSA9IHNlbGYuZWw7XG4gICAgICBjb25zdCB7IG5vZGUsIG9mZnNldDogb2Zmc2V0V2l0aGluTm9kZSB9ID0gZmluZE5vZGVBbmRPZmZzZXQoXG4gICAgICAgIGhsLFxuICAgICAgICBwYXJlbnROb2RlXG4gICAgICApO1xuXG4gICAgICBobE5vZGUgPSBub2RlLnNwbGl0VGV4dChvZmZzZXRXaXRoaW5Ob2RlKTtcbiAgICAgIGhsTm9kZS5zcGxpdFRleHQoaGwubGVuZ3RoKTtcblxuICAgICAgaWYgKGhsTm9kZS5uZXh0U2libGluZyAmJiAhaGxOb2RlLm5leHRTaWJsaW5nLm5vZGVWYWx1ZSkge1xuICAgICAgICBkb20oaGxOb2RlLm5leHRTaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGhsTm9kZS5wcmV2aW91c1NpYmxpbmcgJiYgIWhsTm9kZS5wcmV2aW91c1NpYmxpbmcubm9kZVZhbHVlKSB7XG4gICAgICAgIGRvbShobE5vZGUucHJldmlvdXNTaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgaGlnaGxpZ2h0ID0gZG9tKGhsTm9kZSkud3JhcChkb20oKS5mcm9tSFRNTChobC53cmFwcGVyKVswXSk7XG4gICAgICBoaWdobGlnaHRzLnB1c2goaGlnaGxpZ2h0KTtcbiAgICB9XG5cbiAgICBobERlc2NyaXB0b3JzLmZvckVhY2goZnVuY3Rpb24oaGxEZXNjcmlwdG9yKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhpZ2hsaWdodDogXCIsIGhsRGVzY3JpcHRvcik7XG4gICAgICAgIGRlc2VyaWFsaXphdGlvbkZuQ3VzdG9tKGhsRGVzY3JpcHRvcik7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChjb25zb2xlICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIkNhbid0IGRlc2VyaWFsaXplIGhpZ2hsaWdodCBkZXNjcmlwdG9yLiBDYXVzZTogXCIgKyBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhpZ2hsaWdodHM7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW5kZXBlbmRlbmNpYUhpZ2hsaWdodGVyO1xuIiwiaW1wb3J0IHtcbiAgcmVmaW5lUmFuZ2VCb3VuZGFyaWVzLFxuICByZXRyaWV2ZUhpZ2hsaWdodHMsXG4gIGlzRWxlbWVudEhpZ2hsaWdodCxcbiAgc29ydEJ5RGVwdGgsXG4gIGhhdmVTYW1lQ29sb3IsXG4gIGNyZWF0ZVdyYXBwZXJcbn0gZnJvbSBcIi4uL3V0aWxzL2hpZ2hsaWdodHNcIjtcbmltcG9ydCBkb20sIHsgTk9ERV9UWVBFIH0gZnJvbSBcIi4uL3V0aWxzL2RvbVwiO1xuaW1wb3J0IHsgSUdOT1JFX1RBR1MsIERBVEFfQVRUUiwgVElNRVNUQU1QX0FUVFIgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5pbXBvcnQgeyB1bmlxdWUgfSBmcm9tIFwiLi4vdXRpbHMvYXJyYXlzXCI7XG5cbi8qKlxuICogUHJpbWl0aXZvSGlnaGxpZ2h0ZXIgdGhhdCBwcm92aWRlcyB0ZXh0IGhpZ2hsaWdodGluZyBmdW5jdGlvbmFsaXR5IHRvIGRvbSBlbGVtZW50c1xuICogZm9yIHNpbXBsZSB1c2UgY2FzZXMuXG4gKi9cbmNsYXNzIFByaW1pdGl2b0hpZ2hsaWdodGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBQcmltaXRpdm9IaWdobGlnaHRlciBpbnN0YW5jZSBmb3IgZnVuY3Rpb25hbGl0eSBzcGVjaWZpYyB0byB0aGUgb3JpZ2luYWwgaW1wbGVtZW50YXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnQgLSBET00gZWxlbWVudCB0byB3aGljaCBoaWdobGlnaHRlZCB3aWxsIGJlIGFwcGxpZWQuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gLSBhZGRpdGlvbmFsIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbG9yIC0gaGlnaGxpZ2h0IGNvbG9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5oaWdobGlnaHRlZENsYXNzIC0gY2xhc3MgYWRkZWQgdG8gaGlnaGxpZ2h0LCAnaGlnaGxpZ2h0ZWQnIGJ5IGRlZmF1bHQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbnRleHRDbGFzcyAtIGNsYXNzIGFkZGVkIHRvIGVsZW1lbnQgdG8gd2hpY2ggaGlnaGxpZ2h0ZXIgaXMgYXBwbGllZCxcbiAgICogICdoaWdobGlnaHRlci1jb250ZXh0JyBieSBkZWZhdWx0LlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLm9uUmVtb3ZlSGlnaGxpZ2h0IC0gZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBoaWdobGlnaHQgaXMgcmVtb3ZlZC4gSGlnaGxpZ2h0IGlzXG4gICAqICBwYXNzZWQgYXMgcGFyYW0uIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSBpZiBoaWdobGlnaHQgc2hvdWxkIGJlIHJlbW92ZWQsIG9yIGZhbHNlIC0gdG8gcHJldmVudCByZW1vdmFsLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLm9uQmVmb3JlSGlnaGxpZ2h0IC0gZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBoaWdobGlnaHQgaXMgY3JlYXRlZC4gUmFuZ2Ugb2JqZWN0IGlzXG4gICAqICBwYXNzZWQgYXMgcGFyYW0uIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB0byBjb250aW51ZSBwcm9jZXNzaW5nLCBvciBmYWxzZSAtIHRvIHByZXZlbnQgaGlnaGxpZ2h0aW5nLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLm9uQWZ0ZXJIaWdobGlnaHQgLSBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgaGlnaGxpZ2h0IGlzIGNyZWF0ZWQuIEFycmF5IG9mIGNyZWF0ZWRcbiAgICogd3JhcHBlcnMgaXMgcGFzc2VkIGFzIHBhcmFtLlxuICAgKiBAY2xhc3MgVGV4dEhpZ2hsaWdodGVyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHJhbmdlLlxuICAgKiBXcmFwcyB0ZXh0IG9mIGdpdmVuIHJhbmdlIG9iamVjdCBpbiB3cmFwcGVyIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHdyYXBwZXJcbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIGNyZWF0ZWQgaGlnaGxpZ2h0cy5cbiAgICogQG1lbWJlcm9mIFByaW1pdGl2b0hpZ2hsaWdodGVyXG4gICAqL1xuICBoaWdobGlnaHRSYW5nZShyYW5nZSwgd3JhcHBlcikge1xuICAgIGlmICghcmFuZ2UgfHwgcmFuZ2UuY29sbGFwc2VkKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coXCJBTFNEZWJ1ZzI4OiByYW5nZSBiZWZvcmUgcmVmaW5lZCEgXCIsIHJhbmdlKTtcblxuICAgIGxldCByZXN1bHQgPSByZWZpbmVSYW5nZUJvdW5kYXJpZXMocmFuZ2UpLFxuICAgICAgc3RhcnRDb250YWluZXIgPSByZXN1bHQuc3RhcnRDb250YWluZXIsXG4gICAgICBlbmRDb250YWluZXIgPSByZXN1bHQuZW5kQ29udGFpbmVyLFxuICAgICAgZ29EZWVwZXIgPSByZXN1bHQuZ29EZWVwZXIsXG4gICAgICBkb25lID0gZmFsc2UsXG4gICAgICBub2RlID0gc3RhcnRDb250YWluZXIsXG4gICAgICBoaWdobGlnaHRzID0gW10sXG4gICAgICBoaWdobGlnaHQsXG4gICAgICB3cmFwcGVyQ2xvbmUsXG4gICAgICBub2RlUGFyZW50O1xuXG4gICAgZG8ge1xuICAgICAgaWYgKGdvRGVlcGVyICYmIG5vZGUubm9kZVR5cGUgPT09IE5PREVfVFlQRS5URVhUX05PREUpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIElHTk9SRV9UQUdTLmluZGV4T2Yobm9kZS5wYXJlbnROb2RlLnRhZ05hbWUpID09PSAtMSAmJlxuICAgICAgICAgIG5vZGUubm9kZVZhbHVlLnRyaW0oKSAhPT0gXCJcIlxuICAgICAgICApIHtcbiAgICAgICAgICB3cmFwcGVyQ2xvbmUgPSB3cmFwcGVyLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgICB3cmFwcGVyQ2xvbmUuc2V0QXR0cmlidXRlKERBVEFfQVRUUiwgdHJ1ZSk7XG4gICAgICAgICAgbm9kZVBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblxuICAgICAgICAgIC8vIGhpZ2hsaWdodCBpZiBhIG5vZGUgaXMgaW5zaWRlIHRoZSBlbFxuICAgICAgICAgIGlmIChkb20odGhpcy5lbCkuY29udGFpbnMobm9kZVBhcmVudCkgfHwgbm9kZVBhcmVudCA9PT0gdGhpcy5lbCkge1xuICAgICAgICAgICAgaGlnaGxpZ2h0ID0gZG9tKG5vZGUpLndyYXAod3JhcHBlckNsb25lKTtcbiAgICAgICAgICAgIGhpZ2hsaWdodHMucHVzaChoaWdobGlnaHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGdvRGVlcGVyID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIG5vZGUgPT09IGVuZENvbnRhaW5lciAmJlxuICAgICAgICAhKGVuZENvbnRhaW5lci5oYXNDaGlsZE5vZGVzKCkgJiYgZ29EZWVwZXIpXG4gICAgICApIHtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlLnRhZ05hbWUgJiYgSUdOT1JFX1RBR1MuaW5kZXhPZihub2RlLnRhZ05hbWUpID4gLTEpIHtcbiAgICAgICAgaWYgKGVuZENvbnRhaW5lci5wYXJlbnROb2RlID09PSBub2RlKSB7XG4gICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZ29EZWVwZXIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmIChnb0RlZXBlciAmJiBub2RlLmhhc0NoaWxkTm9kZXMoKSkge1xuICAgICAgICBub2RlID0gbm9kZS5maXJzdENoaWxkO1xuICAgICAgfSBlbHNlIGlmIChub2RlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICBnb0RlZXBlciA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBnb0RlZXBlciA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gd2hpbGUgKCFkb25lKTtcblxuICAgIHJldHVybiBoaWdobGlnaHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgaGlnaGxpZ2h0cy4gRW5zdXJlcyB0aGF0IGhpZ2hsaWdodGluZyBpcyBkb25lIHdpdGggdXNlIG9mIHRoZSBzbWFsbGVzdCBwb3NzaWJsZSBudW1iZXIgb2ZcbiAgICogd3JhcHBpbmcgSFRNTCBlbGVtZW50cy5cbiAgICogRmxhdHRlbnMgaGlnaGxpZ2h0cyBzdHJ1Y3R1cmUgYW5kIG1lcmdlcyBzaWJsaW5nIGhpZ2hsaWdodHMuIE5vcm1hbGl6ZXMgdGV4dCBub2RlcyB3aXRoaW4gaGlnaGxpZ2h0cy5cbiAgICogQHBhcmFtIHtBcnJheX0gaGlnaGxpZ2h0cyAtIGhpZ2hsaWdodHMgdG8gbm9ybWFsaXplLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IC0gYXJyYXkgb2Ygbm9ybWFsaXplZCBoaWdobGlnaHRzLiBPcmRlciBhbmQgbnVtYmVyIG9mIHJldHVybmVkIGhpZ2hsaWdodHMgbWF5IGJlIGRpZmZlcmVudCB0aGFuXG4gICAqIGlucHV0IGhpZ2hsaWdodHMuXG4gICAqIEBtZW1iZXJvZiBQcmltaXRpdm9IaWdobGlnaHRlclxuICAgKi9cbiAgbm9ybWFsaXplSGlnaGxpZ2h0cyhoaWdobGlnaHRzKSB7XG4gICAgdmFyIG5vcm1hbGl6ZWRIaWdobGlnaHRzO1xuXG4gICAgdGhpcy5mbGF0dGVuTmVzdGVkSGlnaGxpZ2h0cyhoaWdobGlnaHRzKTtcbiAgICB0aGlzLm1lcmdlU2libGluZ0hpZ2hsaWdodHMoaGlnaGxpZ2h0cyk7XG5cbiAgICAvLyBvbWl0IHJlbW92ZWQgbm9kZXNcbiAgICBub3JtYWxpemVkSGlnaGxpZ2h0cyA9IGhpZ2hsaWdodHMuZmlsdGVyKGZ1bmN0aW9uKGhsKSB7XG4gICAgICByZXR1cm4gaGwucGFyZW50RWxlbWVudCA/IGhsIDogbnVsbDtcbiAgICB9KTtcblxuICAgIG5vcm1hbGl6ZWRIaWdobGlnaHRzID0gdW5pcXVlKG5vcm1hbGl6ZWRIaWdobGlnaHRzKTtcbiAgICBub3JtYWxpemVkSGlnaGxpZ2h0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLm9mZnNldFRvcCAtIGIub2Zmc2V0VG9wIHx8IGEub2Zmc2V0TGVmdCAtIGIub2Zmc2V0TGVmdDtcbiAgICB9KTtcblxuICAgIHJldHVybiBub3JtYWxpemVkSGlnaGxpZ2h0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBGbGF0dGVucyBoaWdobGlnaHRzIHN0cnVjdHVyZS5cbiAgICogTm90ZTogdGhpcyBtZXRob2QgY2hhbmdlcyBpbnB1dCBoaWdobGlnaHRzIC0gdGhlaXIgb3JkZXIgYW5kIG51bWJlciBhZnRlciBjYWxsaW5nIHRoaXMgbWV0aG9kIG1heSBjaGFuZ2UuXG4gICAqIEBwYXJhbSB7QXJyYXl9IGhpZ2hsaWdodHMgLSBoaWdobGlnaHRzIHRvIGZsYXR0ZW4uXG4gICAqIEBtZW1iZXJvZiBQcmltaXRpdm9IaWdobGlnaHRlclxuICAgKi9cbiAgZmxhdHRlbk5lc3RlZEhpZ2hsaWdodHMoaGlnaGxpZ2h0cykge1xuICAgIGxldCBhZ2FpbixcbiAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgc29ydEJ5RGVwdGgoaGlnaGxpZ2h0cywgdHJ1ZSk7XG5cbiAgICBmdW5jdGlvbiBmbGF0dGVuT25jZSgpIHtcbiAgICAgIGxldCBhZ2FpbiA9IGZhbHNlO1xuXG4gICAgICBoaWdobGlnaHRzLmZvckVhY2goZnVuY3Rpb24oaGwsIGkpIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IGhsLnBhcmVudEVsZW1lbnQsXG4gICAgICAgICAgcGFyZW50UHJldiA9IHBhcmVudC5wcmV2aW91c1NpYmxpbmcsXG4gICAgICAgICAgcGFyZW50TmV4dCA9IHBhcmVudC5uZXh0U2libGluZztcblxuICAgICAgICBpZiAoc2VsZi5pc0hpZ2hsaWdodChwYXJlbnQsIERBVEFfQVRUUikpIHtcbiAgICAgICAgICBpZiAoIWhhdmVTYW1lQ29sb3IocGFyZW50LCBobCkpIHtcbiAgICAgICAgICAgIGlmICghaGwubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgICAgICAgaWYgKCFwYXJlbnROZXh0KSB7XG4gICAgICAgICAgICAgICAgZG9tKGhsKS5pbnNlcnRBZnRlcihwYXJlbnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbShobCkuaW5zZXJ0QmVmb3JlKHBhcmVudE5leHQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGRvbShobCkuaW5zZXJ0QmVmb3JlKHBhcmVudE5leHQgfHwgcGFyZW50KTtcbiAgICAgICAgICAgICAgYWdhaW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWhsLnByZXZpb3VzU2libGluZykge1xuICAgICAgICAgICAgICBpZiAoIXBhcmVudFByZXYpIHtcbiAgICAgICAgICAgICAgICBkb20oaGwpLmluc2VydEJlZm9yZShwYXJlbnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbShobCkuaW5zZXJ0QWZ0ZXIocGFyZW50UHJldik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZG9tKGhsKS5pbnNlcnRBZnRlcihwYXJlbnRQcmV2IHx8IHBhcmVudCk7XG4gICAgICAgICAgICAgIGFnYWluID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBobC5wcmV2aW91c1NpYmxpbmcgJiZcbiAgICAgICAgICAgICAgaGwucHJldmlvdXNTaWJsaW5nLm5vZGVUeXBlID09IDMgJiZcbiAgICAgICAgICAgICAgaGwubmV4dFNpYmxpbmcgJiZcbiAgICAgICAgICAgICAgaGwubmV4dFNpYmxpbmcubm9kZVR5cGUgPT0gM1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGxldCBzcGFubGVmdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICAgICAgICBzcGFubGVmdC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBwYXJlbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yO1xuICAgICAgICAgICAgICBzcGFubGVmdC5jbGFzc05hbWUgPSBwYXJlbnQuY2xhc3NOYW1lO1xuICAgICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gcGFyZW50LmF0dHJpYnV0ZXNbVElNRVNUQU1QX0FUVFJdLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgc3BhbmxlZnQuc2V0QXR0cmlidXRlKFRJTUVTVEFNUF9BVFRSLCB0aW1lc3RhbXApO1xuICAgICAgICAgICAgICBzcGFubGVmdC5zZXRBdHRyaWJ1dGUoREFUQV9BVFRSLCB0cnVlKTtcblxuICAgICAgICAgICAgICBsZXQgc3BhbnJpZ2h0ID0gc3BhbmxlZnQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICAgIGRvbShobC5wcmV2aW91c1NpYmxpbmcpLndyYXAoc3BhbmxlZnQpO1xuICAgICAgICAgICAgICBkb20oaGwubmV4dFNpYmxpbmcpLndyYXAoc3BhbnJpZ2h0KTtcblxuICAgICAgICAgICAgICBsZXQgbm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChwYXJlbnQuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgICAgICAgIGRvbShub2RlKS5pbnNlcnRCZWZvcmUobm9kZS5wYXJlbnROb2RlKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGFnYWluID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFwYXJlbnQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgICAgIGRvbShwYXJlbnQpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGhsLmZpcnN0Q2hpbGQsIGhsKTtcbiAgICAgICAgICAgIGhpZ2hsaWdodHNbaV0gPSBwYXJlbnQ7XG4gICAgICAgICAgICBhZ2FpbiA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGFnYWluO1xuICAgIH1cblxuICAgIGRvIHtcbiAgICAgIGFnYWluID0gZmxhdHRlbk9uY2UoKTtcbiAgICB9IHdoaWxlIChhZ2Fpbik7XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHNpYmxpbmcgaGlnaGxpZ2h0cyBhbmQgbm9ybWFsaXplcyBkZXNjZW5kYW50IHRleHQgbm9kZXMuXG4gICAqIE5vdGU6IHRoaXMgbWV0aG9kIGNoYW5nZXMgaW5wdXQgaGlnaGxpZ2h0cyAtIHRoZWlyIG9yZGVyIGFuZCBudW1iZXIgYWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCBtYXkgY2hhbmdlLlxuICAgKiBAcGFyYW0gaGlnaGxpZ2h0c1xuICAgKiBAbWVtYmVyb2YgUHJpbWl0aXZvSGlnaGxpZ2h0ZXJcbiAgICovXG4gIG1lcmdlU2libGluZ0hpZ2hsaWdodHMoaGlnaGxpZ2h0cykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNob3VsZE1lcmdlKGN1cnJlbnQsIG5vZGUpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIG5vZGUgJiZcbiAgICAgICAgbm9kZS5ub2RlVHlwZSA9PT0gTk9ERV9UWVBFLkVMRU1FTlRfTk9ERSAmJlxuICAgICAgICBoYXZlU2FtZUNvbG9yKGN1cnJlbnQsIG5vZGUpICYmXG4gICAgICAgIHNlbGYuaXNIaWdobGlnaHQobm9kZSwgREFUQV9BVFRSKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBoaWdobGlnaHRzLmZvckVhY2goZnVuY3Rpb24oaGlnaGxpZ2h0KSB7XG4gICAgICB2YXIgcHJldiA9IGhpZ2hsaWdodC5wcmV2aW91c1NpYmxpbmcsXG4gICAgICAgIG5leHQgPSBoaWdobGlnaHQubmV4dFNpYmxpbmc7XG5cbiAgICAgIGlmIChzaG91bGRNZXJnZShoaWdobGlnaHQsIHByZXYpKSB7XG4gICAgICAgIGRvbShoaWdobGlnaHQpLnByZXBlbmQocHJldi5jaGlsZE5vZGVzKTtcbiAgICAgICAgZG9tKHByZXYpLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKHNob3VsZE1lcmdlKGhpZ2hsaWdodCwgbmV4dCkpIHtcbiAgICAgICAgZG9tKGhpZ2hsaWdodCkuYXBwZW5kKG5leHQuY2hpbGROb2Rlcyk7XG4gICAgICAgIGRvbShuZXh0KS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgZG9tKGhpZ2hsaWdodCkubm9ybWFsaXplVGV4dE5vZGVzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0cyBjdXJyZW50IHJhbmdlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGtlZXBSYW5nZSAtIERvbid0IHJlbW92ZSByYW5nZSBhZnRlciBoaWdobGlnaHRpbmcuIERlZmF1bHQ6IGZhbHNlLlxuICAgKiBAbWVtYmVyb2YgUHJpbWl0aXZvSGlnaGxpZ2h0ZXJcbiAgICovXG4gIGRvSGlnaGxpZ2h0KGtlZXBSYW5nZSkge1xuICAgIGxldCByYW5nZSA9IGRvbSh0aGlzLmVsKS5nZXRSYW5nZSgpLFxuICAgICAgd3JhcHBlcixcbiAgICAgIGNyZWF0ZWRIaWdobGlnaHRzLFxuICAgICAgbm9ybWFsaXplZEhpZ2hsaWdodHMsXG4gICAgICB0aW1lc3RhbXA7XG5cbiAgICBpZiAoIXJhbmdlIHx8IHJhbmdlLmNvbGxhcHNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMub25CZWZvcmVIaWdobGlnaHQocmFuZ2UpID09PSB0cnVlKSB7XG4gICAgICB0aW1lc3RhbXAgPSArbmV3IERhdGUoKTtcbiAgICAgIHdyYXBwZXIgPSBjcmVhdGVXcmFwcGVyKHRoaXMub3B0aW9ucyk7XG4gICAgICB3cmFwcGVyLnNldEF0dHJpYnV0ZShUSU1FU1RBTVBfQVRUUiwgdGltZXN0YW1wKTtcblxuICAgICAgY3JlYXRlZEhpZ2hsaWdodHMgPSB0aGlzLmhpZ2hsaWdodFJhbmdlKHJhbmdlLCB3cmFwcGVyKTtcbiAgICAgIG5vcm1hbGl6ZWRIaWdobGlnaHRzID0gdGhpcy5ub3JtYWxpemVIaWdobGlnaHRzKGNyZWF0ZWRIaWdobGlnaHRzKTtcblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMub25BZnRlckhpZ2hsaWdodCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcIkFMU0RFYnVnMjQ6IFByaW1pdGl2bzogdGhpcy5vcHRpb25zOiBcIixcbiAgICAgICAgICB0aGlzLm9wdGlvbnMsXG4gICAgICAgICAgXCJcXG5cXG5cXG5cXG5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdGhpcy5vcHRpb25zLm9uQWZ0ZXJIaWdobGlnaHQocmFuZ2UsIG5vcm1hbGl6ZWRIaWdobGlnaHRzLCB0aW1lc3RhbXApO1xuICAgIH1cblxuICAgIGlmICgha2VlcFJhbmdlKSB7XG4gICAgICBkb20odGhpcy5lbCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgaGlnaGxpZ2h0cyBmcm9tIGVsZW1lbnQuIElmIGVsZW1lbnQgaXMgYSBoaWdobGlnaHQgaXRzZWxmLCBpdCBpcyByZW1vdmVkIGFzIHdlbGwuXG4gICAqIElmIG5vIGVsZW1lbnQgaXMgZ2l2ZW4sIGFsbCBoaWdobGlnaHRzIGFsbCByZW1vdmVkLlxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbZWxlbWVudF0gLSBlbGVtZW50IHRvIHJlbW92ZSBoaWdobGlnaHRzIGZyb21cbiAgICogQG1lbWJlcm9mIFByaW1pdGl2b0hpZ2hsaWdodGVyXG4gICAqL1xuICByZW1vdmVIaWdobGlnaHRzKGVsZW1lbnQpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZWxlbWVudCB8fCB0aGlzLmVsLFxuICAgICAgaGlnaGxpZ2h0cyA9IHRoaXMuZ2V0SGlnaGxpZ2h0cyh7IGNvbnRhaW5lcjogY29udGFpbmVyIH0pLFxuICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBtZXJnZVNpYmxpbmdUZXh0Tm9kZXModGV4dE5vZGUpIHtcbiAgICAgIHZhciBwcmV2ID0gdGV4dE5vZGUucHJldmlvdXNTaWJsaW5nLFxuICAgICAgICBuZXh0ID0gdGV4dE5vZGUubmV4dFNpYmxpbmc7XG5cbiAgICAgIGlmIChwcmV2ICYmIHByZXYubm9kZVR5cGUgPT09IE5PREVfVFlQRS5URVhUX05PREUpIHtcbiAgICAgICAgdGV4dE5vZGUubm9kZVZhbHVlID0gcHJldi5ub2RlVmFsdWUgKyB0ZXh0Tm9kZS5ub2RlVmFsdWU7XG4gICAgICAgIGRvbShwcmV2KS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZXh0ICYmIG5leHQubm9kZVR5cGUgPT09IE5PREVfVFlQRS5URVhUX05PREUpIHtcbiAgICAgICAgdGV4dE5vZGUubm9kZVZhbHVlID0gdGV4dE5vZGUubm9kZVZhbHVlICsgbmV4dC5ub2RlVmFsdWU7XG4gICAgICAgIGRvbShuZXh0KS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVIaWdobGlnaHQoaGlnaGxpZ2h0KSB7XG4gICAgICB2YXIgdGV4dE5vZGVzID0gZG9tKGhpZ2hsaWdodCkudW53cmFwKCk7XG5cbiAgICAgIHRleHROb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgbWVyZ2VTaWJsaW5nVGV4dE5vZGVzKG5vZGUpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc29ydEJ5RGVwdGgoaGlnaGxpZ2h0cywgdHJ1ZSk7XG5cbiAgICBoaWdobGlnaHRzLmZvckVhY2goZnVuY3Rpb24oaGwpIHtcbiAgICAgIGlmIChzZWxmLm9wdGlvbnMub25SZW1vdmVIaWdobGlnaHQoaGwpID09PSB0cnVlKSB7XG4gICAgICAgIHJlbW92ZUhpZ2hsaWdodChobCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBoaWdobGlnaHRzIGZyb20gZ2l2ZW4gY29udGFpbmVyLlxuICAgKiBAcGFyYW0gcGFyYW1zXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtwYXJhbXMuY29udGFpbmVyXSAtIHJldHVybiBoaWdobGlnaHRzIGZyb20gdGhpcyBlbGVtZW50LiBEZWZhdWx0OiB0aGUgZWxlbWVudCB0aGVcbiAgICogaGlnaGxpZ2h0ZXIgaXMgYXBwbGllZCB0by5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcGFyYW1zLmFuZFNlbGZdIC0gaWYgc2V0IHRvIHRydWUgYW5kIGNvbnRhaW5lciBpcyBhIGhpZ2hsaWdodCBpdHNlbGYsIGFkZCBjb250YWluZXIgdG9cbiAgICogcmV0dXJuZWQgcmVzdWx0cy4gRGVmYXVsdDogdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbcGFyYW1zLmdyb3VwZWRdIC0gaWYgc2V0IHRvIHRydWUsIGhpZ2hsaWdodHMgYXJlIGdyb3VwZWQgaW4gbG9naWNhbCBncm91cHMgb2YgaGlnaGxpZ2h0cyBhZGRlZFxuICAgKiBpbiB0aGUgc2FtZSBtb21lbnQuIEVhY2ggZ3JvdXAgaXMgYW4gb2JqZWN0IHdoaWNoIGhhcyBnb3QgYXJyYXkgb2YgaGlnaGxpZ2h0cywgJ3RvU3RyaW5nJyBtZXRob2QgYW5kICd0aW1lc3RhbXAnXG4gICAqIHByb3BlcnR5LiBEZWZhdWx0OiBmYWxzZS5cbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIGhpZ2hsaWdodHMuXG4gICAqIEBtZW1iZXJvZiBQcmltaXRpdm9IaWdobGlnaHRlclxuICAgKi9cbiAgZ2V0SGlnaGxpZ2h0cyhwYXJhbXMpIHtcbiAgICBjb25zdCBtZXJnZWRQYXJhbXMgPSB7XG4gICAgICBjb250YWluZXI6IHRoaXMuZWwsXG4gICAgICBkYXRhQXR0cjogREFUQV9BVFRSLFxuICAgICAgdGltZXN0YW1wQXR0cjogVElNRVNUQU1QX0FUVFIsXG4gICAgICAuLi5wYXJhbXNcbiAgICB9O1xuICAgIHJldHVybiByZXRyaWV2ZUhpZ2hsaWdodHMobWVyZ2VkUGFyYW1zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgZWxlbWVudCBpcyBhIGhpZ2hsaWdodC5cbiAgICpcbiAgICogQHBhcmFtIGVsIC0gZWxlbWVudCB0byBjaGVjay5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBtZW1iZXJvZiBQcmltaXRpdm9IaWdobGlnaHRlclxuICAgKi9cbiAgaXNIaWdobGlnaHQoZWwsIGRhdGFBdHRyKSB7XG4gICAgcmV0dXJuIGlzRWxlbWVudEhpZ2hsaWdodChlbCwgZGF0YUF0dHIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlcmlhbGl6ZXMgYWxsIGhpZ2hsaWdodHMgaW4gdGhlIGVsZW1lbnQgdGhlIGhpZ2hsaWdodGVyIGlzIGFwcGxpZWQgdG8uXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IC0gc3RyaW5naWZpZWQgSlNPTiB3aXRoIGhpZ2hsaWdodHMgZGVmaW5pdGlvblxuICAgKiBAbWVtYmVyb2YgUHJpbWl0aXZvSGlnaGxpZ2h0ZXJcbiAgICovXG4gIHNlcmlhbGl6ZUhpZ2hsaWdodHMoKSB7XG4gICAgbGV0IGhpZ2hsaWdodHMgPSB0aGlzLmdldEhpZ2hsaWdodHMoKSxcbiAgICAgIHJlZkVsID0gdGhpcy5lbCxcbiAgICAgIGhsRGVzY3JpcHRvcnMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGdldEVsZW1lbnRQYXRoKGVsLCByZWZFbGVtZW50KSB7XG4gICAgICBsZXQgcGF0aCA9IFtdLFxuICAgICAgICBjaGlsZE5vZGVzO1xuXG4gICAgICBkbyB7XG4gICAgICAgIGNoaWxkTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlbC5wYXJlbnROb2RlLmNoaWxkTm9kZXMpO1xuICAgICAgICBwYXRoLnVuc2hpZnQoY2hpbGROb2Rlcy5pbmRleE9mKGVsKSk7XG4gICAgICAgIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICAgIH0gd2hpbGUgKGVsICE9PSByZWZFbGVtZW50IHx8ICFlbCk7XG5cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIHNvcnRCeURlcHRoKGhpZ2hsaWdodHMsIGZhbHNlKTtcblxuICAgIGhpZ2hsaWdodHMuZm9yRWFjaChmdW5jdGlvbihoaWdobGlnaHQpIHtcbiAgICAgIGxldCBvZmZzZXQgPSAwLCAvLyBIbCBvZmZzZXQgZnJvbSBwcmV2aW91cyBzaWJsaW5nIHdpdGhpbiBwYXJlbnQgbm9kZS5cbiAgICAgICAgbGVuZ3RoID0gaGlnaGxpZ2h0LnRleHRDb250ZW50Lmxlbmd0aCxcbiAgICAgICAgaGxQYXRoID0gZ2V0RWxlbWVudFBhdGgoaGlnaGxpZ2h0LCByZWZFbCksXG4gICAgICAgIHdyYXBwZXIgPSBoaWdobGlnaHQuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICB3cmFwcGVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgICB3cmFwcGVyID0gd3JhcHBlci5vdXRlckhUTUw7XG5cbiAgICAgIGlmIChcbiAgICAgICAgaGlnaGxpZ2h0LnByZXZpb3VzU2libGluZyAmJlxuICAgICAgICBoaWdobGlnaHQucHJldmlvdXNTaWJsaW5nLm5vZGVUeXBlID09PSBOT0RFX1RZUEUuVEVYVF9OT0RFXG4gICAgICApIHtcbiAgICAgICAgb2Zmc2V0ID0gaGlnaGxpZ2h0LnByZXZpb3VzU2libGluZy5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIGhsRGVzY3JpcHRvcnMucHVzaChbXG4gICAgICAgIHdyYXBwZXIsXG4gICAgICAgIGhpZ2hsaWdodC50ZXh0Q29udGVudCxcbiAgICAgICAgaGxQYXRoLmpvaW4oXCI6XCIpLFxuICAgICAgICBvZmZzZXQsXG4gICAgICAgIGxlbmd0aFxuICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoaGxEZXNjcmlwdG9ycyk7XG4gIH1cblxuICAvKipcbiAgICogRGVzZXJpYWxpemVzIGhpZ2hsaWdodHMuXG4gICAqIEB0aHJvd3MgZXhjZXB0aW9uIHdoZW4gY2FuJ3QgcGFyc2UgSlNPTiBvciBKU09OIGhhcyBpbnZhbGlkIHN0cnVjdHVyZS5cbiAgICogQHBhcmFtIHtvYmplY3R9IGpzb24gLSBKU09OIG9iamVjdCB3aXRoIGhpZ2hsaWdodHMgZGVmaW5pdGlvbi5cbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIGRlc2VyaWFsaXplZCBoaWdobGlnaHRzLlxuICAgKiBAbWVtYmVyb2YgUHJpbWl0aXZvSGlnaGxpZ2h0ZXJcbiAgICovXG4gIGRlc2VyaWFsaXplSGlnaGxpZ2h0cyhqc29uKSB7XG4gICAgbGV0IGhsRGVzY3JpcHRvcnMsXG4gICAgICBoaWdobGlnaHRzID0gW10sXG4gICAgICBzZWxmID0gdGhpcztcblxuICAgIGlmICghanNvbikge1xuICAgICAgcmV0dXJuIGhpZ2hsaWdodHM7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGhsRGVzY3JpcHRvcnMgPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IFwiQ2FuJ3QgcGFyc2UgSlNPTjogXCIgKyBlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlc2VyaWFsaXphdGlvbkZuKGhsRGVzY3JpcHRvcikge1xuICAgICAgbGV0IGhsID0ge1xuICAgICAgICAgIHdyYXBwZXI6IGhsRGVzY3JpcHRvclswXSxcbiAgICAgICAgICB0ZXh0OiBobERlc2NyaXB0b3JbMV0sXG4gICAgICAgICAgcGF0aDogaGxEZXNjcmlwdG9yWzJdLnNwbGl0KFwiOlwiKSxcbiAgICAgICAgICBvZmZzZXQ6IGhsRGVzY3JpcHRvclszXSxcbiAgICAgICAgICBsZW5ndGg6IGhsRGVzY3JpcHRvcls0XVxuICAgICAgICB9LFxuICAgICAgICBlbEluZGV4ID0gaGwucGF0aC5wb3AoKSxcbiAgICAgICAgbm9kZSA9IHNlbGYuZWwsXG4gICAgICAgIGhsTm9kZSxcbiAgICAgICAgaGlnaGxpZ2h0LFxuICAgICAgICBpZHg7XG5cbiAgICAgIHdoaWxlICgoaWR4ID0gaGwucGF0aC5zaGlmdCgpKSkge1xuICAgICAgICBub2RlID0gbm9kZS5jaGlsZE5vZGVzW2lkeF07XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgbm9kZS5jaGlsZE5vZGVzW2VsSW5kZXggLSAxXSAmJlxuICAgICAgICBub2RlLmNoaWxkTm9kZXNbZWxJbmRleCAtIDFdLm5vZGVUeXBlID09PSBOT0RFX1RZUEUuVEVYVF9OT0RFXG4gICAgICApIHtcbiAgICAgICAgZWxJbmRleCAtPSAxO1xuICAgICAgfVxuXG4gICAgICBub2RlID0gbm9kZS5jaGlsZE5vZGVzW2VsSW5kZXhdO1xuICAgICAgaGxOb2RlID0gbm9kZS5zcGxpdFRleHQoaGwub2Zmc2V0KTtcbiAgICAgIGhsTm9kZS5zcGxpdFRleHQoaGwubGVuZ3RoKTtcblxuICAgICAgaWYgKGhsTm9kZS5uZXh0U2libGluZyAmJiAhaGxOb2RlLm5leHRTaWJsaW5nLm5vZGVWYWx1ZSkge1xuICAgICAgICBkb20oaGxOb2RlLm5leHRTaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGhsTm9kZS5wcmV2aW91c1NpYmxpbmcgJiYgIWhsTm9kZS5wcmV2aW91c1NpYmxpbmcubm9kZVZhbHVlKSB7XG4gICAgICAgIGRvbShobE5vZGUucHJldmlvdXNTaWJsaW5nKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgaGlnaGxpZ2h0ID0gZG9tKGhsTm9kZSkud3JhcChkb20oKS5mcm9tSFRNTChobC53cmFwcGVyKVswXSk7XG4gICAgICBoaWdobGlnaHRzLnB1c2goaGlnaGxpZ2h0KTtcbiAgICB9XG5cbiAgICBobERlc2NyaXB0b3JzLmZvckVhY2goZnVuY3Rpb24oaGxEZXNjcmlwdG9yKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZXNlcmlhbGl6YXRpb25GbihobERlc2NyaXB0b3IpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoY29uc29sZSAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJDYW4ndCBkZXNlcmlhbGl6ZSBoaWdobGlnaHQgZGVzY3JpcHRvci4gQ2F1c2U6IFwiICsgZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBoaWdobGlnaHRzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByaW1pdGl2b0hpZ2hsaWdodGVyO1xuIiwiLyogZ2xvYmFsIGpRdWVyeSBUZXh0SGlnaGxpZ2h0ZXIgKi9cblxuaWYgKHR5cGVvZiBqUXVlcnkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgKGZ1bmN0aW9uKCQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IFBMVUdJTl9OQU1FID0gXCJ0ZXh0SGlnaGxpZ2h0ZXJcIjtcblxuICAgIGZ1bmN0aW9uIHdyYXAoZm4sIHdyYXBwZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgd3JhcHBlci5jYWxsKHRoaXMsIGZuKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGpRdWVyeSBwbHVnaW4gbmFtZXNwYWNlLlxuICAgICAqIEBleHRlcm5hbCBcImpRdWVyeS5mblwiXG4gICAgICogQHNlZSB7QGxpbmsgaHR0cDovL2RvY3MuanF1ZXJ5LmNvbS9QbHVnaW5zL0F1dGhvcmluZyBUaGUgalF1ZXJ5IFBsdWdpbiBHdWlkZX1cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgVGV4dEhpZ2hsaWdodGVyIGluc3RhbmNlIGFuZCBhcHBsaWVzIGl0IHRvIHRoZSBnaXZlbiBqUXVlcnkgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIFNhbWUgYXMge0BsaW5rIFRleHRIaWdobGlnaHRlcn0gb3B0aW9ucy5cbiAgICAgKiBAcmV0dXJucyB7alF1ZXJ5fVxuICAgICAqIEBleGFtcGxlICQoJyNzYW5kYm94JykudGV4dEhpZ2hsaWdodGVyKHsgY29sb3I6ICdyZWQnIH0pO1xuICAgICAqIEBmdW5jdGlvbiBleHRlcm5hbDpcImpRdWVyeS5mblwiLnRleHRIaWdobGlnaHRlclxuICAgICAqL1xuICAgICQuZm4udGV4dEhpZ2hsaWdodGVyID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGVsID0gdGhpcyxcbiAgICAgICAgICBobDtcblxuICAgICAgICBpZiAoISQuZGF0YShlbCwgUExVR0lOX05BTUUpKSB7XG4gICAgICAgICAgaGwgPSBuZXcgVGV4dEhpZ2hsaWdodGVyKGVsLCBvcHRpb25zKTtcblxuICAgICAgICAgIGhsLmRlc3Ryb3kgPSB3cmFwKGhsLmRlc3Ryb3ksIGZ1bmN0aW9uKGRlc3Ryb3kpIHtcbiAgICAgICAgICAgIGRlc3Ryb3kuY2FsbChobCk7XG4gICAgICAgICAgICAkKGVsKS5yZW1vdmVEYXRhKFBMVUdJTl9OQU1FKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgICQuZGF0YShlbCwgUExVR0lOX05BTUUsIGhsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgICQuZm4uZ2V0SGlnaGxpZ2h0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEoUExVR0lOX05BTUUpO1xuICAgIH07XG4gIH0pKGpRdWVyeSk7XG59XG4iLCJpbXBvcnQgZG9tIGZyb20gXCIuL3V0aWxzL2RvbVwiO1xuaW1wb3J0IHsgYmluZEV2ZW50cywgdW5iaW5kRXZlbnRzIH0gZnJvbSBcIi4vdXRpbHMvZXZlbnRzXCI7XG5pbXBvcnQgUHJpbWl0aXZvIGZyb20gXCIuL2hpZ2hsaWdodGVycy9wcmltaXRpdm9cIjtcbmltcG9ydCBJbmRlcGVuZGVuY2lhIGZyb20gXCIuL2hpZ2hsaWdodGVycy9pbmRlcGVuZGVuY2lhXCI7XG5pbXBvcnQgeyBUSU1FU1RBTVBfQVRUUiwgREFUQV9BVFRSIH0gZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgeyBjcmVhdGVXcmFwcGVyIH0gZnJvbSBcIi4vdXRpbHMvaGlnaGxpZ2h0c1wiO1xuXG5jb25zdCBoaWdobGlnaHRlcnMgPSB7XG4gIHByaW1pdGl2bzogUHJpbWl0aXZvLFxuICBcInYxLTIwMTRcIjogUHJpbWl0aXZvLFxuICBpbmRlcGVuZGVuY2lhOiBJbmRlcGVuZGVuY2lhLFxuICBcInYyLTIwMTlcIjogSW5kZXBlbmRlbmNpYVxufTtcblxuLyoqXG4gKiBUZXh0SGlnaGxpZ2h0ZXIgdGhhdCBwcm92aWRlcyB0ZXh0IGhpZ2hsaWdodGluZyBmdW5jdGlvbmFsaXR5IHRvIGRvbSBlbGVtZW50cy5cbiAqL1xuY2xhc3MgVGV4dEhpZ2hsaWdodGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgd3JhcHBlciBmb3IgaGlnaGxpZ2h0cy5cbiAgICogVGV4dEhpZ2hsaWdodGVyIGluc3RhbmNlIGNhbGxzIHRoaXMgbWV0aG9kIGVhY2ggdGltZSBpdCBuZWVkcyB0byBjcmVhdGUgaGlnaGxpZ2h0cyBhbmQgcGFzcyBvcHRpb25zIHJldHJpZXZlZFxuICAgKiBpbiBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgLSB0aGUgc2FtZSBvYmplY3QgYXMgaW4gVGV4dEhpZ2hsaWdodGVyIGNvbnN0cnVjdG9yLlxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlV3JhcHBlcihvcHRpb25zKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIob3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBUZXh0SGlnaGxpZ2h0ZXIgaW5zdGFuY2UgYW5kIGJpbmRzIHRvIGdpdmVuIERPTSBlbGVtZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCAtIERPTSBlbGVtZW50IHRvIHdoaWNoIGhpZ2hsaWdodGVkIHdpbGwgYmUgYXBwbGllZC5cbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIGFkZGl0aW9uYWwgb3B0aW9ucy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMudmVyc2lvbiAtIFRoZSB2ZXJzaW9uIG9mIHRoZSB0ZXh0IGhpZ2hsaWdodGluZyBmdW5jdGlvbmFsaXR5IHRvIHVzZS5cbiAgICogVGhlcmUgYXJlIHR3byBvcHRpb25zOlxuICAgKiAgIHByaW1pdGl2byAodjEtMjAxNCkgaXMgZm9yIHRoZSBpbml0aWFsIGltcGxlbWVudGF0aW9uIHVzaW5nIGludGVyZGVwZW5kZW50IGhpZ2hsaWdodCBsb2NhdG9ycy5cbiAgICogICAoTG90cyBvZiBpc3N1ZXMgZm9yIHJlcXVpcmVtZW50cyBiZXlvbmQgc2ltcGxlIGFsbCBvciBub3RoaW5nIGhpZ2hsaWdodHMpXG4gICAqXG4gICAqICAgaW5kZXBlbmRlbmNpYSAodjItMjAxOSkgaXMgZm9yIGFuIGltcHJvdmVkIGltcGxlbWVudGF0aW9uIGZvY3VzaW5nIG9uIG1ha2luZyBoaWdobGlnaHRzIGluZGVwZW5kZW50XG4gICAqICAgZnJvbSBlYWNob3RoZXIgYW5kIG90aGVyIGVsZW1lbnQgbm9kZXMgd2l0aGluIHRoZSBjb250ZXh0IERPTSBvYmplY3QuIHYyIHVzZXMgZGF0YSBhdHRyaWJ1dGVzXG4gICAqICAgYXMgdGhlIHNvdXJjZSBvZiB0cnV0aCBhYm91dCB0aGUgdGV4dCByYW5nZSBzZWxlY3RlZCB0byBjcmVhdGUgdGhlIG9yaWdpbmFsIGhpZ2hsaWdodC5cbiAgICogICBUaGlzIGFsbG93cyB1cyBmcmVlZG9tIHRvIG1hbmlwdWxhdGUgdGhlIERPTSBhdCB3aWxsIGFuZCBoYW5kbGUgb3ZlcmxhcHBpbmcgaGlnaGxpZ2h0cyBhIGxvdCBiZXR0ZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbG9yIC0gaGlnaGxpZ2h0IGNvbG9yLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5oaWdobGlnaHRlZENsYXNzIC0gY2xhc3MgYWRkZWQgdG8gaGlnaGxpZ2h0LCAnaGlnaGxpZ2h0ZWQnIGJ5IGRlZmF1bHQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmNvbnRleHRDbGFzcyAtIGNsYXNzIGFkZGVkIHRvIGVsZW1lbnQgdG8gd2hpY2ggaGlnaGxpZ2h0ZXIgaXMgYXBwbGllZCxcbiAgICogICdoaWdobGlnaHRlci1jb250ZXh0JyBieSBkZWZhdWx0LlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLm9uUmVtb3ZlSGlnaGxpZ2h0IC0gZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBoaWdobGlnaHQgaXMgcmVtb3ZlZC4gSGlnaGxpZ2h0IGlzXG4gICAqICBwYXNzZWQgYXMgcGFyYW0uIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSBpZiBoaWdobGlnaHQgc2hvdWxkIGJlIHJlbW92ZWQsIG9yIGZhbHNlIC0gdG8gcHJldmVudCByZW1vdmFsLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLm9uQmVmb3JlSGlnaGxpZ2h0IC0gZnVuY3Rpb24gY2FsbGVkIGJlZm9yZSBoaWdobGlnaHQgaXMgY3JlYXRlZC4gUmFuZ2Ugb2JqZWN0IGlzXG4gICAqICBwYXNzZWQgYXMgcGFyYW0uIEZ1bmN0aW9uIHNob3VsZCByZXR1cm4gdHJ1ZSB0byBjb250aW51ZSBwcm9jZXNzaW5nLCBvciBmYWxzZSAtIHRvIHByZXZlbnQgaGlnaGxpZ2h0aW5nLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRpb25zLm9uQWZ0ZXJIaWdobGlnaHQgLSBmdW5jdGlvbiBjYWxsZWQgYWZ0ZXIgaGlnaGxpZ2h0IGlzIGNyZWF0ZWQuIEFycmF5IG9mIGNyZWF0ZWRcbiAgICogd3JhcHBlcnMgaXMgcGFzc2VkIGFzIHBhcmFtLlxuICAgKiBAY2xhc3MgVGV4dEhpZ2hsaWdodGVyXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGFuY2hvciBlbGVtZW50XCIpO1xuICAgIH1cblxuICAgIHRoaXMuZWwgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIGNvbG9yOiBcIiNmZmZmN2JcIixcbiAgICAgIGhpZ2hsaWdodGVkQ2xhc3M6IFwiaGlnaGxpZ2h0ZWRcIixcbiAgICAgIGNvbnRleHRDbGFzczogXCJoaWdobGlnaHRlci1jb250ZXh0XCIsXG4gICAgICB2ZXJzaW9uOiBcImluZGVwZW5kZW5jaWFcIixcbiAgICAgIG9uUmVtb3ZlSGlnaGxpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgb25CZWZvcmVIaWdobGlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgICBvbkFmdGVySGlnaGxpZ2h0OiBmdW5jdGlvbigpIHt9LFxuICAgICAgLi4ub3B0aW9uc1xuICAgIH07XG5cbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIFwiXFxuXFxuXFxuXFxuQUxTREVidWcyNDogVGV4dEhpZ2hsaWdodGVyOiBvcHRpb25zIGNvbnN0cnVjdG9yIHBhcmFtOiBcIixcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKFwiQUxTREVidWcyNDogVGV4dEhpZ2hsaWdodGVyOiB0aGlzLm9wdGlvbnM6IFwiLCB0aGlzLm9wdGlvbnMpO1xuXG4gICAgaWYgKCFoaWdobGlnaHRlcnNbdGhpcy5vcHRpb25zLnZlcnNpb25dKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwiUGxlYXNlIHByb3ZpZGUgYSB2YWxpZCB2ZXJzaW9uIG9mIHRoZSB0ZXh0IGhpZ2hsaWdodGluZyBmdW5jdGlvbmFsaXR5XCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdGhpcy5oaWdobGlnaHRlciA9IG5ldyBoaWdobGlnaHRlcnNbdGhpcy5vcHRpb25zLnZlcnNpb25dKFxuICAgICAgdGhpcy5lbCxcbiAgICAgIHRoaXMub3B0aW9uc1xuICAgICk7XG5cbiAgICBkb20odGhpcy5lbCkuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmNvbnRleHRDbGFzcyk7XG4gICAgYmluZEV2ZW50cyh0aGlzLmVsLCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJtYW5lbnRseSBkaXNhYmxlcyBoaWdobGlnaHRpbmcuXG4gICAqIFVuYmluZHMgZXZlbnRzIGFuZCByZW1vdmUgY29udGV4dCBlbGVtZW50IGNsYXNzLlxuICAgKiBAbWVtYmVyb2YgVGV4dEhpZ2hsaWdodGVyXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHVuYmluZEV2ZW50cyh0aGlzLmVsLCB0aGlzKTtcbiAgICBkb20odGhpcy5lbCkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNvbnRleHRDbGFzcyk7XG4gIH1cblxuICBoaWdobGlnaHRIYW5kbGVyKCkge1xuICAgIHRoaXMuZG9IaWdobGlnaHQoKTtcbiAgfVxuXG4gIGRvSGlnaGxpZ2h0KGtlZXBSYW5nZSkge1xuICAgIHRoaXMuaGlnaGxpZ2h0ZXIuZG9IaWdobGlnaHQoa2VlcFJhbmdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWdobGlnaHRzIHJhbmdlLlxuICAgKiBXcmFwcyB0ZXh0IG9mIGdpdmVuIHJhbmdlIG9iamVjdCBpbiB3cmFwcGVyIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHdyYXBwZXJcbiAgICogQHJldHVybnMge0FycmF5fSAtIGFycmF5IG9mIGNyZWF0ZWQgaGlnaGxpZ2h0cy5cbiAgICogQG1lbWJlcm9mIFRleHRIaWdobGlnaHRlclxuICAgKi9cbiAgaGlnaGxpZ2h0UmFuZ2UocmFuZ2UsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdobGlnaHRlci5oaWdobGlnaHRSYW5nZShyYW5nZSwgd3JhcHBlcik7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBoaWdobGlnaHRzLiBFbnN1cmUgYXQgbGVhc3QgdGV4dCBub2RlcyBhcmUgbm9ybWFsaXplZCwgY2FycmllcyBvdXQgc29tZSBmbGF0dGVuaW5nIGFuZCBuZXN0aW5nXG4gICAqIHdoZXJlIG5lY2Vzc2FyeS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gaGlnaGxpZ2h0cyAtIGhpZ2hsaWdodHMgdG8gbm9ybWFsaXplLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IC0gYXJyYXkgb2Ygbm9ybWFsaXplZCBoaWdobGlnaHRzLiBPcmRlciBhbmQgbnVtYmVyIG9mIHJldHVybmVkIGhpZ2hsaWdodHMgbWF5IGJlIGRpZmZlcmVudCB0aGFuXG4gICAqIGlucHV0IGhpZ2hsaWdodHMuXG4gICAqIEBtZW1iZXJvZiBUZXh0SGlnaGxpZ2h0ZXJcbiAgICovXG4gIG5vcm1hbGl6ZUhpZ2hsaWdodHMoaGlnaGxpZ2h0cykge1xuICAgIHJldHVybiB0aGlzLmhpZ2hsaWdodGVyLm5vcm1hbGl6ZUhpZ2hsaWdodHMoaGlnaGxpZ2h0cyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBoaWdobGlnaHRpbmcgY29sb3IuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb2xvciAtIHZhbGlkIENTUyBjb2xvci5cbiAgICogQG1lbWJlcm9mIFRleHRIaWdobGlnaHRlclxuICAgKi9cbiAgc2V0Q29sb3IoY29sb3IpIHtcbiAgICB0aGlzLm9wdGlvbnMuY29sb3IgPSBjb2xvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGhpZ2hsaWdodGluZyBjb2xvci5cbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICogQG1lbWJlcm9mIFRleHRIaWdobGlnaHRlclxuICAgKi9cbiAgZ2V0Q29sb3IoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb2xvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGhpZ2hsaWdodHMgZnJvbSBlbGVtZW50LiBJZiBlbGVtZW50IGlzIGEgaGlnaGxpZ2h0IGl0c2VsZiwgaXQgaXMgcmVtb3ZlZCBhcyB3ZWxsLlxuICAgKiBJZiBubyBlbGVtZW50IGlzIGdpdmVuLCBhbGwgaGlnaGxpZ2h0cyBhbGwgcmVtb3ZlZC5cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW2VsZW1lbnRdIC0gZWxlbWVudCB0byByZW1vdmUgaGlnaGxpZ2h0cyBmcm9tXG4gICAqIEBtZW1iZXJvZiBUZXh0SGlnaGxpZ2h0ZXJcbiAgICovXG4gIHJlbW92ZUhpZ2hsaWdodHMoZWxlbWVudCkge1xuICAgIHRoaXMuaGlnaGxpZ2h0ZXIucmVtb3ZlSGlnaGxpZ2h0cyhlbGVtZW50KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGhpZ2hsaWdodHMgZnJvbSBnaXZlbiBjb250YWluZXIuXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW3BhcmFtcy5jb250YWluZXJdIC0gcmV0dXJuIGhpZ2hsaWdodHMgZnJvbSB0aGlzIGVsZW1lbnQuIERlZmF1bHQ6IHRoZSBlbGVtZW50IHRoZVxuICAgKiBoaWdobGlnaHRlciBpcyBhcHBsaWVkIHRvLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtwYXJhbXMuYW5kU2VsZl0gLSBpZiBzZXQgdG8gdHJ1ZSBhbmQgY29udGFpbmVyIGlzIGEgaGlnaGxpZ2h0IGl0c2VsZiwgYWRkIGNvbnRhaW5lciB0b1xuICAgKiByZXR1cm5lZCByZXN1bHRzLiBEZWZhdWx0OiB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtwYXJhbXMuZ3JvdXBlZF0gLSBpZiBzZXQgdG8gdHJ1ZSwgaGlnaGxpZ2h0cyBhcmUgZ3JvdXBlZCBpbiBsb2dpY2FsIGdyb3VwcyBvZiBoaWdobGlnaHRzIGFkZGVkXG4gICAqIGluIHRoZSBzYW1lIG1vbWVudC4gRWFjaCBncm91cCBpcyBhbiBvYmplY3Qgd2hpY2ggaGFzIGdvdCBhcnJheSBvZiBoaWdobGlnaHRzLCAndG9TdHJpbmcnIG1ldGhvZCBhbmQgJ3RpbWVzdGFtcCdcbiAgICogcHJvcGVydHkuIERlZmF1bHQ6IGZhbHNlLlxuICAgKiBAcmV0dXJucyB7QXJyYXl9IC0gYXJyYXkgb2YgaGlnaGxpZ2h0cy5cbiAgICogQG1lbWJlcm9mIFRleHRIaWdobGlnaHRlclxuICAgKi9cbiAgZ2V0SGlnaGxpZ2h0cyhwYXJhbXMpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdobGlnaHRlci5nZXRIaWdobGlnaHRzKHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIGVsZW1lbnQgaXMgYSBoaWdobGlnaHQuXG4gICAqIEFsbCBoaWdobGlnaHRzIGhhdmUgJ2RhdGEtaGlnaGxpZ2h0ZWQnIGF0dHJpYnV0ZS5cbiAgICogQHBhcmFtIGVsIC0gZWxlbWVudCB0byBjaGVjay5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBtZW1iZXJvZiBUZXh0SGlnaGxpZ2h0ZXJcbiAgICovXG4gIGlzSGlnaGxpZ2h0KGVsKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaGxpZ2h0ZXIuaXNIaWdobGlnaHQoZWwsIERBVEFfQVRUUik7XG4gIH1cblxuICAvKipcbiAgICogU2VyaWFsaXplcyBhbGwgaGlnaGxpZ2h0cyBpbiB0aGUgZWxlbWVudCB0aGUgaGlnaGxpZ2h0ZXIgaXMgYXBwbGllZCB0by5cbiAgICogdGhlIGlkIGlzIG5vdCB1c2VkIGluIHRoZSBpbml0aWFsIHZlcnNpb24gb2YgdGhlIGhpZ2hsaWdodGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBUaGUgdW5pcXVlIGlkZW50aWZpZXIgZ3JvdXBpbmcgYSBzZXQgb2YgaGlnaGxpZ2h0IGVsZW1lbnRzIHRvZ2V0aGVyLlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHN0cmluZ2lmaWVkIEpTT04gd2l0aCBoaWdobGlnaHRzIGRlZmluaXRpb25cbiAgICogQG1lbWJlcm9mIFRleHRIaWdobGlnaHRlclxuICAgKi9cbiAgc2VyaWFsaXplSGlnaGxpZ2h0cyhpZCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2hsaWdodGVyLnNlcmlhbGl6ZUhpZ2hsaWdodHMoaWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc2VyaWFsaXplcyBoaWdobGlnaHRzLlxuICAgKiBAdGhyb3dzIGV4Y2VwdGlvbiB3aGVuIGNhbid0IHBhcnNlIEpTT04gb3IgSlNPTiBoYXMgaW52YWxpZCBzdHJ1Y3R1cmUuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBqc29uIC0gSlNPTiBvYmplY3Qgd2l0aCBoaWdobGlnaHRzIGRlZmluaXRpb24uXG4gICAqIEByZXR1cm5zIHtBcnJheX0gLSBhcnJheSBvZiBkZXNlcmlhbGl6ZWQgaGlnaGxpZ2h0cy5cbiAgICogQG1lbWJlcm9mIFRleHRIaWdobGlnaHRlclxuICAgKi9cbiAgZGVzZXJpYWxpemVIaWdobGlnaHRzKGpzb24pIHtcbiAgICByZXR1cm4gdGhpcy5oaWdobGlnaHRlci5kZXNlcmlhbGl6ZUhpZ2hsaWdodHMoanNvbik7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgYW5kIGhpZ2hsaWdodHMgZ2l2ZW4gdGV4dC5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSB0ZXh0IHRvIHNlYXJjaCBmb3JcbiAgICogQHBhcmFtIHtib29sZWFufSBbY2FzZVNlbnNpdGl2ZV0gLSBpZiBzZXQgdG8gdHJ1ZSwgcGVyZm9ybXMgY2FzZSBzZW5zaXRpdmUgc2VhcmNoIChkZWZhdWx0OiB0cnVlKVxuICAgKiBAbWVtYmVyb2YgVGV4dEhpZ2hsaWdodGVyXG4gICAqL1xuICBmaW5kKHRleHQsIGNhc2VTZW5zaXRpdmUpIHtcbiAgICBsZXQgd25kID0gZG9tKHRoaXMuZWwpLmdldFdpbmRvdygpLFxuICAgICAgc2Nyb2xsWCA9IHduZC5zY3JvbGxYLFxuICAgICAgc2Nyb2xsWSA9IHduZC5zY3JvbGxZLFxuICAgICAgY2FzZVNlbnMgPSB0eXBlb2YgY2FzZVNlbnNpdGl2ZSA9PT0gXCJ1bmRlZmluZWRcIiA/IHRydWUgOiBjYXNlU2Vuc2l0aXZlO1xuXG4gICAgZG9tKHRoaXMuZWwpLnJlbW92ZUFsbFJhbmdlcygpO1xuXG4gICAgaWYgKHduZC5maW5kKSB7XG4gICAgICB3aGlsZSAod25kLmZpbmQodGV4dCwgY2FzZVNlbnMpKSB7XG4gICAgICAgIHRoaXMuZG9IaWdobGlnaHQodHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh3bmQuZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UpIHtcbiAgICAgIGxldCB0ZXh0UmFuZ2UgPSB3bmQuZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgIHRleHRSYW5nZS5tb3ZlVG9FbGVtZW50VGV4dCh0aGlzLmVsKTtcbiAgICAgIHdoaWxlICh0ZXh0UmFuZ2UuZmluZFRleHQodGV4dCwgMSwgY2FzZVNlbnMgPyA0IDogMCkpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICFkb20odGhpcy5lbCkuY29udGFpbnModGV4dFJhbmdlLnBhcmVudEVsZW1lbnQoKSkgJiZcbiAgICAgICAgICB0ZXh0UmFuZ2UucGFyZW50RWxlbWVudCgpICE9PSB0aGlzLmVsXG4gICAgICAgICkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dFJhbmdlLnNlbGVjdCgpO1xuICAgICAgICB0aGlzLmRvSGlnaGxpZ2h0KHRydWUpO1xuICAgICAgICB0ZXh0UmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRvbSh0aGlzLmVsKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICB3bmQuc2Nyb2xsVG8oc2Nyb2xsWCwgc2Nyb2xsWSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV4dEhpZ2hsaWdodGVyO1xuIiwiLyoqXG4gKiBSZXR1cm5zIGFycmF5IHdpdGhvdXQgZHVwbGljYXRlZCB2YWx1ZXMuXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaXF1ZShhcnIpIHtcbiAgcmV0dXJuIGFyci5maWx0ZXIoZnVuY3Rpb24odmFsdWUsIGlkeCwgc2VsZikge1xuICAgIHJldHVybiBzZWxmLmluZGV4T2YodmFsdWUpID09PSBpZHg7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGNvbnN0IE5PREVfVFlQRSA9IHsgRUxFTUVOVF9OT0RFOiAxLCBURVhUX05PREU6IDMgfTtcblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9ucyB0byBtYWtlIERPTSBtYW5pcHVsYXRpb24gZWFzaWVyLlxuICogQHBhcmFtIHtOb2RlfEhUTUxFbGVtZW50fSBbZWxdIC0gYmFzZSBET00gZWxlbWVudCB0byBtYW5pcHVsYXRlXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5jb25zdCBkb20gPSBmdW5jdGlvbihlbCkge1xuICByZXR1cm4gLyoqIEBsZW5kcyBkb20gKiovIHtcbiAgICAvKipcbiAgICAgKiBBZGRzIGNsYXNzIHRvIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNsYXNzTmFtZVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICAgIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWwuY2xhc3NOYW1lICs9IFwiIFwiICsgY2xhc3NOYW1lO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGNsYXNzIGZyb20gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2xhc3NOYW1lXG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgaWYgKGVsLmNsYXNzTGlzdCkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5jbGFzc05hbWUgPSBlbC5jbGFzc05hbWUucmVwbGFjZShcbiAgICAgICAgICBuZXcgUmVnRXhwKFwiKF58XFxcXGIpXCIgKyBjbGFzc05hbWUgKyBcIihcXFxcYnwkKVwiLCBcImdpXCIpLFxuICAgICAgICAgIFwiIFwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByZXBlbmRzIGNoaWxkIG5vZGVzIHRvIGJhc2UgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge05vZGVbXX0gbm9kZXNUb1ByZXBlbmRcbiAgICAgKi9cbiAgICBwcmVwZW5kOiBmdW5jdGlvbihub2Rlc1RvUHJlcGVuZCkge1xuICAgICAgbGV0IG5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwobm9kZXNUb1ByZXBlbmQpLFxuICAgICAgICBpID0gbm9kZXMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGVsLmluc2VydEJlZm9yZShub2Rlc1tpXSwgZWwuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgY2hpbGQgbm9kZXMgdG8gYmFzZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7Tm9kZVtdfSBub2Rlc1RvQXBwZW5kXG4gICAgICovXG4gICAgYXBwZW5kOiBmdW5jdGlvbihub2Rlc1RvQXBwZW5kKSB7XG4gICAgICBsZXQgbm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChub2Rlc1RvQXBwZW5kKTtcblxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG5vZGVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIGVsLmFwcGVuZENoaWxkKG5vZGVzW2ldKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBiYXNlIGVsZW1lbnQgYWZ0ZXIgcmVmRWwuXG4gICAgICogQHBhcmFtIHtOb2RlfSByZWZFbCAtIG5vZGUgYWZ0ZXIgd2hpY2ggYmFzZSBlbGVtZW50IHdpbGwgYmUgaW5zZXJ0ZWRcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX0gLSBpbnNlcnRlZCBlbGVtZW50XG4gICAgICovXG4gICAgaW5zZXJ0QWZ0ZXI6IGZ1bmN0aW9uKHJlZkVsKSB7XG4gICAgICByZXR1cm4gcmVmRWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHJlZkVsLm5leHRTaWJsaW5nKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBiYXNlIGVsZW1lbnQgYmVmb3JlIHJlZkVsLlxuICAgICAqIEBwYXJhbSB7Tm9kZX0gcmVmRWwgLSBub2RlIGJlZm9yZSB3aGljaCBiYXNlIGVsZW1lbnQgd2lsbCBiZSBpbnNlcnRlZFxuICAgICAqIEByZXR1cm5zIHtOb2RlfSAtIGluc2VydGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKHJlZkVsKSB7XG4gICAgICByZXR1cm4gcmVmRWwucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHJlZkVsKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBiYXNlIGVsZW1lbnQgZnJvbSBET00uXG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xuICAgICAgZWwgPSBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgYmFzZSBlbGVtZW50IGNvbnRhaW5zIGdpdmVuIGNoaWxkLlxuICAgICAqIEBwYXJhbSB7Tm9kZXxIVE1MRWxlbWVudH0gY2hpbGRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBjb250YWluczogZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIHJldHVybiBlbCAhPT0gY2hpbGQgJiYgZWwuY29udGFpbnMoY2hpbGQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcyBiYXNlIGVsZW1lbnQgaW4gd3JhcHBlciBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHdyYXBwZXJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IHdyYXBwZXIgZWxlbWVudFxuICAgICAqL1xuICAgIHdyYXA6IGZ1bmN0aW9uKHdyYXBwZXIpIHtcbiAgICAgIGlmIChlbC5wYXJlbnROb2RlKSB7XG4gICAgICAgIGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHdyYXBwZXIsIGVsKTtcbiAgICAgIH1cblxuICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChlbCk7XG4gICAgICByZXR1cm4gd3JhcHBlcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW53cmFwcyBiYXNlIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge05vZGVbXX0gLSBjaGlsZCBub2RlcyBvZiB1bndyYXBwZWQgZWxlbWVudC5cbiAgICAgKi9cbiAgICB1bndyYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IG5vZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWwuY2hpbGROb2RlcyksXG4gICAgICAgIHdyYXBwZXI7XG5cbiAgICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB3cmFwcGVyID0gbm9kZS5wYXJlbnROb2RlO1xuICAgICAgICBkb20obm9kZSkuaW5zZXJ0QmVmb3JlKG5vZGUucGFyZW50Tm9kZSk7XG4gICAgICB9KTtcbiAgICAgIGRvbSh3cmFwcGVyKS5yZW1vdmUoKTtcblxuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFycmF5IG9mIGJhc2UgZWxlbWVudCBwYXJlbnRzLlxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFtdfVxuICAgICAqL1xuICAgIHBhcmVudHM6IGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IHBhcmVudCxcbiAgICAgICAgcGF0aCA9IFtdO1xuXG4gICAgICB3aGlsZSAoKHBhcmVudCA9IGVsLnBhcmVudE5vZGUpKSB7XG4gICAgICAgIHBhdGgucHVzaChwYXJlbnQpO1xuICAgICAgICBlbCA9IHBhcmVudDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYXJyYXkgb2YgYmFzZSBlbGVtZW50IHBhcmVudHMsIGV4Y2x1ZGluZyB0aGUgZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50W119XG4gICAgICovXG4gICAgcGFyZW50c1dpdGhvdXREb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXJlbnRzKCkuZmlsdGVyKGVsZW0gPT4gZWxlbSAhPT0gZG9jdW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBOb3JtYWxpemVzIHRleHQgbm9kZXMgd2l0aGluIGJhc2UgZWxlbWVudCwgaWUuIG1lcmdlcyBzaWJsaW5nIHRleHQgbm9kZXMgYW5kIGFzc3VyZXMgdGhhdCBldmVyeVxuICAgICAqIGVsZW1lbnQgbm9kZSBoYXMgb25seSBvbmUgdGV4dCBub2RlLlxuICAgICAqIEl0IHNob3VsZCBkb2VzIHRoZSBzYW1lIGFzIHN0YW5kYXJkIGVsZW1lbnQubm9ybWFsaXplLCBidXQgSUUgaW1wbGVtZW50cyBpdCBpbmNvcnJlY3RseS5cbiAgICAgKi9cbiAgICBub3JtYWxpemVUZXh0Tm9kZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFlbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChlbC5ub2RlVHlwZSA9PT0gTk9ERV9UWVBFLlRFWFRfTk9ERSkge1xuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgZWwubmV4dFNpYmxpbmcgJiZcbiAgICAgICAgICBlbC5uZXh0U2libGluZy5ub2RlVHlwZSA9PT0gTk9ERV9UWVBFLlRFWFRfTk9ERVxuICAgICAgICApIHtcbiAgICAgICAgICBlbC5ub2RlVmFsdWUgKz0gZWwubmV4dFNpYmxpbmcubm9kZVZhbHVlO1xuICAgICAgICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwubmV4dFNpYmxpbmcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb20oZWwuZmlyc3RDaGlsZCkubm9ybWFsaXplVGV4dE5vZGVzKCk7XG4gICAgICB9XG4gICAgICBkb20oZWwubmV4dFNpYmxpbmcpLm5vcm1hbGl6ZVRleHROb2RlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGVsZW1lbnQgYmFja2dyb3VuZCBjb2xvci5cbiAgICAgKiBAcmV0dXJucyB7Q1NTU3R5bGVEZWNsYXJhdGlvbi5iYWNrZ3JvdW5kQ29sb3J9XG4gICAgICovXG4gICAgY29sb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGVsLnN0eWxlLmJhY2tncm91bmRDb2xvcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBkb20gZWxlbWVudCBmcm9tIGdpdmVuIGh0bWwgc3RyaW5nLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gICAgICogQHJldHVybnMge05vZGVMaXN0fVxuICAgICAqL1xuICAgIGZyb21IVE1MOiBmdW5jdGlvbihodG1sKSB7XG4gICAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgcmV0dXJuIGRpdi5jaGlsZE5vZGVzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGZpcnN0IHJhbmdlIG9mIHRoZSB3aW5kb3cgb2YgYmFzZSBlbGVtZW50LlxuICAgICAqIEByZXR1cm5zIHtSYW5nZX1cbiAgICAgKi9cbiAgICBnZXRSYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgc2VsZWN0aW9uID0gZG9tKGVsKS5nZXRTZWxlY3Rpb24oKSxcbiAgICAgICAgcmFuZ2U7XG5cbiAgICAgIGlmIChzZWxlY3Rpb24ucmFuZ2VDb3VudCA+IDApIHtcbiAgICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdCgwKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCByYW5nZXMgb2YgdGhlIHdpbmRvdyBvZiBiYXNlIGVsZW1lbnQuXG4gICAgICovXG4gICAgcmVtb3ZlQWxsUmFuZ2VzOiBmdW5jdGlvbigpIHtcbiAgICAgIGxldCBzZWxlY3Rpb24gPSBkb20oZWwpLmdldFNlbGVjdGlvbigpO1xuICAgICAgc2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHNlbGVjdGlvbiBvYmplY3Qgb2YgdGhlIHdpbmRvdyBvZiBiYXNlIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge1NlbGVjdGlvbn1cbiAgICAgKi9cbiAgICBnZXRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRvbShlbClcbiAgICAgICAgLmdldFdpbmRvdygpXG4gICAgICAgIC5nZXRTZWxlY3Rpb24oKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aW5kb3cgb2YgdGhlIGJhc2UgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJucyB7V2luZG93fVxuICAgICAqL1xuICAgIGdldFdpbmRvdzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZG9tKGVsKS5nZXREb2N1bWVudCgpLmRlZmF1bHRWaWV3O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGRvY3VtZW50IG9mIHRoZSBiYXNlIGVsZW1lbnQuXG4gICAgICogQHJldHVybnMge0hUTUxEb2N1bWVudH1cbiAgICAgKi9cbiAgICBnZXREb2N1bWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBpZiBvd25lckRvY3VtZW50IGlzIG51bGwgdGhlbiBlbCBpcyB0aGUgZG9jdW1lbnQgaXRzZWxmLlxuICAgICAgcmV0dXJuIGVsLm93bmVyRG9jdW1lbnQgfHwgZWw7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHByb3ZpZGVkIGVsZW1lbnQgY29tZXMgYWZ0ZXIgdGhlIGJhc2UgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG90aGVyRWxlbWVudFxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNBZnRlcjogZnVuY3Rpb24ob3RoZXJFbGVtZW50LCByb290RWxlbWVudCkge1xuICAgICAgbGV0IHNpYmxpbmcgPSBlbC5uZXh0U2libGluZztcbiAgICAgIGxldCBpc0FmdGVyID0gZmFsc2U7XG4gICAgICB3aGlsZSAoc2libGluZyAmJiAhaXNBZnRlcikge1xuICAgICAgICBpZiAoc2libGluZyA9PT0gb3RoZXJFbGVtZW50KSB7XG4gICAgICAgICAgaXNBZnRlciA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCFzaWJsaW5nLm5leHRTaWJsaW5nKSB7XG4gICAgICAgICAgICBzaWJsaW5nID0gZWwucGFyZW50Tm9kZS5uZXh0U2libGluZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dFNpYmxpbmc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaXNBZnRlcjtcbiAgICB9XG4gIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBkb207XG4iLCJleHBvcnQgZnVuY3Rpb24gYmluZEV2ZW50cyhlbCwgc2NvcGUpIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgc2NvcGUuaGlnaGxpZ2h0SGFuZGxlci5iaW5kKHNjb3BlKSk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBzY29wZS5oaWdobGlnaHRIYW5kbGVyLmJpbmQoc2NvcGUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuYmluZEV2ZW50cyhlbCwgc2NvcGUpIHtcbiAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgc2NvcGUuaGlnaGxpZ2h0SGFuZGxlci5iaW5kKHNjb3BlKSk7XG4gIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBzY29wZS5oaWdobGlnaHRIYW5kbGVyLmJpbmQoc2NvcGUpKTtcbn1cbiIsImltcG9ydCBkb20sIHsgTk9ERV9UWVBFIH0gZnJvbSBcIi4vZG9tXCI7XG5pbXBvcnQgeyBTVEFSVF9PRkZTRVRfQVRUUiwgRU5EX09GRlNFVF9BVFRSLCBEQVRBX0FUVFIgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5cbi8qKlxuICogVGFrZXMgcmFuZ2Ugb2JqZWN0IGFzIHBhcmFtZXRlciBhbmQgcmVmaW5lcyBpdCBib3VuZGFyaWVzXG4gKiBAcGFyYW0gcmFuZ2VcbiAqIEByZXR1cm5zIHtvYmplY3R9IHJlZmluZWQgYm91bmRhcmllcyBhbmQgaW5pdGlhbCBzdGF0ZSBvZiBoaWdobGlnaHRpbmcgYWxnb3JpdGhtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVmaW5lUmFuZ2VCb3VuZGFyaWVzKHJhbmdlKSB7XG4gIGxldCBzdGFydENvbnRhaW5lciA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyLFxuICAgIGVuZENvbnRhaW5lciA9IHJhbmdlLmVuZENvbnRhaW5lcixcbiAgICBhbmNlc3RvciA9IHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLFxuICAgIGdvRGVlcGVyID0gdHJ1ZTtcblxuICBpZiAocmFuZ2UuZW5kT2Zmc2V0ID09PSAwKSB7XG4gICAgd2hpbGUgKFxuICAgICAgIWVuZENvbnRhaW5lci5wcmV2aW91c1NpYmxpbmcgJiZcbiAgICAgIGVuZENvbnRhaW5lci5wYXJlbnROb2RlICE9PSBhbmNlc3RvclxuICAgICkge1xuICAgICAgZW5kQ29udGFpbmVyID0gZW5kQ29udGFpbmVyLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIGVuZENvbnRhaW5lciA9IGVuZENvbnRhaW5lci5wcmV2aW91c1NpYmxpbmc7XG4gIH0gZWxzZSBpZiAoZW5kQ29udGFpbmVyLm5vZGVUeXBlID09PSBOT0RFX1RZUEUuVEVYVF9OT0RFKSB7XG4gICAgaWYgKHJhbmdlLmVuZE9mZnNldCA8IGVuZENvbnRhaW5lci5ub2RlVmFsdWUubGVuZ3RoKSB7XG4gICAgICBlbmRDb250YWluZXIuc3BsaXRUZXh0KHJhbmdlLmVuZE9mZnNldCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHJhbmdlLmVuZE9mZnNldCA+IDApIHtcbiAgICBlbmRDb250YWluZXIgPSBlbmRDb250YWluZXIuY2hpbGROb2Rlcy5pdGVtKHJhbmdlLmVuZE9mZnNldCAtIDEpO1xuICB9XG5cbiAgaWYgKHN0YXJ0Q29udGFpbmVyLm5vZGVUeXBlID09PSBOT0RFX1RZUEUuVEVYVF9OT0RFKSB7XG4gICAgaWYgKHJhbmdlLnN0YXJ0T2Zmc2V0ID09PSBzdGFydENvbnRhaW5lci5ub2RlVmFsdWUubGVuZ3RoKSB7XG4gICAgICBnb0RlZXBlciA9IGZhbHNlO1xuICAgIH0gZWxzZSBpZiAocmFuZ2Uuc3RhcnRPZmZzZXQgPiAwKSB7XG4gICAgICBzdGFydENvbnRhaW5lciA9IHN0YXJ0Q29udGFpbmVyLnNwbGl0VGV4dChyYW5nZS5zdGFydE9mZnNldCk7XG4gICAgICBpZiAoZW5kQ29udGFpbmVyID09PSBzdGFydENvbnRhaW5lci5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgICAgZW5kQ29udGFpbmVyID0gc3RhcnRDb250YWluZXI7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHJhbmdlLnN0YXJ0T2Zmc2V0IDwgc3RhcnRDb250YWluZXIuY2hpbGROb2Rlcy5sZW5ndGgpIHtcbiAgICBzdGFydENvbnRhaW5lciA9IHN0YXJ0Q29udGFpbmVyLmNoaWxkTm9kZXMuaXRlbShyYW5nZS5zdGFydE9mZnNldCk7XG4gIH0gZWxzZSB7XG4gICAgc3RhcnRDb250YWluZXIgPSBzdGFydENvbnRhaW5lci5uZXh0U2libGluZztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhcnRDb250YWluZXI6IHN0YXJ0Q29udGFpbmVyLFxuICAgIGVuZENvbnRhaW5lcjogZW5kQ29udGFpbmVyLFxuICAgIGdvRGVlcGVyOiBnb0RlZXBlclxuICB9O1xufVxuXG4vKipcbiAqIFNvcnRzIGFycmF5IG9mIERPTSBlbGVtZW50cyBieSBpdHMgZGVwdGggaW4gRE9NIHRyZWUuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50W119IGFyciAtIGFycmF5IHRvIHNvcnQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGRlc2NlbmRpbmcgLSBvcmRlciBvZiBzb3J0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc29ydEJ5RGVwdGgoYXJyLCBkZXNjZW5kaW5nKSB7XG4gIGFyci5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZG9tKGRlc2NlbmRpbmcgPyBiIDogYSkucGFyZW50cygpLmxlbmd0aCAtXG4gICAgICBkb20oZGVzY2VuZGluZyA/IGEgOiBiKS5wYXJlbnRzKCkubGVuZ3RoXG4gICAgKTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGVsZW1lbnRzIGEgaSBiIGhhdmUgdGhlIHNhbWUgY29sb3IuXG4gKiBAcGFyYW0ge05vZGV9IGFcbiAqIEBwYXJhbSB7Tm9kZX0gYlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoYXZlU2FtZUNvbG9yKGEsIGIpIHtcbiAgcmV0dXJuIGRvbShhKS5jb2xvcigpID09PSBkb20oYikuY29sb3IoKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHdyYXBwZXIgZm9yIGhpZ2hsaWdodHMuXG4gKiBUZXh0SGlnaGxpZ2h0ZXIgaW5zdGFuY2UgY2FsbHMgdGhpcyBtZXRob2QgZWFjaCB0aW1lIGl0IG5lZWRzIHRvIGNyZWF0ZSBoaWdobGlnaHRzIGFuZCBwYXNzIG9wdGlvbnMgcmV0cmlldmVkXG4gKiBpbiBjb25zdHJ1Y3Rvci5cbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gdGhlIHNhbWUgb2JqZWN0IGFzIGluIFRleHRIaWdobGlnaHRlciBjb25zdHJ1Y3Rvci5cbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIob3B0aW9ucykge1xuICBsZXQgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICBzcGFuLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IG9wdGlvbnMuY29sb3I7XG4gIHNwYW4uY2xhc3NOYW1lID0gb3B0aW9ucy5oaWdobGlnaHRlZENsYXNzO1xuICByZXR1cm4gc3Bhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRUZXh0Tm9kZUF0TG9jYXRpb24oZWxlbWVudCwgbG9jYXRpb25JbkNoaWxkTm9kZXMpIHtcbiAgY29uc29sZS5sb2coXCJFbGVtZW50IGFzIHBhcmFtZXRlcjogXCIsIGVsZW1lbnQpO1xuICBsZXQgdGV4dE5vZGVFbGVtZW50ID0gZWxlbWVudDtcbiAgbGV0IGkgPSAwO1xuICB3aGlsZSAodGV4dE5vZGVFbGVtZW50ICYmIHRleHROb2RlRWxlbWVudC5ub2RlVHlwZSAhPT0gTk9ERV9UWVBFLlRFWFRfTk9ERSkge1xuICAgIGNvbnNvbGUubG9nKGB0ZXh0Tm9kZUVsZW1lbnQgc3RlcCAke2l9YCwgdGV4dE5vZGVFbGVtZW50KTtcbiAgICBpZiAobG9jYXRpb25JbkNoaWxkTm9kZXMgPT09IFwic3RhcnRcIikge1xuICAgICAgaWYgKHRleHROb2RlRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGV4dE5vZGVFbGVtZW50ID0gdGV4dE5vZGVFbGVtZW50LmNoaWxkTm9kZXNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0Tm9kZUVsZW1lbnQgPSB0ZXh0Tm9kZUVsZW1lbnQubmV4dFNpYmxpbmc7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChsb2NhdGlvbkluQ2hpbGROb2RlcyA9PT0gXCJlbmRcIikge1xuICAgICAgaWYgKHRleHROb2RlRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgbGV0IGxhc3RJbmRleCA9IHRleHROb2RlRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgIHRleHROb2RlRWxlbWVudCA9IHRleHROb2RlRWxlbWVudC5jaGlsZE5vZGVzW2xhc3RJbmRleF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0Tm9kZUVsZW1lbnQgPSB0ZXh0Tm9kZUVsZW1lbnQucHJldmlvdXNTaWJsaW5nO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0ZXh0Tm9kZUVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgICBpKys7XG4gIH1cblxuICBjb25zb2xlLmxvZyhcInRleHQgbm9kZSBlbGVtZW50IHJldHVybmVkOiBcIiwgdGV4dE5vZGVFbGVtZW50KTtcbiAgcmV0dXJuIHRleHROb2RlRWxlbWVudDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgd2hlcmUgdG8gaW5qZWN0IGEgaGlnaGxpZ2h0IGJhc2VkIG9uIGl0J3Mgb2Zmc2V0LlxuICpcbiAqIEBwYXJhbSB7Kn0gaGlnaGxpZ2h0XG4gKiBAcGFyYW0geyp9IHBhcmVudE5vZGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmROb2RlQW5kT2Zmc2V0KGhpZ2hsaWdodCwgcGFyZW50Tm9kZSkge1xuICBsZXQgY3VycmVudE5vZGUgPSBwYXJlbnROb2RlO1xuICBsZXQgY3VycmVudE9mZnNldCA9IDA7XG4gIGxldCBvZmZzZXRXaXRoaW5Ob2RlID0gMDtcbiAgbGV0IGxvY2F0aW9uRm91bmQgPSBmYWxzZTtcblxuICB3aGlsZSAoXG4gICAgY3VycmVudE5vZGUgJiZcbiAgICAhbG9jYXRpb25Gb3VuZCAmJlxuICAgIChjdXJyZW50T2Zmc2V0IDwgaGlnaGxpZ2h0Lm9mZnNldCB8fFxuICAgICAgKGN1cnJlbnRPZmZzZXQgPT09IGhpZ2hsaWdodC5vZmZzZXQgJiYgY3VycmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSlcbiAgKSB7XG4gICAgY29uc3QgZW5kT2ZOb2RlT2Zmc2V0ID0gY3VycmVudE9mZnNldCArIGN1cnJlbnROb2RlLnRleHRDb250ZW50Lmxlbmd0aDtcblxuICAgIGlmIChlbmRPZk5vZGVPZmZzZXQgPiBoaWdobGlnaHQub2Zmc2V0KSB7XG4gICAgICBpZiAoY3VycmVudE5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgb2Zmc2V0V2l0aGluTm9kZSA9IGhpZ2hsaWdodC5vZmZzZXQgLSBjdXJyZW50T2Zmc2V0O1xuICAgICAgICBsb2NhdGlvbkZvdW5kID0gdHJ1ZTtcbiAgICAgICAgY3VycmVudE9mZnNldCA9IGN1cnJlbnRPZmZzZXQgKyBvZmZzZXRXaXRoaW5Ob2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5jaGlsZE5vZGVzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50T2Zmc2V0ID0gZW5kT2ZOb2RlT2Zmc2V0O1xuICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0U2libGluZztcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyBub2RlOiBjdXJyZW50Tm9kZSwgb2Zmc2V0OiBvZmZzZXRXaXRoaW5Ob2RlIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbGVtZW50T2Zmc2V0KGNoaWxkRWxlbWVudCwgcm9vdEVsZW1lbnQpIHtcbiAgbGV0IG9mZnNldCA9IDA7XG4gIGxldCBjaGlsZE5vZGVzO1xuXG4gIGxldCBjdXJyZW50RWxlbWVudCA9IGNoaWxkRWxlbWVudDtcbiAgZG8ge1xuICAgIGNoaWxkTm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChcbiAgICAgIGN1cnJlbnRFbGVtZW50LnBhcmVudE5vZGUuY2hpbGROb2Rlc1xuICAgICk7XG4gICAgY29uc3QgY2hpbGRFbGVtZW50SW5kZXggPSBjaGlsZE5vZGVzLmluZGV4T2YoY3VycmVudEVsZW1lbnQpO1xuICAgIGNvbnN0IG9mZnNldEluQ3VycmVudFBhcmVudCA9IGdldFRleHRPZmZzZXRCZWZvcmUoXG4gICAgICBjaGlsZE5vZGVzLFxuICAgICAgY2hpbGRFbGVtZW50SW5kZXhcbiAgICApO1xuICAgIG9mZnNldCArPSBvZmZzZXRJbkN1cnJlbnRQYXJlbnQ7XG4gICAgY3VycmVudEVsZW1lbnQgPSBjdXJyZW50RWxlbWVudC5wYXJlbnROb2RlO1xuICB9IHdoaWxlIChjdXJyZW50RWxlbWVudCAhPT0gcm9vdEVsZW1lbnQgfHwgIWN1cnJlbnRFbGVtZW50KTtcblxuICByZXR1cm4gb2Zmc2V0O1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0T2Zmc2V0QmVmb3JlKGNoaWxkTm9kZXMsIGN1dEluZGV4KSB7XG4gIGxldCB0ZXh0T2Zmc2V0ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjdXRJbmRleDsgaSsrKSB7XG4gICAgY29uc3QgY3VycmVudE5vZGUgPSBjaGlsZE5vZGVzW2ldO1xuICAgIC8vIFVzZSB0ZXh0Q29udGVudCBhbmQgbm90IGlubmVySFRNTCB0byBhY2NvdW50IGZvciBpbnZpc2libGUgY2hhcmFjdGVycyBhcyB3ZWxsLlxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9Ob2RlL3RleHRDb250ZW50XG4gICAgY29uc3QgdGV4dCA9IGN1cnJlbnROb2RlLnRleHRDb250ZW50O1xuICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoID4gMCkge1xuICAgICAgdGV4dE9mZnNldCArPSB0ZXh0Lmxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRleHRPZmZzZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmlyc3ROb25TaGFyZWRQYXJlbnQoZWxlbWVudHMpIHtcbiAgbGV0IGNoaWxkRWxlbWVudCA9IGVsZW1lbnRzLmNoaWxkRWxlbWVudDtcbiAgbGV0IG90aGVyRWxlbWVudCA9IGVsZW1lbnRzLm90aGVyRWxlbWVudDtcbiAgbGV0IHBhcmVudHMgPSBkb20oY2hpbGRFbGVtZW50KS5wYXJlbnRzV2l0aG91dERvY3VtZW50KCk7XG4gIGxldCBpID0gMDtcbiAgbGV0IGZpcnN0Tm9uU2hhcmVkUGFyZW50ID0gbnVsbDtcbiAgbGV0IGFsbFBhcmVudHNBcmVTaGFyZWQgPSBmYWxzZTtcbiAgd2hpbGUgKCFmaXJzdE5vblNoYXJlZFBhcmVudCAmJiAhYWxsUGFyZW50c0FyZVNoYXJlZCAmJiBpIDwgcGFyZW50cy5sZW5ndGgpIHtcbiAgICBjb25zdCBjdXJyZW50UGFyZW50ID0gcGFyZW50c1tpXTtcblxuICAgIGlmIChjdXJyZW50UGFyZW50LmNvbnRhaW5zKG90aGVyRWxlbWVudCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiY3VycmVudFBhcmVudCBjb250YWlucyBvdGhlciBlbGVtZW50IVwiLCBjdXJyZW50UGFyZW50KTtcbiAgICAgIGlmIChpID4gMCkge1xuICAgICAgICBmaXJzdE5vblNoYXJlZFBhcmVudCA9IHBhcmVudHNbaSAtIDFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxsUGFyZW50c0FyZVNoYXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGkrKztcbiAgfVxuXG4gIHJldHVybiBmaXJzdE5vblNoYXJlZFBhcmVudDtcbn1cblxuY29uc3Qgc2libGluZ1JlbW92YWxEaXJlY3Rpb25zID0ge1xuICBzdGFydDogXCJwcmV2aW91c1NpYmxpbmdcIixcbiAgZW5kOiBcIm5leHRTaWJsaW5nXCJcbn07XG5cbmNvbnN0IHNpYmxpbmdUZXh0Tm9kZU1lcmdlRGlyZWN0aW9ucyA9IHtcbiAgc3RhcnQ6IFwibmV4dFNpYmxpbmdcIixcbiAgZW5kOiBcInByZXZpb3VzU2libGluZ1wiXG59O1xuXG5mdW5jdGlvbiByZW1vdmVTaWJsaW5nc0luRGlyZWN0aW9uKHN0YXJ0Tm9kZSwgZGlyZWN0aW9uKSB7XG4gIGxldCBzaWJsaW5nID0gc3RhcnROb2RlW2RpcmVjdGlvbl07XG4gIHdoaWxlIChzaWJsaW5nKSB7XG4gICAgc3RhcnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2libGluZyk7XG4gICAgc2libGluZyA9IHNpYmxpbmdbZGlyZWN0aW9uXTtcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlcyB0aGUgdGV4dCBvZiBhbGwgc2libGluZyB0ZXh0IG5vZGVzIHdpdGggdGhlIHN0YXJ0IG5vZGUuXG4gKlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gc3RhcnROb2RlXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIG1lcmdlU2libGluZ1RleHROb2Rlc0luRGlyZWN0aW9uKHN0YXJ0Tm9kZSwgZGlyZWN0aW9uKSB7XG4gIGxldCBzaWJsaW5nID0gc3RhcnROb2RlW2RpcmVjdGlvbl07XG4gIHdoaWxlIChzaWJsaW5nKSB7XG4gICAgaWYgKHNpYmxpbmcubm9kZVR5cGUgPT09IE5PREVfVFlQRS5URVhUX05PREUpIHtcbiAgICAgIHN0YXJ0Tm9kZS50ZXh0Q29udGVudCArPSBzaWJsaW5nLnRleHRDb250ZW50O1xuICAgICAgc3RhcnROb2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2libGluZyk7XG4gICAgICBzaWJsaW5nID0gc2libGluZ1tkaXJlY3Rpb25dO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEVsZW1lbnRDb250ZW50Rm9ySGlnaGxpZ2h0KHBhcmFtcykge1xuICBsZXQgZWxlbWVudCA9IHBhcmFtcy5lbGVtZW50O1xuICBsZXQgZWxlbWVudEFuY2VzdG9yID0gcGFyYW1zLmVsZW1lbnRBbmNlc3RvcjtcbiAgbGV0IG9wdGlvbnMgPSBwYXJhbXMub3B0aW9ucztcbiAgbGV0IGxvY2F0aW9uSW5TZWxlY3Rpb24gPSBwYXJhbXMubG9jYXRpb25JblNlbGVjdGlvbjtcblxuICBsZXQgZWxlbWVudEFuY2VzdG9yQ29weSA9IGVsZW1lbnRBbmNlc3Rvci5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgLy8gQmVnaW5uaW5nIG9mIGNoaWxkTm9kZXMgbGlzdCBmb3IgZW5kIGNvbnRhaW5lciBpbiBzZWxlY3Rpb25cbiAgLy8gYW5kIGVuZCBvZiBjaGlsZE5vZGVzIGxpc3QgZm9yIHN0YXJ0IGNvbnRhaW5lciBpbiBzZWxlY3Rpb24uXG4gIGxldCBsb2NhdGlvbkluQ2hpbGROb2RlcyA9IGxvY2F0aW9uSW5TZWxlY3Rpb24gPT09IFwic3RhcnRcIiA/IFwiZW5kXCIgOiBcInN0YXJ0XCI7XG4gIGxldCBlbGVtZW50Q29weSA9IGZpbmRUZXh0Tm9kZUF0TG9jYXRpb24oXG4gICAgZWxlbWVudEFuY2VzdG9yQ29weSxcbiAgICBsb2NhdGlvbkluQ2hpbGROb2Rlc1xuICApO1xuICBsZXQgZWxlbWVudENvcHlQYXJlbnQgPSBlbGVtZW50Q29weS5wYXJlbnROb2RlO1xuXG4gIHJlbW92ZVNpYmxpbmdzSW5EaXJlY3Rpb24oXG4gICAgZWxlbWVudENvcHksXG4gICAgc2libGluZ1JlbW92YWxEaXJlY3Rpb25zW2xvY2F0aW9uSW5TZWxlY3Rpb25dXG4gICk7XG5cbiAgbWVyZ2VTaWJsaW5nVGV4dE5vZGVzSW5EaXJlY3Rpb24oXG4gICAgZWxlbWVudENvcHksXG4gICAgc2libGluZ1RleHROb2RlTWVyZ2VEaXJlY3Rpb25zW2xvY2F0aW9uSW5TZWxlY3Rpb25dXG4gICk7XG5cbiAgY29uc29sZS5sb2coXCJlbGVtZW50Q29weTogXCIsIGVsZW1lbnRDb3B5KTtcbiAgY29uc29sZS5sb2coXCJlbGVtZW50Q29weVBhcmVudDogXCIsIGVsZW1lbnRDb3B5UGFyZW50KTtcblxuICAvLyBDbGVhbiBvdXQgYW55IG5lc3RlZCBoaWdobGlnaHQgd3JhcHBlcnMuXG4gIGlmIChcbiAgICBlbGVtZW50Q29weVBhcmVudCAhPT0gZWxlbWVudEFuY2VzdG9yQ29weSAmJlxuICAgIGVsZW1lbnRDb3B5UGFyZW50LmNsYXNzTGlzdC5jb250YWlucyhvcHRpb25zLmhpZ2hsaWdodGVkQ2xhc3MpXG4gICkge1xuICAgIGRvbShlbGVtZW50Q29weVBhcmVudCkudW53cmFwKCk7XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIHRleHQgbm9kZSB0aGF0IHdlIG5lZWQgZm9yIHRoZSBuZXcgaGlnaGxpZ2h0XG4gIC8vIGZyb20gdGhlIGV4aXN0aW5nIGhpZ2hsaWdodCBvciBvdGhlciBlbGVtZW50LlxuICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG5cbiAgcmV0dXJuIHsgZWxlbWVudEFuY2VzdG9yQ29weSwgZWxlbWVudENvcHkgfTtcbn1cblxuZnVuY3Rpb24gZ2F0aGVyU2libGluZ3NVcFRvRW5kTm9kZShzdGFydE5vZGVPckNvbnRhaW5lciwgZW5kTm9kZSkge1xuICBjb25zdCBnYXRoZXJlZFNpYmxpbmdzID0gW107XG4gIGxldCBmb3VuZEVuZE5vZGVTaWJsaW5nID0gZmFsc2U7XG5cbiAgbGV0IGN1cnJlbnROb2RlID0gc3RhcnROb2RlT3JDb250YWluZXIubmV4dFNpYmxpbmc7XG4gIHdoaWxlIChjdXJyZW50Tm9kZSAmJiAhZm91bmRFbmROb2RlU2libGluZykge1xuICAgIGlmIChjdXJyZW50Tm9kZSA9PT0gZW5kTm9kZSB8fCBjdXJyZW50Tm9kZS5jb250YWlucyhlbmROb2RlKSkge1xuICAgICAgZm91bmRFbmROb2RlU2libGluZyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdhdGhlcmVkU2libGluZ3MucHVzaChjdXJyZW50Tm9kZSk7XG4gICAgICBjdXJyZW50Tm9kZSA9IGN1cnJlbnROb2RlLm5leHRTaWJsaW5nO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGdhdGhlcmVkU2libGluZ3MsIGZvdW5kRW5kTm9kZVNpYmxpbmcgfTtcbn1cblxuLyoqXG4gKiBHZXRzIGFsbCB0aGUgbm9kZXMgaW4gYmV0d2VlbiB0aGUgcHJvdmlkZWQgc3RhcnQgYW5kIGVuZC5cbiAqXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBzdGFydE5vZGVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVuZE5vZGVcbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFtdfSBOb2RlcyB0aGF0IGxpdmUgaW4gYmV0d2VlbiB0aGUgdHdvLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9kZXNJbkJldHdlZW4oc3RhcnROb2RlLCBlbmROb2RlKSB7XG4gIGlmIChzdGFydE5vZGUgPT09IGVuZE5vZGUpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgLy8gRmlyc3QgYXR0ZW1wdCB0aGUgZWFzaWVzdCBzb2x1dGlvbiwgaG9waW5nIGVuZE5vZGUgd2lsbCBiZSBhdCB0aGUgc2FtZSBsZXZlbFxuICAvLyBhcyB0aGUgc3RhcnQgbm9kZSBvciBjb250YWluZWQgaW4gYW4gZWxlbWVudCBhdCB0aGUgc2FtZSBsZXZlbC5cbiAgY29uc3Qge1xuICAgIGZvdW5kRW5kTm9kZVNpYmxpbmc6IGZvdW5kRW5kTm9kZVNpYmxpbmdPblNhbWVMZXZlbCxcbiAgICBnYXRoZXJlZFNpYmxpbmdzXG4gIH0gPSBnYXRoZXJTaWJsaW5nc1VwVG9FbmROb2RlKHN0YXJ0Tm9kZSwgZW5kTm9kZSk7XG5cbiAgaWYgKGZvdW5kRW5kTm9kZVNpYmxpbmdPblNhbWVMZXZlbCkge1xuICAgIHJldHVybiBnYXRoZXJlZFNpYmxpbmdzO1xuICB9XG5cbiAgLy8gTm93IGdvIGZvciB0aGUgcm91dGUgdGhhdCBnb2VzIHRvIHRoZSBoaWdoZXN0IHBhcmVudCBvZiB0aGUgc3RhcnQgbm9kZSBpbiB0aGUgdHJlZVxuICAvLyB0aGF0IGlzIG5vdCB0aGUgcGFyZW50IG9mIHRoZSBlbmQgbm9kZS5cbiAgY29uc3Qgc3RhcnROb2RlUGFyZW50ID0gZmluZEZpcnN0Tm9uU2hhcmVkUGFyZW50KHtcbiAgICBjaGlsZEVsZW1lbnQ6IHN0YXJ0Tm9kZSxcbiAgICBvdGhlckVsZW1lbnQ6IGVuZE5vZGVcbiAgfSk7XG5cbiAgaWYgKHN0YXJ0Tm9kZVBhcmVudCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGZvdW5kRW5kTm9kZVNpYmxpbmc6IGZvdW5kRW5kTm9kZVNpYmxpbmdGcm9tUGFyZW50TGV2ZWwsXG4gICAgICBnYXRoZXJlZFNpYmxpbmdzOiBnYXRoZXJlZFNpYmxpbmdzRnJvbVBhcmVudFxuICAgIH0gPSBnYXRoZXJTaWJsaW5nc1VwVG9FbmROb2RlKHN0YXJ0Tm9kZVBhcmVudCwgZW5kTm9kZSk7XG5cbiAgICBpZiAoZm91bmRFbmROb2RlU2libGluZ0Zyb21QYXJlbnRMZXZlbCkge1xuICAgICAgcmV0dXJuIGdhdGhlcmVkU2libGluZ3NGcm9tUGFyZW50O1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cblxuLyoqXG4gKiBHcm91cHMgZ2l2ZW4gaGlnaGxpZ2h0cyBieSB0aW1lc3RhbXAuXG4gKiBAcGFyYW0ge0FycmF5fSBoaWdobGlnaHRzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGltZXN0YW1wQXR0clxuICogQHJldHVybnMge0FycmF5fSBHcm91cGVkIGhpZ2hsaWdodHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cEhpZ2hsaWdodHMoaGlnaGxpZ2h0cywgdGltZXN0YW1wQXR0cikge1xuICBsZXQgb3JkZXIgPSBbXSxcbiAgICBjaHVua3MgPSB7fSxcbiAgICBncm91cGVkID0gW107XG5cbiAgaGlnaGxpZ2h0cy5mb3JFYWNoKGZ1bmN0aW9uKGhsKSB7XG4gICAgbGV0IHRpbWVzdGFtcCA9IGhsLmdldEF0dHJpYnV0ZSh0aW1lc3RhbXBBdHRyKTtcblxuICAgIGlmICh0eXBlb2YgY2h1bmtzW3RpbWVzdGFtcF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGNodW5rc1t0aW1lc3RhbXBdID0gW107XG4gICAgICBvcmRlci5wdXNoKHRpbWVzdGFtcCk7XG4gICAgfVxuXG4gICAgY2h1bmtzW3RpbWVzdGFtcF0ucHVzaChobCk7XG4gIH0pO1xuXG4gIG9yZGVyLmZvckVhY2goZnVuY3Rpb24odGltZXN0YW1wKSB7XG4gICAgbGV0IGdyb3VwID0gY2h1bmtzW3RpbWVzdGFtcF07XG5cbiAgICBncm91cGVkLnB1c2goe1xuICAgICAgY2h1bmtzOiBncm91cCxcbiAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZ3JvdXBcbiAgICAgICAgICAubWFwKGZ1bmN0aW9uKGgpIHtcbiAgICAgICAgICAgIHJldHVybiBoLnRleHRDb250ZW50O1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmpvaW4oXCJcIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiBncm91cGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV0cmlldmVIaWdobGlnaHRzKHBhcmFtcykge1xuICBwYXJhbXMgPSB7XG4gICAgYW5kU2VsZjogdHJ1ZSxcbiAgICBncm91cGVkOiBmYWxzZSxcbiAgICAuLi5wYXJhbXNcbiAgfTtcblxuICBsZXQgbm9kZUxpc3QgPSBwYXJhbXMuY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbXCIgKyBwYXJhbXMuZGF0YUF0dHIgKyBcIl1cIiksXG4gICAgaGlnaGxpZ2h0cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5vZGVMaXN0KTtcblxuICBpZiAoXG4gICAgcGFyYW1zLmFuZFNlbGYgPT09IHRydWUgJiZcbiAgICBwYXJhbXMuY29udGFpbmVyLmhhc0F0dHJpYnV0ZShwYXJhbXMuZGF0YUF0dHIpXG4gICkge1xuICAgIGhpZ2hsaWdodHMucHVzaChwYXJhbXMuY29udGFpbmVyKTtcbiAgfVxuXG4gIGlmIChwYXJhbXMuZ3JvdXBlZCkge1xuICAgIGhpZ2hsaWdodHMgPSBncm91cEhpZ2hsaWdodHMoaGlnaGxpZ2h0cywgcGFyYW1zLnRpbWVzdGFtcEF0dHIpO1xuICB9XG5cbiAgcmV0dXJuIGhpZ2hsaWdodHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VsZW1lbnRIaWdobGlnaHQoZWwsIGRhdGFBdHRyKSB7XG4gIHJldHVybiAoXG4gICAgZWwgJiYgZWwubm9kZVR5cGUgPT09IE5PREVfVFlQRS5FTEVNRU5UX05PREUgJiYgZWwuaGFzQXR0cmlidXRlKGRhdGFBdHRyKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTm9kZXNUb0hpZ2hsaWdodEFmdGVyRWxlbWVudCh7XG4gIGVsZW1lbnQsXG4gIGVsZW1lbnRBbmNlc3RvcixcbiAgaGlnaGxpZ2h0V3JhcHBlcixcbiAgaGlnaGxpZ2h0ZWRDbGFzc1xufSkge1xuICBpZiAoZWxlbWVudEFuY2VzdG9yKSB7XG4gICAgaWYgKGVsZW1lbnRBbmNlc3Rvci5jbGFzc0xpc3QuY29udGFpbnMoaGlnaGxpZ2h0ZWRDbGFzcykpIHtcbiAgICAgIC8vIEVuc3VyZSB3ZSBvbmx5IHRha2UgdGhlIGNoaWxkcmVuIGZyb20gYSBwYXJlbnQgdGhhdCBpcyBhIGhpZ2hsaWdodC5cbiAgICAgIGVsZW1lbnRBbmNlc3Rvci5jaGlsZE5vZGVzLmZvckVhY2goY2hpbGROb2RlID0+IHtcbiAgICAgICAgaWYgKGRvbShjaGlsZE5vZGUpLmlzQWZ0ZXIoZWxlbWVudCkpIHtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50QW5jZXN0b3IuYXBwZW5kQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBoaWdobGlnaHRXcmFwcGVyLmFwcGVuZENoaWxkKGVsZW1lbnRBbmNlc3Rvcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGhpZ2hsaWdodFdyYXBwZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb2xsZWN0cyB0aGUgaHVtYW4tcmVhZGFibGUgaGlnaGxpZ2h0ZWQgdGV4dCBmb3IgYWxsIG5vZGVzIGluIHRoZSBzZWxlY3RlZCByYW5nZS5cbiAqXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICpcbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGh1bWFuLXJlYWRhYmxlIGhpZ2hsaWdodGVkIHRleHQgZm9yIHRoZSBnaXZlbiByYW5nZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEhpZ2hsaWdodGVkVGV4dChyYW5nZSkge1xuICBjb25zdCBzdGFydENvbnRhaW5lckNvcHkgPSByYW5nZS5zdGFydENvbnRhaW5lci5jbG9uZSh0cnVlKTtcbiAgcmV0dXJuIFwiXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZXNjcmlwdG9ycyh7IHJvb3RFbGVtZW50LCByYW5nZSwgd3JhcHBlciB9KSB7XG4gIGxldCB3cmFwcGVyQ2xvbmUgPSB3cmFwcGVyLmNsb25lTm9kZSh0cnVlKTtcblxuICBjb25zdCBzdGFydE9mZnNldCA9XG4gICAgZ2V0RWxlbWVudE9mZnNldChyYW5nZS5zdGFydENvbnRhaW5lciwgcm9vdEVsZW1lbnQpICsgcmFuZ2Uuc3RhcnRPZmZzZXQ7XG4gIGNvbnN0IGVuZE9mZnNldCA9XG4gICAgcmFuZ2Uuc3RhcnRDb250YWluZXIgPT09IHJhbmdlLmVuZENvbnRhaW5lclxuICAgICAgPyBzdGFydE9mZnNldCArIChyYW5nZS5lbmRPZmZzZXQgLSByYW5nZS5zdGFydE9mZnNldClcbiAgICAgIDogZ2V0RWxlbWVudE9mZnNldChyYW5nZS5lbmRDb250YWluZXIsIHJvb3RFbGVtZW50KSArIHJhbmdlLmVuZE9mZnNldDtcbiAgY29uc3QgbGVuZ3RoID0gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXQ7XG4gIHdyYXBwZXJDbG9uZS5zZXRBdHRyaWJ1dGUoREFUQV9BVFRSLCB0cnVlKTtcblxuICB3cmFwcGVyQ2xvbmUuaW5uZXJIVE1MID0gXCJcIjtcbiAgY29uc3Qgd3JhcHBlckhUTUwgPSB3cmFwcGVyQ2xvbmUub3V0ZXJIVE1MO1xuXG4gIGNvbnN0IGRlc2NyaXB0b3IgPSBbXG4gICAgd3JhcHBlckhUTUwsXG4gICAgLy8gcmV0cmlldmUgYWxsIHRoZSB0ZXh0IGNvbnRlbnQgYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZCBvZmZzZXRzLlxuICAgIGdldEhpZ2hsaWdodGVkVGV4dChyYW5nZSksXG4gICAgc3RhcnRPZmZzZXQsXG4gICAgbGVuZ3RoXG4gIF07XG4gIC8vIFRPRE86IGNodW5rIHVwIGhpZ2hsaWdodHMgZm9yIFBERnMgKG9yIGFueSBlbGVtZW50IHdpdGggYWJzb2x1dGVseSBwb3NpdGlvbmVkIGVsZW1lbnRzKS5cbiAgcmV0dXJuIFtkZXNjcmlwdG9yXTtcbn1cbiJdfQ==
