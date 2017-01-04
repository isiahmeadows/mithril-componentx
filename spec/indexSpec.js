import {Component, merge} from "../src/index.js";
import chai from "chai";
import {mocks} from "mock-browser";


let expect = chai.expect;

let noop = function () {};


describe("merge", () => {
	it("merges source with destination", () => {
		let destination = {
			a: 1,
			b: {
				c: 1,
				d: 1
			}
		};
		let source = {
			a: 0,
			b: {
				e: 0
			},
			f: 0
		};

		let expected = {
			a: 0,
			b: {
				c: 1,
				d: 1,
				e: 0
			},
			f: 0
		};

		expect(merge(destination, source)).to.eql(expected);
	});

	it("works with empty destination", () => {
		let destination = {};
		let source = {
			a: 0,
			b: {
				e: 0
			},
			f: 0
		};

		let expected = {
			a: 0,
			b: {
				e: 0
			},
			f: 0
		};

		expect(merge(destination, source)).to.eql(expected);
	});
});


describe("Component", () => {
	describe("localizeSelector", () => {});

	describe("genStyle", () => {
		let inputStyle, expectedStyle;

		beforeEach(() => {
			inputStyle = {
				div: {
					xxx: "xxx",
					yyy: "yyy"
				},
				"div.class, p,#aId": {
					xxx: "xxx rgb(1, 2, 3)"
				},
				"div.class": {
					xxx: "xxx"
				},
				"div#id": {
					xxx: "xxx"
				},
				".class": {
					xxx: "xxx"
				},
				"#id": {
					xxx: "xxx"
				},
				"@media xxx": {
					div: {
						xxx: "xxx"
					},
					".class": {
						xxx: "xxx"
					}
				},
				"@keyframe xxx": {
					"0%": {
						xxx: "xxx"
					},
					from: {
						xxx: "xxx"
					},
					to: {
						xxx: "xxx"
					}
				}
			};

			expectedStyle = `
div[data-component=Component] {
  xxx: xxx;
  yyy: yyy;
}
div.class[data-component=Component], p[data-component=Component], #aId[data-component=Component] {
  xxx: xxx rgb(1, 2, 3);
}
div.class[data-component=Component] {
  xxx: xxx;
}
div#id[data-component=Component] {
  xxx: xxx;
}
.class[data-component=Component] {
  xxx: xxx;
}
#id[data-component=Component] {
  xxx: xxx;
}
@media xxx {
  div[data-component=Component] {
    xxx: xxx;
  }
  .class[data-component=Component] {
    xxx: xxx;
  }
}
@keyframe xxx {
  0% {
    xxx: xxx;
  }
  from {
    xxx: xxx;
  }
  to {
    xxx: xxx;
  }
}
`;
		});

		it("adds component to style to increase specificity", () => {
			let aComponent = new Component();
			let got = aComponent.genStyle(inputStyle);
			expect(got).to.eql(expectedStyle);
		});

	});

	describe("attachStyle", () => {
		before(() => {
			global.document = new mocks.MockBrowser().getDocument();
		});

		it("attaches given style to head", () => {
			let aComponent = new Component();
			aComponent.attachStyle("hello there");
			let style = document.getElementById("Component-style");

			expect(style).to.exist;
			expect(style.textContent).to.equal("hello there");
		});

		after(() => {
			delete global.document;
		});
	});

	describe("insertUserClass", () => {
		it("returns user supplied class if class list is empty", () => {
			let classList = [];
			expect(base.insertUserClass(classList, "aclass")).to.eql(['aclass']);
		});

		it("prepends user supplied class if class list has single class", () => {
			let classList = ["bclass"];
			expect(base.insertUserClass(classList, "aclass")).to.eql(['aclass', 'bclass']);
		});

		it("inserts user supplied class before final class", () => {
			let classList = ["aclass", "cclass"];
			expect(base.insertUserClass(classList, "bclass")).to.eql(['aclass', 'bclass', "cclass"]);
		});
	});

	describe("getClass", () => {
		it("converts class list into a string", () => {
			expect(base.getClass(["aclass", "bclass"])).to.equal("aclass bclass");
		});

		it("removes invalid class names", () => {
			expect(base.getClass(["aclass", null, "", undefined])).to.equal("aclass");
		});

		it("includes user supplied class", () => {
			expect(base.getClass(["aclass", "cclass"], "bclass")).to.equal("aclass bclass cclass");
		});
	});

	describe("getAttrs", () => {
		let component;
		beforeEach(() => {
			component = factory({
				getDefaultAttrs () {
					return {cha: 1};
				},
				getClassList () {
					return [];
				},
				view () {}
			});
		});

		it("merges user supplied attributes with default attributes.", () => {
			let got = component.getAttrs({nye: 2});
			let expected = {cha: 1, nye: 2, rootAttrs: {}};
			expect(got).to.eql(expected);
		});

		it("attaches class to root element attributes", () => {
			let got = component.getAttrs({class: "aclass"});
			let expected = {class: "aclass", cha: 1, rootAttrs: {class: "aclass"}};
			expect(got).to.eql(expected);
		});

		it("attaches 'id' to root element attributes", () => {
			let got = component.getAttrs({id: "aId"});
			let expected = {id: "aId", cha: 1, rootAttrs: {id: "aId"}};
			expect(got).to.eql(expected);
		});

		it("attaches component name to root element attributes.", () => {
			let component = factory({
				name: "greenBottle",
				view: function () {}});

			let got = component.getAttrs({});
			expect(got.rootAttrs).to.eql({"data-component": "greenBottle"});
		});

		it("overrides component's name with attrs[data-component].", () => {
			let aComponent = factory({
				name: "aComponent",
				view () {}
			});

			let got = aComponent.getAttrs({"data-component": "bComponent"});
			expect(got.rootAttrs["data-component"]).to.equal("bComponent");
		});
	});


	describe.only("isRootAttrs", () => {
		let aComponent;

		beforeEach(() => {
			aComponent = new Component();
		});

		it("returns false for lifecyle methods", () => {
			expect(aComponent.isRootAttr("oninit")).to.equal(false);
			expect(aComponent.isRootAttr("oncreate")).to.equal(false);
			expect(aComponent.isRootAttr("onbeforeupdate")).to.equal(false);
			expect(aComponent.isRootAttr("onupdate")).to.equal(false);
			expect(aComponent.isRootAttr("onbeforeremove")).to.equal(false);
			expect(aComponent.isRootAttr("onremove")).to.equal(false);
		});

		it("returns true for 'key'.", () => {
			expect(aComponent.isRootAttr("key")).to.equal(true);
		});

		it("returns true for 'id'.", () => {
			expect(aComponent.isRootAttr("id")).to.equal(true);
		});

		it("returns true for 'style'.", () => {
			expect(aComponent.isRootAttr("style")).to.equal(true);
		});

		it("returns true for 'on*'.", () => {
			expect(aComponent.isRootAttr("onclick")).to.equal(true);
		});

		it("returns true for 'data-*'.", () => {
			expect(aComponent.isRootAttr("data-key")).to.equal(true);
		});

		it("returns true for 'config'.", () => {
			expect(aComponent.isRootAttr("data-key")).to.equal(true);
		});

		it("returns false for rest.", () => {
			expect(aComponent.isRootAttr("xon")).to.equal(false);
			expect(aComponent.isRootAttr("keydata-1")).to.equal(false);
		});
	});

	describe("is", () => {
		it("returns true if component is of given type.", () => {
			let fruit = factory({
				name: "fruit",
				view () {}
			});

			let apple = factory({
				name: "apple",
				base: fruit,
			});

			expect(apple.is("apple")).to.equal(true);
			expect(apple.is("fruit")).to.equal(true);
			expect(apple.is("banana")).to.equal(false);
		});
	});
});

describe("factory", () => {
	let vdom;

	beforeEach(() => {
		global.document = new mocks.MockBrowser().getDocument();
	});

	afterEach(() => {
		delete global.document;
	});

    it("validates component", () => {
        expect(factory.bind(factory, {})).to.throw(Error);

        let struct = {
            view () {
            }
        };
        expect(factory.bind(factory, struct)).not.to.throw(Error);
    });

    it("returns valid mithril component", () => {
        let struct = {
            view () {
            }
        };

        let aComponent = factory(struct);

        expect(aComponent.view).to.exist;
        expect(aComponent.controller).to.exist;
    });

    it("merges new component with base component", () => {
        let struct = {
            base: {one: 1},
            view () {}
        };

        let newComponent = factory(struct);
        expect(newComponent.one).to.equal(1);
        expect(newComponent.view).to.exist;
    });

    it("overrides base's property with new component's property", () => {
        let struct = {
            base: {one: 1},
            one: 2,
            view () {}
        };

        let newComponent = factory(struct);
        expect(newComponent.one).to.equal(2);
    });

    it("does not wrap already wrapped view.", () => {
        let aStruct = {
            view (vnode) {
                return "a component's view";
            }
        };
        let aComponent = factory(aStruct);
        let bStruct = {
            base: aComponent
        };
        let bComponent = factory(bStruct);

		let got = bComponent.view(new bComponent.controller());
		let expected = aStruct.view();
        expect(got).to.equal(expected);
    });

	it("supports mixins", () => {
		let struct = {
			base: {zero: 0},
			mixins: [{one: 1}, {two: 2}],
			view (vnode) {}
		};

        let aComponent = factory(struct);
		expect(aComponent.zero).to.equal(0);
		expect(aComponent.one).to.equal(1);
		expect(aComponent.two).to.equal(2);
	});

    describe("aComponent", () => {
        describe(".view", () => {
            let struct, check, checkThis;

            beforeEach(() => {
                struct = {
                    one: 1,
                    view (vnode) {
                        check = vnode;
                        checkThis = this;
                    }
                };
            });

            it("calls original view with vnode", () => {
				var aComponent = factory(struct);
				aComponent.view(new aComponent.controller(), {}, "child1", "child2");

				expect(check).to.exist;
            });

            it("passes vnode to original view", () => {
                let aComponent = factory(struct);
				aComponent.view(new aComponent.controller(), {attr1: 1}, "child1", "child2");

				expect(check.attrs).to.eql({attr1: 1, rootAttrs: {}});
                expect(check.children).to.eql(["child1", "child2"]);
                expect(check.state).to.not.equal(aComponent);
                expect(check.state.one).to.equal(1);
            });

            it("binds component to original view's 'this'", () => {
                let aComponent = factory(struct);
				let ctrl = new aComponent.controller();
                aComponent.view(ctrl, {}, "child1", "child2");

                expect(checkThis).to.equal(ctrl);
            });

            it("throws error if attributes validation fails", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.one !== 1) throw Error("One should be 1.");
                };

                let aComponent = factory(struct);
                expect(aComponent.view.bind(aComponent,
											new aComponent.controller(),
                                            {one: 2}, "child1", "child2")).to.throw(Error);
            });

            it("does not throw if attributes validation passes", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.cha !== 1) throw Error("Cha should be 1.");
                };

                let aComponent = factory(struct);
                expect(aComponent.view.bind(aComponent,
											new aComponent.controller(),
                                            {cha: 1}, "child1", "child2")).not.to.throw(Error);
            });

            it("'s vnode attributes is combination of default and user passed attributes", () => {
                struct.getDefaultAttrs = function () {
                    return {attr1: 1};
                };

                let aComponent = factory(struct);
                aComponent.view(new aComponent.controller(), {attr2: 2});
                expect(check.attrs).to.eql({attr1: 1, attr2: 2, rootAttrs: {}});
            });

            it("'s vnode.attr.rootAttrs.class is constructed out of class list", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "bclass"];
                };

                let aComponent = factory(struct);
                aComponent.view(new aComponent.controller(), {attr2: 2});
                expect(check.attrs.rootAttrs.class).to.equal("aclass bclass");
            });

            it("'s vnode.attr.rootAttrs.class includes user supplied class", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "cclass"];
                };

                let aComponent = factory(struct);
                aComponent.view(new aComponent.controller(), {class: "bclass"});
                expect(check.attrs.rootAttrs.class).to.equal("aclass bclass cclass");
            });

        });

        describe(".controller", () => {
            let struct, check, checkThis;

            beforeEach(() => {
                struct = {
                    cha: 1,
                    onremove () {
                        return this.cha;
                    },
                    oninit (vnode) {
                        check = vnode;
                        checkThis = this;
                    },
                    view () {}
                };
            });

            it("calls oninit if exists", () => {
                let aComponent = factory(struct);
                let returnObj = new aComponent.controller();
                expect(check).to.exist;
            });

            it("passes vnode to oninit", () => {
                let aComponent = factory(struct);
                let returnObj = new aComponent.controller({attr1: 1}, "child1", "child2");

                expect(check.attrs).to.eql({attr1: 1, rootAttrs: {}});
                expect(check.children).to.eql(["child1", "child2"]);
				expect(check.state).to.exist;
            });

            it("binds oninit to component", () => {
                let aComponent = factory(struct);
                let returnObj = new aComponent.controller("attr", "child1", "child2");
                expect(checkThis).to.equal(returnObj);
            });

            it("returns object with onunload if onremove exists", () => {
                let aComponent = factory(struct);
                let returnObj = new aComponent.controller();
                expect(returnObj.onunload).to.exist;
            });

            it("binds component to onunload method.", () => {
                let aComponent = factory(struct);
                let returnObj = new aComponent.controller();
                expect(returnObj.onunload()).to.equal(1);
            });

            it("returns object without onunload if onremove does not exist", () => {
                delete struct.onremove;
                let aComponent = factory(struct);
                let returnObj = new aComponent.controller();
                expect(returnObj.onunload).not.to.exist;
            });
        });

		describe(".oninit", () => {
			let struct, component;

			beforeEach(() => {
				struct = {
					name: "aComponent",
					getStyle (vnode) {
						return {
							"div": {
								"background-color": "#fff"
							}
						};
					},
					view () {}
				};

				component = factory(struct);
			});


			it("attaches style to head if component's getStyle returns non null value.", () => {
				component.oninit();

				let style = document.getElementById("aComponent-style");
				expect(style).to.exist;
			});


			it("won't attach the style for a component if it already attached.", () => {
				component.oninit();

				let style = document.querySelectorAll("#aComponent-style");
				expect(style.length).to.equal(1);
			});
		});
    });
});
