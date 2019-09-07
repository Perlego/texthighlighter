import fixtures from "../fixtures/focus";
import TextHighlighter from "../../../src/text-highlighter";
import { setContents } from "../../utils/dom-helpers";

describe("focusing on different highlights", () => {
  let root, highlighter;

  beforeAll(() => {
    root = document.getElementById("root");
  });

  beforeEach(() => {
    highlighter = new TextHighlighter(root, { version: "independencia" });
  });

  afterEach(() => {
    root.innerHTML = "";
  });

  /**
   * Tests focusing on overlapping highlights
   * Procedure:
   * [1] Load fixture named: params.fixturePrefix + '.' + params.fixturePostfixBeforeFocus (fixture with highlight id 2 in focus) and set that to the root element.
   * [2] Load fixture named: params.fixturePrefix + '.' + params.fixturePostfixAfterFocus (fixture with highlight id 1 in focus).
   * [3] Focus on highlight using params.ids[0].
   * [4] Compare HTML of result with fixture from step [2].
   * [5] Focus on a second ID using params.ids[1] if it exists (this is the highlight that was originally focused in the params.fixturePostfixBeforeFocus)
   * [6] Compare HTML of result with fixture from step [1].
   *
   * @typedef Highlight
   * @type {object}
   * @property {string} id
   * @property {number} offset
   * @property {number} length
   *
   * @param params
   * @param {string} params.title - test title
   * @param {Highlight[]} params.highlights - The unique identifier for collections of highlight elements representing the same highlight that we are to focus on.
   * @param {string} params.fixturePrefix - fixture name prefix
   * @param {string} params.fixturePostfixBeforeFocus - fixture name postfix used as the before focus comparison
   */
  const testFocus = params => {
    it(`${params.fixturePrefix}:before(${params.fixturePostfixAfterFocus}):after(${params.fixturePostfixBeforeFocus}): ${params.title}`, () => {
      const fixture =
        fixtures[`${params.fixturePrefix}.${params.fixturePostfixBeforeFocus}`];
      setContents(root, fixture());

      const { id, offset, length } = params.highlights[0];
      highlighter.focusUsingId(id);

      expect({ id, offset, length }).toHaveFocus(root);

      // The second id is of the highlight that was originally focused.
      if (params.highlights.length > 1) {
        const {
          id: id2,
          offset: offset2,
          length: length2
        } = params.highlights[1];
        highlighter.focusUsingId(id2);

        expect({ id: id2, offset: offset2, length: length2 }).toHaveFocus(root);
      }
    });
  };

  testFocus({
    title:
      "should focus on a single highlight that does not overlap and therefore have no difference from the original fixture",
    fixturePrefix: "01.focus",
    highlights: [{ id: "test-single-highlight", offset: 6, length: 26 }],
    fixturePostfixBeforeFocus: "singleHighlight"
  });

  testFocus({
    title:
      "should focus on multiple highlights that do not overlap so therefore have no difference from the original fixture",
    fixturePrefix: "01.focus",
    highlights: [
      { id: "test-multiple-highlights-1", offset: 6, length: 26 },
      { id: "test-multiple-highlights-2", offset: 60, length: 1 }
    ],
    fixturePostfixBeforeFocus: "multipleHighlights"
  });

  testFocus({
    title:
      "should focus on a highlight that overlaps an image, therefore there should be no difference from the original fixture",
    fixturePrefix: "02.focus",
    highlights: [{ id: "test-overlapping-highlights", offset: 6, length: 26 }],
    fixturePostfixBeforeFocus: "overlapping"
  });

  testFocus({
    title:
      "should focus on a nested highlight and focus on it's surrounding parent highlight",
    fixturePrefix: "02.focus",
    highlights: [
      { id: "test-overlapping-highlights", offset: 6, length: 26 },
      { id: "test-overlapping-highlights-nested-1", offset: 12, length: 12 }
    ],
    fixturePostfixBeforeFocus: "nestedFocus"
  });

  testFocus({
    title: "should focus on 2 different overlapping highlights",
    fixturePrefix: "03.focus",
    highlights: [
      { id: "test-overlapping-highlights-2", offset: 17, length: 15 },
      { id: "test-overlapping-highlights-1", offset: 12, length: 16 }
    ],
    fixturePostfixBeforeFocus: "overlappingFocusFirst"
  });

  testFocus({
    title:
      "should focus on 2 different overlapping highlights which are overlapping with another, focus on highlight 1 and 2",
    fixturePrefix: "04.focus",
    highlights: [
      { id: "test-overlapping-highlights-2", offset: 14, length: 5 },
      { id: "test-overlapping-highlights-1", offset: 12, length: 15 }
    ],
    fixturePostfixBeforeFocus: "overlappingMultipleFocusFirst"
  });

  testFocus({
    title:
      "should focus on 2 different overlapping highlights which are overlapping with another, focus on highlight 1 and 3",
    fixturePrefix: "05.focus",
    highlights: [
      { id: "test-overlapping-highlights-3", offset: 17, length: 15 },
      { id: "test-overlapping-highlights-1", offset: 12, length: 15 }
    ],
    fixturePostfixBeforeFocus: "overlappingMultipleFocusFirst"
  });

  testFocus({
    title:
      "should focus on 2 different overlapping highlights which are overlapping with another, focus on highlight 3 and 2",
    fixturePrefix: "06.focus",
    highlights: [
      { id: "test-overlapping-highlights-2", offset: 13, length: 5 },
      { id: "test-overlapping-highlights-3", offset: 16, length: 15 }
    ],
    fixturePostfixBeforeFocus: "overlappingMultipleFocusThird"
  });

  // TODO: Add test cases for elements being focused that have no dom representation. (Based on descriptors)
});
