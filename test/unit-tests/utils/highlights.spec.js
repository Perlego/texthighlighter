import {
  getHighlightedTextRelativeToRoot,
  getHighlightedTextForRange,
  findNodesAndOffsets,
  getElementOffset,
  validateIndependenciaDescriptors,
  findHigherPriorityHighlights,
  extractRangeRelativeToRootElement,
} from "../../../src/utils/highlights";
import {
  span,
  b,
  i,
  div,
  img,
  style,
  script,
  docFrag,
  text,
  highlight,
} from "../../utils/dom-elements";

/**
 * Extracts text from nodes so we can do equality comparisons
 * when DOM nodes are involved.
 *
 * @param {*} nodes
 */
const prepareNodes = (nodes) =>
  nodes.map(({ node, ...rest }) => ({
    ...rest,
    nodeText: node.textContent,
  }));

function createShouldShowHighlightNodeFixture() {
  const targetNode1 = text("Fantastic");
  const targetNode2 = text("Wonderful");
  const parentDiv = div(
    div("\n     Something excellent is happening \n"),
    span(text("\n  "), i("here\n   !"), text("\n    ")),
    highlight(
      {
        color: "green",
        id: "test-overlapping-highlights-3",
        startOffset: 13,
        length: 9,
        dataAttr: "data-highlighter-3",
      },
      "good",
      highlight(
        {
          color: "green",
          id: "test-overlapping-highlights-1",
          startOffset: 13,
          length: 9,
          dataAttr: "data-highlighter-1",
        },
        "awesome",
        highlight(
          {
            color: "red",
            id: "test-overlapping-highlights-4",
            startOffset: 10,
            length: 9,
            dataAttr: "data-highlighter-4",
          },
          "marvellous",
          highlight(
            {
              color: "green",
              id: "test-overlapping-highlights-2",
              startOffset: 13,
              length: 9,
              dataAttr: "data-highlighter-2",
            },
            targetNode1,
          ),
        ),
      ),
    ),
    text("\n\n"),
    targetNode2,
  );
  return { targetNode1, targetNode2, parentDiv };
}

function createSubRangeContentFixtures() {
  const rangeStartNode = text("This is a text node");
  const subRange1EndNode = text("This is the end text node for subrange 1");
  const rootElement2 = div(div(rangeStartNode), div(span("Some text!")), div(subRange1EndNode));
  const rangeEndNode = text("This is the end text node!");
  const subRange2StartNode = text("This is the start text node for subrange 2");
  const rootElement3 = div(
    subRange2StartNode,
    div(div(span("A span here!")), "something"),
    div(rangeEndNode),
  );

  const parentDiv = div(div("Some text here"), rootElement2, rootElement3);

  const range = {
    startContainer: rangeStartNode,
    startOffset: 7,
    endContainer: rangeEndNode,
    endOffset: 12,
  };

  const expectedSubRange2 = {
    startContainer: rangeStartNode,
    startOffset: 7,
    endContainer: subRange1EndNode,
    endOffset: subRange1EndNode.textContent.length - 1,
  };

  const expectedSubRange3 = {
    startContainer: subRange2StartNode,
    startOffset: 0,
    endContainer: rangeEndNode,
    endOffset: 12,
  };

  return {
    parentDiv,
    range,
    rootElement1: parentDiv,
    expectedSubRange1: range,
    rootElement2,
    expectedSubRange2,
    rootElement3,
    expectedSubRange3,
  };
}

describe("highlighting utility functionality", () => {
  let root;
  beforeEach(() => {
    root = document.getElementById("root");
  });

  afterEach(() => {
    root.innerHTML = "";
  });

  describe("#getElementOffset()", () => {
    it("should get the correct element offset excluding specified node types", () => {
      const child = span("This is the child element");
      const contents = div(
        style(".header { background-color: #fff; }"),
        span("a span"),
        div(div(script("function init() { alert('We have done something!') }"))),
        child,
        b("Some bold text after"),
      );
      root.appendChild(contents);
      expect(
        getElementOffset(child, root, [
          "SCRIPT",
          "STYLE",
          "SELECT",
          "OPTION",
          "BUTTON",
          "OBJECT",
          "APPLET",
          "VIDEO",
          "AUDIO",
          "CANVAS",
          "EMBED",
          "PARAM",
          "METER",
          "PROGRESS",
        ]),
      ).toEqual(6);
    });
  });

  describe("#getHighlightedTextRelativeToRoot()", () => {
    it("should extract the highlighted text across a range of nodes at multiple levels", () => {
      const contents = span(
        b("This ", i("is"), " the ", span("begin", i("ning")), " ", i("something wonderful,")),
        span(span(" improving the foundations"), " for what is to come"),
      );
      root.appendChild(contents);
      expect(
        getHighlightedTextRelativeToRoot({
          rootElement: root,
          startOffset: 21,
          length: 35,
        }),
      ).toEqual(" something wonderful, improving the");
    });
  });

  describe("#getHighlightTextForRange()", () => {
    it("should extract the highlighted text from the provided range ignoring excluded tags", () => {
      const range = {
        cloneContents: () => {
          return docFrag(
            div("This really is the beginning"),
            script("function init() { alert('Something!') }"),
            div(" ", span(b("of something wonderful"))),
            div(div(div(style(".header { background: black; }")))),
            div(", improving the ", b(i("foundations")), " for what is to come"),
          );
        },
      };

      expect(
        getHighlightedTextForRange(range, [
          "SCRIPT",
          "STYLE",
          "SELECT",
          "OPTION",
          "BUTTON",
          "OBJECT",
          "APPLET",
          "VIDEO",
          "AUDIO",
          "CANVAS",
          "EMBED",
          "PARAM",
          "METER",
          "PROGRESS",
        ]),
      ).toEqual(
        "This really is the beginning of something wonderful, improving the foundations for what is to come",
      );
    });
  });

  describe("#findNodesAndOffsets()", () => {
    it("should collect a portion of a single node that is highlighted", () => {
      const contents = div(
        b("This is the start"),
        i(" of something wonderful."),
        div("Trust me when I say we are improving things"),
      );
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 21,
          length: 5,
        },
        root,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          offset: 4,
          nodeText: " of something wonderful.",
          normalisedText: " of something wonderful.",
          length: 5,
        },
      ]);
    });

    it("should collect the end portion of a single node that is highlighted", () => {
      const contents = div(
        b("This is the start"),
        i(" of something wonderful."),
        div("Trust me when I say we are improving things"),
      );
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 29,
          length: 12,
        },
        root,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          offset: 12,
          nodeText: " of something wonderful.",
          normalisedText: " of something wonderful.",
          length: 12,
        },
      ]);
    });

    it("should collect the start portion of a single node that is highlighted", () => {
      const contents = div(
        b("This is the start"),
        i(" of something wonderful."),
        div("Trust me when I say we are improving things"),
      );
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 17,
          length: 5,
        },
        root,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          offset: 0,
          nodeText: " of something wonderful.",
          normalisedText: " of something wonderful.",
          length: 5,
        },
      ]);
    });

    it("should collect a full single node that is highlighted", () => {
      const contents = div(
        b("This is the start"),
        i(" of something wonderful."),
        div("Trust me when I say we are improving things"),
      );
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 17,
          length: 24,
        },
        root,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          offset: 0,
          nodeText: " of something wonderful.",
          normalisedText: " of something wonderful.",
          length: 24,
        },
      ]);
    });

    it("should collect multiple nodes that form a part of a single highlight and ignore terminal element nodes", () => {
      const contents = div(
        b("This is the beginning "),
        "of something ",
        div("That is very unusual."),
        img(),
        span(" We are not ", i("very happy with ")),
        div(div(span(b("what went before.")))),
        div(
          "We will be the revolutionaries highlighters around the world have been crying out for.",
        ),
      );
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 24,
          length: 50,
        },
        root,
      );

      expect(prepareNodes(nodes)).toEqual([
        {
          length: 11,
          nodeText: "of something ",
          normalisedText: "of something ",
          offset: 2,
        },
        {
          length: 21,
          nodeText: "That is very unusual.",
          normalisedText: "That is very unusual.",
          offset: 0,
        },
        {
          length: 12,
          nodeText: " We are not ",
          normalisedText: " We are not ",
          offset: 0,
        },
        {
          length: 6,
          nodeText: "very happy with ",
          normalisedText: "very happy with ",
          offset: 0,
        },
      ]);
    });

    it(
      "should collect multiple nodes that form a part of a single highlight and ignore nodes " +
        "that should be excluded as specified by the caller",
      () => {
        const contents = div(
          b("This is the beginning "),
          script("function init() { alert('Something happened!') }"),
          "of something ",
          div("That is very unusual."),
          div(div(div(style(".header { position: absolute; top: 0; }")))),
          img(),
          span(" We are not ", i("very happy with ")),
          div(div(span(b("what went before.")))),
          div(
            "We will be the revolutionaries highlighters around the world have been crying out for.",
          ),
        );

        root.appendChild(contents);
        const { nodesAndOffsets: nodes } = findNodesAndOffsets(
          {
            offset: 24,
            length: 50,
          },
          root,
          [
            "SCRIPT",
            "STYLE",
            "SELECT",
            "OPTION",
            "BUTTON",
            "OBJECT",
            "APPLET",
            "VIDEO",
            "AUDIO",
            "CANVAS",
            "EMBED",
            "PARAM",
            "METER",
            "PROGRESS",
          ],
        );

        expect(prepareNodes(nodes)).toEqual([
          {
            length: 11,
            nodeText: "of something ",
            normalisedText: "of something ",
            offset: 2,
          },
          {
            length: 21,
            nodeText: "That is very unusual.",
            normalisedText: "That is very unusual.",
            offset: 0,
          },
          {
            length: 12,
            nodeText: " We are not ",
            normalisedText: " We are not ",
            offset: 0,
          },
          {
            length: 6,
            nodeText: "very happy with ",
            normalisedText: "very happy with ",
            offset: 0,
          },
        ]);
      },
    );

    it("should not get the closest sibling if the current node is the parent node", () => {
      const parentDiv = div(div("Trust"), span(i("Some")));
      const siblingDiv = div("Cat");
      const contents = div(parentDiv, siblingDiv);
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 0,
          length: 10,
        },
        parentDiv,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          length: 5,
          nodeText: "Trust",
          offset: 0,
          normalisedText: "Trust",
        },
        {
          length: 4,
          nodeText: "Some",
          offset: 0,
          normalisedText: "Some",
        },
      ]);
    });

    it("should return the correct nodes and exclude spaces followed by spaces when the previous node ends with a carriage return", () => {
      const parentDiv = div(div("Some cat\n"), span("    here"));
      const contents = div(parentDiv);
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 0,
          length: 12,
        },
        parentDiv,
        [],
        true,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          length: 9,
          nodeText: "Some cat\n",
          offset: 0,
          normalisedText: "Some cat",
        },
        {
          length: 8,
          nodeText: "    here",
          offset: 0,
          normalisedText: "here",
        },
      ]);
    });

    it("should return the correct nodes and don't exclude spaces followed by spaces when the previous node doesn't end with a carriage return", () => {
      const parentDiv = div(div("Some dog"), span("    here"));
      const contents = div(parentDiv);
      root.appendChild(contents);
      const { nodesAndOffsets: nodes } = findNodesAndOffsets(
        {
          offset: 0,
          length: 16,
        },
        parentDiv,
        [],
        true,
      );
      expect(prepareNodes(nodes)).toEqual([
        {
          length: 8,
          nodeText: "Some dog",
          offset: 0,
          normalisedText: "Some dog",
        },
        {
          length: 8,
          nodeText: "    here",
          offset: 0,
          normalisedText: "    here",
        },
      ]);
    });

    it(
      "should correctly calculate an offset and length " +
        "excluding all carriage returns and one or more white spaces that follow a carriage return",
      () => {
        const parentDiv = div(
          div("\n     Something excellent is happening \n"),
          span(text("\n  "), i("here\n   !"), text("\n    ")),
          text("\n\n"),
        );
        const contents = div(parentDiv);
        root.appendChild(contents);
        const { nodesAndOffsets, allText } = findNodesAndOffsets(
          {
            offset: 0,
            length: 38,
          },
          parentDiv,
          [],
          true,
        );
        expect(allText).toEqual("Something excellent is happening here!");
        const nodesOutput = prepareNodes(nodesAndOffsets);
        expect(nodesOutput).toEqual([
          {
            nodeText: "\n     Something excellent is happening \n",
            offset: 6,
            length: 34,
            normalisedText: "Something excellent is happening ",
          },
          {
            nodeText: "\n  ",
            normalisedText: "",
            offset: 0,
            length: 3,
          },
          {
            nodeText: "here\n   !",
            offset: 0,
            length: 9,
            normalisedText: "here!",
          },
        ]);
      },
    );
  });

  describe("#findHigherPriorityHighlights()", () => {
    it(
      "should find all higher priority highlights when there are" +
        " some highlights with a lower priority and some with a higher one",
      () => {
        const { targetNode1: targetNode, parentDiv } = createShouldShowHighlightNodeFixture();
        const otherHighlights = findHigherPriorityHighlights(
          parentDiv,
          targetNode,
          {
            "data-highlighter-1": 5,
            "data-highlighter-2": 114,
            "data-highlighter-3": 116,
            "data-highlighter-4": 115,
          },
          "data-highlighter-2",
        );
        expect(otherHighlights.length).toEqual(2);
        // Order must be by highest priority first.
        expect(otherHighlights[0].getAttribute("data-highlighter-3")).not.toBeNull();
        expect(otherHighlights[1].getAttribute("data-highlighter-4")).not.toBeNull();
      },
    );

    it(
      "should not find any higher priority highlights from another highlighter " +
        "when the current highlighter has the highest priority",
      () => {
        const { targetNode1: targetNode, parentDiv } = createShouldShowHighlightNodeFixture();
        const otherHighlights = findHigherPriorityHighlights(
          parentDiv,
          targetNode,
          {
            "data-highlighter-1": 5,
            "data-highlighter-2": 114,
            "data-highlighter-3": 103,
            "data-highlighter-4": 100,
          },
          "data-highlighter-2",
        );
        expect(otherHighlights.length).toBe(0);
      },
    );

    it(
      "should not find any other highlights for a node when another highlighter" +
        " has a higher priority but doesn't have any highlights that include the current node",
      () => {
        const { targetNode2: targetNode, parentDiv } = createShouldShowHighlightNodeFixture();
        const otherHighlights = findHigherPriorityHighlights(
          parentDiv,
          targetNode,
          {
            "data-highlighter-2": 5,
            "data-highlighter-1": 114,
            "data-highlighter-3": 112,
            "data-highlighter-4": 125,
          },
          "data-highlighter-2",
        );
        expect(otherHighlights.length).toBe(0);
      },
    );
  });

  describe("#validateIndependenciaDescriptors()", () => {
    it("Should fail for descriptors of incorrect length", () => {
      let descriptors = ['<span className="highlighted"></span>', "test1", 10];
      expect(validateIndependenciaDescriptors(descriptors)).toEqual(false);
      descriptors = ['<span className="highlighted"></span>', "test1", 10, 5, 5];
      expect(validateIndependenciaDescriptors(descriptors)).toEqual(false);
    });

    it("Should work for descriptors of the correct length", () => {
      let descriptors = ['<span className="highlighted"></span>', "test1", 10, 5];
      expect(validateIndependenciaDescriptors(descriptors)).toEqual(true);
    });
  });

  describe("#extractRangeRelativeToRootElement()", () => {
    it("should return a range as-is when the entire selection is contained within the given root element", () => {
      const { parentDiv, rootElement1, expectedSubRange1, range } = createSubRangeContentFixtures();
      root.appendChild(parentDiv);

      const finalRange = extractRangeRelativeToRootElement(range, rootElement1);

      expect(finalRange.startContainer).toEqual(expectedSubRange1.startContainer);
      expect(finalRange.endContainer).toEqual(expectedSubRange1.endContainer);
      expect(finalRange.startOffset).toEqual(expectedSubRange1.startOffset);
      expect(finalRange.endOffset).toEqual(expectedSubRange1.endOffset);
    });

    it("should return a sub-range when the start of the selection is contained within the given root element", () => {
      const { parentDiv, rootElement2, expectedSubRange2, range } = createSubRangeContentFixtures();
      root.appendChild(parentDiv);

      const finalRange = extractRangeRelativeToRootElement(range, rootElement2);

      expect(finalRange.startContainer).toEqual(expectedSubRange2.startContainer);
      expect(finalRange.endContainer).toEqual(expectedSubRange2.endContainer);
      expect(finalRange.startOffset).toEqual(expectedSubRange2.startOffset);
      expect(finalRange.endOffset).toEqual(expectedSubRange2.endOffset);
    });

    it("should return a sub-range when the end of the selection is contained within the given root element", () => {
      const { parentDiv, rootElement3, expectedSubRange3, range } = createSubRangeContentFixtures();
      root.appendChild(parentDiv);

      const finalRange = extractRangeRelativeToRootElement(range, rootElement3);

      expect(finalRange.startContainer).toEqual(expectedSubRange3.startContainer);
      expect(finalRange.endContainer).toEqual(expectedSubRange3.endContainer);
      expect(finalRange.startOffset).toEqual(expectedSubRange3.startOffset);
      expect(finalRange.endOffset).toEqual(expectedSubRange3.endOffset);
    });
  });
});
