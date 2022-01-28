/**
 * @typedef {Object} NodeAndOffset
 * @property {Node} node - The DOM node that makes up a portion of a highlight.
 * @property {number} offset - Offset within the node for a portion of a highlight.
 * @property {number} normalisedOffset - Offset within the node's original text that excludes
 *                                       characters that are normalised away.
 * @property {number} length - Length of the portion highlighted in the node.
 * @property {string} normalisedText - Node's text content stripped of carriage returns
 *                                     and white spaces that follow carriage returns.
 *
 * @typedef {Object} NodesAndOffsetsResult
 * @property {NodeAndOffset[]} nodesAndOffsets
 * @property {string} allText
 *
 * @typedef {Object} RangeLite
 * @property {HTMLElement} startContainer
 * @property {number} startOffset
 * @property {HTMLElement} endContainer
 * @property {number} endOffset
 */

import dom, { NODE_TYPE } from "./dom";
import { DATA_ATTR, START_OFFSET_ATTR, LENGTH_ATTR, IGNORE_TAGS } from "../config";
import { arrayToLower } from "./arrays";

/**
 * Takes range object as parameter and refines it boundaries
 * @param range
 * @returns {object} refined boundaries and initial state of highlighting algorithm.
 */
export function refineRangeBoundaries(range) {
  let startContainer = range.startContainer,
    endContainer = range.endContainer,
    ancestor = range.commonAncestorContainer,
    goDeeper = true;

  if (range.endOffset === 0) {
    while (!endContainer.previousSibling && endContainer.parentNode !== ancestor) {
      endContainer = endContainer.parentNode;
    }
    endContainer = endContainer.previousSibling;
  } else if (endContainer.nodeType === NODE_TYPE.TEXT_NODE) {
    if (range.endOffset < endContainer.nodeValue.length) {
      endContainer.splitText(range.endOffset);
    }
  } else if (range.endOffset > 0) {
    endContainer = endContainer.childNodes.item(range.endOffset - 1);
  }

  if (startContainer.nodeType === NODE_TYPE.TEXT_NODE) {
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
    goDeeper: goDeeper,
  };
}

/**
 * Sorts array of DOM elements by its depth in DOM tree.
 * @param {HTMLElement[]} arr - array to sort.
 * @param {boolean} descending - order of sort.
 */
export function sortByDepth(arr, descending) {
  arr.sort(function(a, b) {
    return dom(descending ? b : a).parents().length - dom(descending ? a : b).parents().length;
  });
}

/**
 * Returns true if elements a i b have the same color.
 * @param {Node} a
 * @param {Node} b
 * @returns {boolean}
 */
export function haveSameColor(a, b) {
  return dom(a).color() === dom(b).color();
}

/**
 * Creates wrapper for highlights.
 * TextHighlighter instance calls this method each time it needs to create highlights and pass options retrieved
 * in constructor.
 * @param {object} options - the same object as in TextHighlighter constructor.
 * @returns {HTMLElement}
 */
export function createWrapper(options) {
  let span = document.createElement("span");
  span.style.backgroundColor = options.color;
  span.className = options.highlightedClass;
  return span;
}

export function findTextNodeAtLocation(element, locationInChildNodes) {
  let textNodeElement = element;
  let i = 0;
  while (textNodeElement && textNodeElement.nodeType !== NODE_TYPE.TEXT_NODE) {
    if (locationInChildNodes === "start") {
      if (textNodeElement.childNodes.length > 0) {
        textNodeElement = textNodeElement.childNodes[0];
      } else {
        textNodeElement = textNodeElement.nextSibling;
      }
    } else if (locationInChildNodes === "end") {
      if (textNodeElement.childNodes.length > 0) {
        let lastIndex = textNodeElement.childNodes.length - 1;
        textNodeElement = textNodeElement.childNodes[lastIndex];
      } else {
        textNodeElement = textNodeElement.previousSibling;
      }
    } else {
      textNodeElement = null;
    }
    i++;
  }

  return textNodeElement;
}

function textContentExcludingTags(node, excludeNodeNames) {
  return dom(node).textContentExcludingTags(arrayToLower(excludeNodeNames));
}

/**
 * Deals with normalising text for when carriage returns and white space
 * that directly follows should be ignored.
 *
 * @param {string} text
 */
function normaliseText(text) {
  return text.replace(/((\r\n|\n\r|\n|\r)\s*)/g, "");
}

/**
 * Deals with normalising text for when carriage returns and white space
 * that directly follows or when white space and white space that directly
 * follows should be ignored.
 *
 * @param {string} text
 *
 * @returns {string}
 */

function normaliseTextWithLeadingSpaces(text) {
  return text.replace(/(((\r\n|\n\r|\n|\r)\s*)|(^\s+))/g, "");
}

/**
 * Checks whether previous siblings end with a carriage return followed by
 * zero or more whitespaces and selects the function that should be used to
 * normalise the text.
 *
 * @param {Node} node
 * @param {Node} parentNode
 * @param {string} text
 *
 * @returns {string}
 */

function normaliseBasedOnPrevSibling(node, parentNode, text) {
  const prevNode = dom(node).previousClosestSibling(parentNode);
  if (prevNode) {
    const matchRegex = /((\r\n|\n\r|\n|\r)\s*)$/;
    const matches = matchRegex.test(prevNode.textContent);
    if (matches) {
      return normaliseTextWithLeadingSpaces(text);
    }
  }
  return normaliseText(text);
}

/**
 *
 * @param {number} offsetWithinNode
 * @param {string} text
 *
 * @returns {number}
 */
function normaliseOffset(offsetWithinNode, text) {
  const matchResults = text.match(/^((\r\n|\n\r|\n|\r)\s*)/g);
  if (!matchResults) {
    return offsetWithinNode;
  }
  return offsetWithinNode + matchResults[0].length;
}

/**
 * Determine where to inject a highlight based on it's offset.
 * A highlight can span multiple nodes, so in here we accumulate
 * all those nodes with offset and length of the content in the node
 * included in the highlight.
 *
 * The normalisedOffset returned for each node when excludeWithSpaceAndReturns
 * is set to true represents the normalised offset in the original text and NOT
 * the normalised text.
 *
 * @param {*} highlight
 * @param {*} parentNode
 * @param {*} excludeNodeNames
 * @param {boolean} excludeWhiteSpaceAndReturns
 *
 * @return {NodesAndOffsetsResult}
 */
export function findNodesAndOffsets(
  highlight,
  parentNode,
  excludeNodeNames = IGNORE_TAGS,
  excludeWhiteSpaceAndReturns = false,
) {
  const nodesAndOffsets = [];
  let currentNode = parentNode;
  let currentOffset = 0;
  const highlightEndOffset = highlight.offset + highlight.length;
  let allText = "";

  while (currentNode && currentOffset < highlightEndOffset) {
    // Ensure we ignore node types that the caller has specified should be excluded.
    if (!excludeNodeNames.includes(currentNode.nodeName)) {
      const textContent = textContentExcludingTags(currentNode, excludeNodeNames);
      const reducedTextContent = excludeWhiteSpaceAndReturns
        ? normaliseBasedOnPrevSibling(currentNode, parentNode, textContent)
        : "";

      if (currentNode == parentNode) {
        allText = excludeWhiteSpaceAndReturns ? reducedTextContent : textContent;
      }
      const textLength = textContent.length;
      const normalisedTextLength = normaliseBasedOnPrevSibling(currentNode, parentNode, textContent)
        .length;
      const endOfCurrentNodeOffset = currentOffset + textLength;
      const normalisedEOCNodeOffset = excludeWhiteSpaceAndReturns
        ? currentOffset + normalisedTextLength
        : endOfCurrentNodeOffset;

      if (normalisedEOCNodeOffset > highlight.offset) {
        const isTerminalNode = currentNode.childNodes.length === 0;
        if (isTerminalNode) {
          if (currentNode.nodeType === NODE_TYPE.TEXT_NODE) {
            const offsetWithinNode =
              highlight.offset > currentOffset ? highlight.offset - currentOffset : 0;

            // Only exclude text normalised away at the start of the entire highlight.
            const normalisedOffset =
              excludeWhiteSpaceAndReturns && nodesAndOffsets.length === 0
                ? normaliseOffset(offsetWithinNode, textContent)
                : offsetWithinNode;
            const normalisedOffsetDiff = Math.abs(normalisedOffset - offsetWithinNode);

            // Remove further carriage returns and white spaces that directly follow
            // from the length in the node
            // that may be in the middle or at the end of the node.
            const textFromNormalisedOffset = textContent.substr(normalisedOffset);
            const charactersToIgnoreInside = excludeWhiteSpaceAndReturns
              ? textFromNormalisedOffset.length -
                normaliseBasedOnPrevSibling(currentNode, parentNode, textFromNormalisedOffset)
                  .length
              : 0;

            const nextNodeOffset =
              endOfCurrentNodeOffset - normalisedOffsetDiff - charactersToIgnoreInside;

            const lengthInHighlight =
              highlightEndOffset >= nextNodeOffset
                ? textLength - offsetWithinNode
                : // While counting the actual amount of text in the DOM node, we need to retain
                  // any characters that are ignored when determining nodes from a highlight offset and length
                  // to know exactly where to inject the highlight's spans without modifying the original text.
                  highlightEndOffset - currentOffset - offsetWithinNode + charactersToIgnoreInside;

            // Only exclude text normalised away from the node at the start of the
            // entire highlight.
            const normalisedLengthInHighlight =
              excludeWhiteSpaceAndReturns && nodesAndOffsets.length === 0
                ? lengthInHighlight - normalisedOffsetDiff
                : lengthInHighlight;

            if (normalisedLengthInHighlight > 0) {
              nodesAndOffsets.push({
                node: currentNode,
                offset: normalisedOffset,
                length: normalisedLengthInHighlight,
                normalisedText: excludeWhiteSpaceAndReturns
                  ? normaliseBasedOnPrevSibling(currentNode, parentNode, currentNode.textContent)
                  : currentNode.textContent,
              });
            }

            currentOffset = nextNodeOffset;
          }

          // It doesn't matter if it is a text node or not at this point,
          // we still need to get the next sibling of the node or it's ancestors.
          currentNode = dom(currentNode).nextClosestSibling(parentNode);
        } else {
          currentNode = currentNode.childNodes[0];
        }
      } else {
        currentOffset = normalisedEOCNodeOffset;
        if (currentNode !== parentNode) {
          currentNode = currentNode.nextSibling;
        } else {
          currentNode = null;
        }
      }
    } else {
      currentNode = dom(currentNode).nextClosestSibling(parentNode);
    }
  }

  return { nodesAndOffsets, allText };
}

export function getElementOffset(
  childElement,
  rootElement,
  excludeNodeNames = IGNORE_TAGS,
  excludeWhiteSpaceAndReturns = false,
  startOffset = 0,
  isStartOfRange = false,
) {
  let offset = 0;
  let childNodes;

  let currentElement = childElement;
  do {
    // Ensure specified node types are not counted in the offset.
    if (!excludeNodeNames.includes(currentElement.nodeName)) {
      childNodes = currentElement.parentNode.childNodes;
      const childElementIndex = dom(currentElement.parentNode).getChildIndex(currentElement);
      const offsetInCurrentParent = getTextOffsetBefore(
        childNodes,
        childElementIndex,
        excludeNodeNames,
        excludeWhiteSpaceAndReturns,
      );
      offset += offsetInCurrentParent;
    }

    currentElement = currentElement.parentNode;
  } while (currentElement !== rootElement || !currentElement);

  return excludeWhiteSpaceAndReturns && isStartOfRange ? offset : offset + startOffset;
}

function getTextOffsetBefore(
  childNodes,
  cutIndex,
  excludeNodeNames,
  excludeWhiteSpaceAndReturns = false,
) {
  let textOffset = 0;
  for (let i = 0; i < cutIndex; i++) {
    const currentNode = childNodes[i];

    // Strip out all nodes from the child node that we should be excluding.
    //
    // Use textContent and not innerText to account for invisible characters such as carriage returns as well,
    // plus innerText forces a reflow of the layout and as we access text content of nodes
    // a lot in the highlighting process, we don't want to take the performance hit.
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
    const text = dom(currentNode).textContentExcludingTags(arrayToLower(excludeNodeNames));

    if (!excludeNodeNames.includes(currentNode.nodeName) && text && text.length > 0) {
      textOffset += excludeWhiteSpaceAndReturns ? normaliseText(text).length : text.length;
    }
  }
  return textOffset;
}

export function findFirstNonSharedParent(elements) {
  let childElement = elements.childElement;
  let otherElement = elements.otherElement;
  let parents = dom(childElement).parentsWithoutDocument();
  let i = 0;
  let firstNonSharedParent = null;
  let allParentsAreShared = false;
  while (!firstNonSharedParent && !allParentsAreShared && i < parents.length) {
    const currentParent = parents[i];

    if (currentParent.contains(otherElement)) {
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

function gatherSiblingsUpToEndNode(startNodeOrContainer, endNode) {
  const gatheredSiblings = [];
  let foundEndNodeSibling = false;

  let currentNode = startNodeOrContainer.nextSibling;
  console.log({ currentNodeBeforeWhile: currentNode });
  while (currentNode && !foundEndNodeSibling) {
    if (currentNode === endNode || currentNode.contains(endNode)) {
      foundEndNodeSibling = true;
    } else {
      gatheredSiblings.push(currentNode);
      currentNode = currentNode.nextSibling;
    }
  }

  return { gatheredSiblings, foundEndNodeSibling };
}

/**
 * Gets all the nodes in between the provided start and end.
 *
 * @param {HTMLElement} startNode
 * @param {HTMLElement} endNode
 * @returns {HTMLElement[]} Nodes that live in between the two.
 */
export function nodesInBetween(startNode, endNode) {
  if (startNode === endNode) {
    return [];
  }
  // First attempt the easiest solution, hoping endNode will be at the same level
  // as the start node or contained in an element at the same level.
  const {
    foundEndNodeSibling: foundEndNodeSiblingOnSameLevel,
    gatheredSiblings,
  } = gatherSiblingsUpToEndNode(startNode, endNode);

  if (foundEndNodeSiblingOnSameLevel) {
    return gatheredSiblings;
  }

  // Now go for the route that goes to the highest parent of the start node in the tree
  // that is not the parent of the end node.
  const startNodeParent = findFirstNonSharedParent({
    childElement: startNode,
    otherElement: endNode,
  });

  if (startNodeParent) {
    const {
      foundEndNodeSibling: foundEndNodeSiblingFromParentLevel,
      gatheredSiblings: gatheredSiblingsFromParent,
    } = gatherSiblingsUpToEndNode(startNodeParent, endNode);

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
export function groupHighlights(highlights, timestampAttr) {
  let order = [],
    chunks = {},
    grouped = [];

  highlights.forEach(function(hl) {
    let timestamp = hl.getAttribute(timestampAttr);

    if (typeof chunks[timestamp] === "undefined") {
      chunks[timestamp] = [];
      order.push(timestamp);
    }

    chunks[timestamp].push(hl);
  });

  order.forEach(function(timestamp) {
    let group = chunks[timestamp];

    grouped.push({
      chunks: group,
      timestamp: timestamp,
      toString: function() {
        return group
          .map(function(h) {
            return h.textContent;
          })
          .join("");
      },
    });
  });

  return grouped;
}

export function retrieveHighlights(params) {
  params = {
    andSelf: true,
    grouped: false,
    ...params,
  };

  let nodeList = params.container.querySelectorAll("[" + params.dataAttr + "]"),
    highlights = Array.prototype.slice.call(nodeList);

  if (params.andSelf === true && params.container.hasAttribute(params.dataAttr)) {
    highlights.push(params.container);
  }

  if (params.grouped) {
    highlights = groupHighlights(highlights, params.timestampAttr);
  }

  return highlights;
}

export function isElementHighlight(el, dataAttr) {
  return el && el.nodeType === NODE_TYPE.ELEMENT_NODE && el.hasAttribute(dataAttr);
}

export function addNodesToHighlightAfterElement({
  element,
  elementAncestor,
  highlightWrapper,
  highlightedClass,
}) {
  if (elementAncestor) {
    if (elementAncestor.classList.contains(highlightedClass)) {
      // Ensure we only take the children from a parent that is a highlight.
      elementAncestor.childNodes.forEach((childNode) => {
        // if (dom(childNode).isAfter(element)) {
        // }
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
export function getHighlightedTextForRange(range, excludeTags = IGNORE_TAGS) {
  // Strip out all carriage returns and excess html layout space.

  return dom(range.cloneContents())
    .textContentExcludingTags(arrayToLower(excludeTags))
    .replace(/\s{2,}/g, " ")
    .replace("\r\n", "")
    .replace("\r", "")
    .replace("\n", "");
}

/**
 * Collects the human-readable highlighted text for all nodes from the start text offset
 * relative to the root element.
 *
 * @param {{ rootElement: HTMLElement, startOffset: number, length: number}} params
 *  The root-relative parameters for extracting highlighted text.
 *
 * @return {string} The human-readable highlighted text for the given root element, offset and length.
 */
export function getHighlightedTextRelativeToRoot({
  rootElement,
  startOffset,
  length,
  excludeTags = IGNORE_TAGS,
  excludeWhiteSpaceAndReturns = false,
}) {
  const textContent = dom(rootElement).textContentExcludingTags(arrayToLower(excludeTags));
  const finalTextContent = excludeWhiteSpaceAndReturns ? normaliseText(textContent) : textContent;
  const highlightedRawText = finalTextContent.substring(
    startOffset,
    Number.parseInt(startOffset) + Number.parseInt(length),
  );

  const textNode = document.createTextNode(highlightedRawText);
  const tempContainer = document.createElement("div");
  tempContainer.appendChild(textNode);
  // Extract the human-readable text only.
  return tempContainer.innerText;
}

export function createDescriptors({
  rootElement,
  range,
  wrapper,
  excludeNodeNames = IGNORE_TAGS,
  dataAttr = DATA_ATTR,
  excludeWhiteSpaceAndReturns = false,
}) {
  const wrapperClone = wrapper.cloneNode(true);

  const normalisedStartOffset = excludeWhiteSpaceAndReturns
    ? normaliseOffset(range.startOffset, range.startContainer.textContent)
    : range.startOffset;

  const startOffset = getElementOffset(
    range.startContainer,
    rootElement,
    excludeNodeNames,
    excludeWhiteSpaceAndReturns,
    normalisedStartOffset,
    true,
  );

  const normalisedEndOffset = excludeWhiteSpaceAndReturns
    ? normaliseOffset(range.endOffset, range.endContainer.textContent)
    : range.endOffset;

  const endOffset =
    range.startContainer === range.endContainer
      ? startOffset + (normalisedEndOffset - normalisedStartOffset)
      : getElementOffset(
          range.endContainer,
          rootElement,
          excludeNodeNames,
          excludeWhiteSpaceAndReturns,
          normalisedEndOffset,
          false,
        );

  const length = endOffset - startOffset;

  wrapperClone.setAttribute(dataAttr, true);
  wrapperClone.setAttribute(START_OFFSET_ATTR, startOffset);
  wrapperClone.setAttribute(LENGTH_ATTR, length);

  wrapperClone.innerHTML = "";
  const wrapperHTML = wrapperClone.outerHTML;

  const descriptor = [
    wrapperHTML,
    // retrieve all the text content between the start and end offsets.
    getHighlightedTextForRange(range, excludeNodeNames),
    startOffset,
    length,
  ];
  return [descriptor];
}

/**
 * Returns the namespaces for the provided element given a list of namespaces
 * @param {HTMLElement} element
 * @param {Array<string>} namespaces
 *
 * @param {string}
 */

function getHighlighterNamespace(element, namespaces) {
  return namespaces.find((namespace) => !!element.getAttribute(namespace));
}

/**
 * Collects all the higher priority highlight nodes
 * when trying to focus or deserialise a portion of a highlight
 * into a given DOM node.
 *
 * @param {HTMLElement} rootElement The parent element.
 * @param {HTMLElement} node  The current node.
 * @param {Record<string, number>} priorities The priorities for multiple highlighters.
 * @param {string} namespaceDataAttribute The namespace data attribute for highlights for a provided text highlighter instance.
 *
 * @return {HTMLElement[]}
 */
export function findHigherPriorityHighlights(parentNode, node, priorities, namespaceDataAttribute) {
  const ancestors = dom(node).parentsUpTo(parentNode);
  const namespacePriority = priorities[namespaceDataAttribute];

  const higherPriorityHighlights = [];

  ancestors.forEach((element) => {
    const namespace = getHighlighterNamespace(element, Object.keys(priorities));
    if (namespace && priorities[namespace] > namespacePriority) {
      higherPriorityHighlights.push({ element, namespacePriority: priorities[namespace] });
    }
  });
  higherPriorityHighlights.sort((a, b) => {
    return b.namespacePriority - a.namespacePriority;
  });

  return higherPriorityHighlights.map(({ element }) => element);
}

/**
 * Determines whether the highlight with the provided unique id is the closest parent
 * to the provided node of all the potential highlight wrappers.
 *
 * In the case an id is not provided it will simply check if any highlight for the given
 * dataAttr namespace is the closest parent.
 *
 * @param {HTMLElement} node  The element we need to get parent information for.
 * @param {HTMLElement} rootElement The root element of the context to stop at.
 * @param {string} dataAttr The namespace data attribute for highlights for a provided text highlighter instance.
 * @param {string} id The unique id of the collection of elements representing a highlight.
 *
 * @return {boolean}
 */
function isClosestHighlightParent(node, rootElement, dataAttr = DATA_ATTR, id = null) {
  let isClosest = true;
  let currentNode = node.parentNode;

  let nodeHighlightParentCount = 0;
  while (currentNode && currentNode !== rootElement && isClosest) {
    if (isElementHighlight(currentNode, dataAttr)) {
      const isDifferentHighlight = id && !currentNode.classList.contains(id);
      nodeHighlightParentCount += 1;
      if (isDifferentHighlight) {
        // The case there is a closer parent than the highlight for the provided id.
        isClosest = false;
      } else {
        currentNode = currentNode.parentNode;
      }
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  // In the case the provided node doesn't have any highlight wrapper
  // parents in the tree, then the provided highlight is not considered
  // the closest parent as there aren't any.
  return nodeHighlightParentCount === 0 ? false : isClosest;
}

/**
 * Focuses a set of highlight elements for a given id by ensuring if it has descendants that are highlights
 * it is moved inside of the innermost highlight.
 *
 * The innermost highlight's styles will be applied and will be visible to the user
 * and given the "focus".
 *
 * To focus the red highlight the following:
 *
 * -- <red-highlight>
 * ---- <blue-highlight>
 * ------ <green-highlight>
 * ---------- Highlighted text
 *
 * becomes:
 *
 * -- <blue-highlight>
 * ---- <green-highlight>
 * ------ <red-highlight>
 * -------- Highlighted text
 *
 * and
 *
 * -- <red-highlight>
 * ---- Some text only highlighted in red
 * ---- <blue-highlight>
 * ------ Text in blue and red
 * ------ <green-highlight>
 * ---------- Rest of the highlight in red, green and blue
 *
 * becomes
 *
 * -- <red-highlight>
 * ---- Some text only highlighted in red
 * -- <blue-highlight>
 * ---- <red-highlight-copy-1>
 * ------ Text in blue and red
 * ---- <green-highlight>
 * ------ <red-highlight-copy-2>
 * -------- Rest of the highlight in red, green and blue
 *
 * @typedef NodeInfo
 * @type {object}
 * @property {HTMLElement} nodeInfo.node The html element (This will in most cases be a text node)
 * @property {number} nodeInfo.offset  The offset within the node to be highlighted
 * @property {number} nodeInfo.length  The length within the node that should be highlighted.
 *
 * @param {string} id The unique identifier of a highlight represented by one or more nodes in the DOM.
 * @param {NodeInfo[]}  nodeInfoList The highlight portion node information that should be focused.
 * @param {HTMLElement} highlightWrapper  The highlight wrapper representing the highlight to be focused.
 *
 * @param {HTMLElement} rootElement The root context element to normalise elements within.
 * @param {string} highlightedClass The class used to identify highlights.
 * @param {boolean} normalizeElements Whether or not elements should be normalised.
 * @param {Record<string, number>} priorities Provides priorities for multiple highlighters operating in the same root node.
 * @param {string} dataAttr The namespace data attribute for highlights for a provided text highlighter instance.
 */
export function focusHighlightNodes(
  id,
  nodeInfoList,
  highlightWrapper,
  rootElement,
  highlightedClass,
  normalizeElements,
  priorities,
  dataAttr = DATA_ATTR,
) {
  nodeInfoList.forEach((nodeInfo) => {
    const node = nodeInfo.node;
    // Only wrap the node if the closest highlight parent isn't one with the given id
    // and if the highlighter takes priority over highlights from other highlighter instances.
    const higherPriorityHighlights = findHigherPriorityHighlights(
      rootElement,
      node,
      priorities,
      dataAttr,
    );
    const isClosest = isClosestHighlightParent(node, rootElement, dataAttr, id);

    if (higherPriorityHighlights.length === 0 && !isClosest) {
      // Ensure any ancestors that aren't direct parents that represent the same highlight wrapper are removed.
      const ancestors = dom(node).parentsUpTo(rootElement);
      ancestors.forEach((ancestor) => {
        if (isElementHighlight(ancestor, dataAttr) && ancestor.classList.contains(id)) {
          // Ensure a copy of the ancestor is wrapped back around any
          // other children that do not contain the current node.
          ancestor.childNodes.forEach((ancestorChild) => {
            if (!ancestorChild.contains(node)) {
              const wrapper = highlightWrapper.cloneNode(true);
              dom(ancestorChild).wrap(wrapper);
            }
          });

          dom(ancestor).unwrap();
        }
      });

      // Now wrap the node or the part of the node the highlight covers directly with the wrapper.
      let nodeToBeWrapped = node;
      if (nodeInfo.offset > 0) {
        nodeToBeWrapped = node.splitText(nodeInfo.offset);
      }

      if (nodeInfo.length < nodeToBeWrapped.textContent.length) {
        nodeToBeWrapped.splitText(nodeInfo.length);
      }

      dom(nodeToBeWrapped).wrap(highlightWrapper.cloneNode(true));
    }
  });

  if (normalizeElements) {
    // Ensure we normalise all nodes in the root container to merge sibling elements
    // of the same highlight together that get copied for the purpose of focusing.
    dom(rootElement).normalizeElements(highlightedClass, dataAttr);
  }
}

/**
 * Validation for descriptors to ensure they are of the correct format to be used
 * by the Independencia highlighter.
 *
 * @param {array} descriptors  The descriptors to be validated.
 * @return {boolean} - if the descriptors are valid or not.
 */
export function validateIndependenciaDescriptors(descriptors) {
  if (descriptors && descriptors.length === 4) {
    return true;
  }
  return false;
}

/**
 * Extracts a sub-range from a given window selection range
 * that only includes the given root element and its descendants.
 *
 * @param {RangeLite} range The current text selection range for the window.
 * @param {HTMLElement} rootElement The root element to extract a sub-range for.
 *
 * @returns {Range | null} The sub-range or null if rootElement is not in the text selection.
 */
export function extractRangeRelativeToRootElement(range, rootElement) {
  // It's really important that we extract sub-ranges without manipulating
  // the window selection as there are situations where multiple highlighters
  // will be extracting sub-ranges from the current selection at the same time.
  // This is why we won't be using Range.extractContents.
  const hasStartContainer = dom(rootElement).contains(range.startContainer);
  const hasEndContainer = dom(rootElement).contains(range.endContainer);

  if (!hasStartContainer && !hasEndContainer) {
    return null;
  }

  if (hasStartContainer && !hasEndContainer) {
    console.log({ range });
    const endContainer = getLastDescendantTerminalNode(rootElement);
    const subRange = new Range();
    subRange.setStart(range.startContainer, range.startOffset);
    subRange.setEnd(endContainer, endContainer.textContent.length - 1);
    return subRange;
  }

  if (!hasStartContainer && hasEndContainer) {
    console.log({ range });
    const startContainer = getFirstDescendantTerminalNode(rootElement);
    const subRange = new Range();
    subRange.setStart(startContainer, 0);
    subRange.setEnd(range.endContainer, range.endOffset);
    return subRange;
  }

  return range;
}

/**
 * Finds the first descendant node without any children
 * of it's own starting with the given root node.
 *
 * @param {Node} rootNode The root node from which to find the first descendant terminal node for.
 *
 * @returns {Node} the first descendant terminal node.
 */
function getFirstDescendantTerminalNode(rootNode) {
  let currentNode = rootNode;
  while (currentNode.childNodes.length > 0) {
    currentNode = currentNode.childNodes[0];
  }
  return currentNode;
}

/**
 * Finds the last descendant node without any children
 * of it's own starting with the given root node.
 *
 * @param {Node} rootNode The root node from which to find the last descendant terminal node for.
 *
 * @returns {Node} the last descendant terminal node.
 */
function getLastDescendantTerminalNode(rootNode) {
  let currentNode = rootNode;
  while (currentNode.childNodes.length > 0) {
    currentNode = currentNode.childNodes[currentNode.childNodes.length - 1];
  }
  return currentNode;
}
