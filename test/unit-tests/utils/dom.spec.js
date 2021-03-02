import dom from "../../../src/utils/dom";
import {
  div,
  style,
  script,
  b,
  i,
  span,
  text,
  imgWithAttrs,
  img,
  comment,
} from "../../utils/dom-elements";

describe("dom utility functionality", () => {
  let root;
  beforeEach(() => {
    root = document.getElementById("root");
  });

  afterEach(() => {
    root.innerHTML = "";
  });

  describe("#textContentExcludingTags()", () => {
    it("should exclude text content from the specified excluded tags that live in the parent element", () => {
      const contents = div(
        "It is time to put away our weapons",
        style(".header { background-color: black; }"),
        span(" and look to create a society of ", b("peace"), "."),
        div(" Let us not dwell on our ", i("differences")),
        script("function init() { alert('Something happened'); }"),
        div(" and instead seek to build on what we have in common."),
      );
      root.appendChild(contents);
      expect(dom(root).textContentExcludingTags(["style", "script"])).toEqual(
        "It is time to put away our weapons and look to create a society of peace. " +
          "Let us not dwell on our differences and instead seek to build on what we have in common.",
      );
    });
  });

  describe("#unwrap()", () => {
    it("should remove element being unwrapped from the dom", () => {
      const deep = text("Deep");
      const time = span(" Time");
      const children = [
        span("Chapter 5"),
        deep,
        time
      ];

      children.forEach((child) => root.appendChild(child));
      const rootWrapped = dom(root);
      
      children.forEach((child, i) => {
        expect(rootWrapped.getChildIndex(child)).toBe(i);
      });
  
      dom(time).unwrap();
      expect(rootWrapped.contains(deep)).toBeTrue();
      expect(rootWrapped.contains(time)).toBeFalse();
      expect(rootWrapped.textContentExcludingTags([])).toEqual('Chapter 5Deep Time');
    });
  });

  describe("#getChildIndex()", () => {
    it("should get the correct index for in the element children list for a set of child nodes", () => {
      const children = [
        div("This is div 1"),
        span("This is element 2"),
        span("This is a ", b("bold"), " element"),
        i("Italics element here"),
        text("This is a text node element!"),
      ];

      children.forEach((child) => root.appendChild(child));

      const rootWrapped = dom(root);
      children.forEach((child, i) => {
        expect(rootWrapped.getChildIndex(child)).toBe(i);
      });
    });
  });

  describe("#turnOffEventHandlersForElement()", () => {
    it("should remove a single event attribute from an image", () => {
      const contents = imgWithAttrs({ onerror: () => "event called" })();

      const contentsWithoutEventHandlers = imgWithAttrs({ "temp-id": "1" })();
      let events = dom(contents).turnOffEventHandlersForElement();
      events.tempId = "1";
      expect(events).toEqual({
        listOfAttributes: [
          {
            attribute: "onerror",
            value: `function onerror() {
          return \"event called\";
        }`,
          },
        ],
        tempId: "1",
      });
      contents.setAttribute("temp-id", "1");
      expect(contents).toEqual(contentsWithoutEventHandlers);
    });

    it("should remove a multiple event attribute from an image", () => {
      const contents = imgWithAttrs({
        onerror: () => "event called",
        onevent: () => "event2 called",
      })();

      const contentsWithoutEventHandlers = imgWithAttrs({ "temp-id": "1" })();
      let events = dom(contents).turnOffEventHandlersForElement();
      events.tempId = "1";
      expect(events).toEqual({
        listOfAttributes: [
          {
            attribute: "onerror",
            value: `function onerror() {
          return \"event called\";
        }`,
          },
          {
            attribute: "onevent",
            value: `function onevent() {
          return \"event2 called\";
        }`,
          },
        ],
        tempId: "1",
      });
      contents.setAttribute("temp-id", "1");
      expect(contents).toEqual(contentsWithoutEventHandlers);
    });
  });

  describe("#addAttributes()", () => {
    it("should add a single event attribute to an image", () => {
      const contentsWithAttributes = imgWithAttrs({ onerror: () => "event called" })();

      const contents = img();

      let events = [
        {
          attribute: "onerror",
          value: `function onerror() {
          return \"event called\";
        }`,
        },
      ];
      dom(contents).addAttributes(events);
      expect(contents).toEqual(contentsWithAttributes);
    });

    it("should add multiple event attributes to an image", () => {
      const contentsWithAttributes = imgWithAttrs({
        onerror: () => "event called",
        onevent: () => "event2 called",
      })();

      const contents = img();

      let events = [
        {
          attribute: "onerror",
          value: `function onerror() {
          return \"event called\";
        }`,
        },
        {
          attribute: "onevent",
          value: `function onevent() {
          return \"event2 called\";
        }`,
        },
      ];
      dom(contents).addAttributes(events);
      expect(contents).toEqual(contentsWithAttributes);
    });
  });
  describe("#turnOffEventHandlers()", () => {
    it("should remove a single event attribute from an image nested in a div", () => {
      const contents = div(imgWithAttrs({ id: "image1", onerror: () => "event called" })());

      const contentsWithoutEventHandlers = div(imgWithAttrs({ id: "image1", "temp-id": "1" })());
      let events = [];
      dom(contents).turnOffEventHandlers(events);
      events[0].tempId = "1";
      expect(events).toEqual([
        {
          listOfAttributes: [
            {
              attribute: "onerror",
              value: `function onerror() {
          return \"event called\";
        }`,
            },
          ],
          tempId: "1",
        },
      ]);
      contents.childNodes[0].setAttribute("temp-id", "1");
      expect(contents).toEqual(contentsWithoutEventHandlers);
    });

    it("should remove a multiple event attributes from multiple images nested in multiple divs", () => {
      const contents = div(
        "test1",
        comment("section1"),
        div(
          "test2",
          div("test3"),
          imgWithAttrs({ id: "image1", onerror: () => "event1 called" })(),
        ),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          onerror: () => "event2 called",
          onevent: () => "event3 called",
        })(),
        "test4",
      );

      const contentsWithoutEventHandlers = div(
        "test1",
        comment("section1"),
        div("test2", div("test3"), imgWithAttrs({ id: "image1", "temp-id": "1" })()),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          "temp-id": "2",
        })(),
        "test4",
      );

      let events = [];
      dom(contents).turnOffEventHandlers(events);
      events[0].tempId = "1";
      events[1].tempId = "2";
      expect(events).toEqual([
        {
          listOfAttributes: [
            {
              attribute: "onerror",
              value: `function onerror() {
          return \"event1 called\";
        }`,
            },
          ],
          tempId: "1",
        },
        {
          listOfAttributes: [
            {
              attribute: "onerror",
              value: `function onerror() {
          return \"event2 called\";
        }`,
            },
            {
              attribute: "onevent",
              value: `function onevent() {
          return \"event3 called\";
        }`,
            },
          ],
          tempId: "2",
        },
      ]);
      contents.childNodes[2].childNodes[2].setAttribute("temp-id", "1");
      contents.childNodes[4].setAttribute("temp-id", "2");
      expect(contents).toEqual(contentsWithoutEventHandlers);
    });
  });
  describe("#turnOnEventHandlers()", () => {
    it("should add a single event attribute to an image nested in a div", () => {
      const contentsWithEventHandlers = div(
        imgWithAttrs({ id: "image1", onerror: () => "event called" })(),
      );

      const contents = div(imgWithAttrs({ id: "image1", "temp-id": "1" })());

      let events = [
        {
          listOfAttributes: [
            {
              attribute: "onerror",
              value: `function onerror() {
          return \"event called\";
        }`,
            },
          ],
          tempId: "1",
        },
      ];
      dom(contents).turnOnEventHandlers(events);
      expect(contents).toEqual(contentsWithEventHandlers);
    });

    it("should add multiple event attributes to multiple images nested in multiple divs", () => {
      const contentsWithEventHandlers = div(
        "test1",
        comment("section1"),
        div(
          "test2",
          div("test3"),
          imgWithAttrs({ id: "image1", onerror: () => "event1 called" })(),
        ),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          onerror: () => "event2 called",
          onevent: () => "event3 called",
        })(),
        "test4",
      );

      const contents = div(
        "test1",
        comment("section1"),
        div("test2", div("test3"), imgWithAttrs({ id: "image1", "temp-id": "1" })()),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          "temp-id": "2",
        })(),
        "test4",
      );

      let events = [
        {
          listOfAttributes: [
            {
              attribute: "onerror",
              value: `function onerror() {
          return \"event1 called\";
        }`,
            },
          ],
          tempId: "1",
        },
        {
          listOfAttributes: [
            {
              attribute: "onerror",
              value: `function onerror() {
          return \"event2 called\";
        }`,
            },
            {
              attribute: "onevent",
              value: `function onevent() {
          return \"event3 called\";
        }`,
            },
          ],
          tempId: "2",
        },
      ];
      dom(contents).turnOnEventHandlers(events);
      expect(contents).toEqual(contentsWithEventHandlers);
    });

    it("should remove events then add them again for multiple images nested in multiple divs", () => {
      const contentsWithEventHandlers = div(
        "test1",
        comment("section1"),
        div(
          "test2",
          div("test3"),
          imgWithAttrs({ id: "image1", onerror: () => "event1 called" })(),
        ),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          onerror: () => "event2 called",
          onevent: () => "event3 called",
        })(),
        "test4",
      );
      const contents = div(
        "test1",
        comment("section1"),
        div(
          "test2",
          div("test3"),
          imgWithAttrs({ id: "image1", onerror: () => "event1 called" })(),
        ),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          onerror: () => "event2 called",
          onevent: () => "event3 called",
        })(),
        "test4",
      );

      const contentsWithoutEventHandlers = div(
        "test1",
        comment("section1"),
        div("test2", div("test3"), imgWithAttrs({ id: "image1", "temp-id": "1" })()),
        comment("section2"),
        imgWithAttrs({
          id: "image2",
          "temp-id": "2",
        })(),
        "test4",
      );

      let events = [];
      dom(contents).turnOffEventHandlers(events);
      events[0].tempId = "1";
      events[1].tempId = "2";

      contents.childNodes[2].childNodes[2].setAttribute("temp-id", "1");
      contents.childNodes[4].setAttribute("temp-id", "2");
      expect(contents).toEqual(contentsWithoutEventHandlers);

      dom(contents).turnOnEventHandlers(events);
      expect(contents).toEqual(contentsWithEventHandlers);
    });
  });
});
