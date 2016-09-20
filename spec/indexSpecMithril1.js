import {factory, base, validateComponent, isMithril1} from "../src/index.js";
import chai from "chai";

let expect = chai.expect;

let noop = function () {};


describe("validateComponent", () => {
	it("complains if component lacks view", () => {
		expect(validateComponent.bind(base, {})).to.throw(Error);
	});

	it("won't complain if component has view", () => {
		expect(validateComponent.bind(base, {view () {}})).not.to.throw(Error);
	});
});


// describe("isMithril1", () => {
// 	it("returns true for mithril version 1.x.x", () => {
// 		let m = {
// 			version: "1.0.0"
// 		};
// 		expect(isMithril1(m)).to.equal(true);
// 	});
//
// 	it("returns false for mithril version 0.x.x", () => {
// 		let m = {
// 			version: "0.2.0"
// 		};
// 		expect(isMithril1(m)).to.equal(false);
// 	});
// });


describe("base", () => {
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
			component = {
				getDefaultAttrs () {
					return {cha: 1};
				},
				getClassList () {
					return [];
				}
			};
		});

		it("merges user supplied attributes with default attributes.", () => {
			expect(base.getAttrs({nye: 2}, component)).to.eql({cha: 1, nye: 2, rootAttrs: {}});
		});

		it("attaches class to root element attributes", () => {
			let got = base.getAttrs({class: "aclass"}, component);
			let expected = {class: "aclass", cha: 1, rootAttrs: {className: "aclass"}};
			expect(got).to.eql(expected);
		});

		it("attaches 'id' to root element attributes", () => {
			let got = base.getAttrs({id: "aId"}, component);
			let expected = {id: "aId", cha: 1, rootAttrs: {id: "aId"}};
			expect(got).to.eql(expected);
		});
	});

	describe("isAttr", () => {
	  it("returns false if it has .tag attribute", () => {
		expect(base.isAttr({tag: 'atag'})).to.equal(false);
	  });

	  it("returns false if it has .view attribute", () => {
		expect(base.isAttr({view: noop})).to.equal(false);
	  });

	  it("returns false if it is an array", () => {
		expect(base.isAttr([])).to.equal(false);
	  });

	  it("returns true if it is an object without .tag and .view attributes", () => {
		expect(base.isAttr({})).to.equal(true);
	  });
	});

	describe("getVnode", () => {
	  let component;

	  beforeEach(() => {
		component = {
		  getDefaultAttrs () {
			  return {nye: 2};
		  },
		  getClassList () {
			return [];
		  }
		};
	  });

		it("attaches given attribute merged with default attributes to vnode.attrs", () => {
			let attrs = {cha: 1};
			let children = ["child"];
			let got = base.getVnode(attrs, children, component);
			expect(got.attrs).to.eql({cha: 1, nye: 2, rootAttrs: {}});
		});

		it("attaches default attribute to vnode.attrs if no attribute was passed", () => {
			let children = ["child"];
			let got = base.getVnode([], children, component);
			expect(got.attrs).to.eql({nye: 2, rootAttrs: {}});
		});

		it("attaches given children to vnode.children", () => {
			let children = ["child"];
			let got = base.getVnode({}, children, component);
			expect(got.children).to.eql(children);
		});

		it("identifies the child node even if attribute is absent", () => {
			let got = base.getVnode(1, [2], component);
			expect(got.children).to.eql([1,2]);
		});

		it("returns object with attributes, children and state", () => {
			let got = base.getVnode({}, [], component);
			expect(got.attrs).to.eql({nye: 2, rootAttrs: {}});
			expect(got.children).to.eql([]);
			expect(got.state).to.eql(component);
		});
	});


	describe("isRootAttrs", () => {
		it("returns true for 'id'.", () => {
			expect(base.isRootAttr(null, "id")).to.equal(true);
		});

		it("returns true for 'style'.", () => {
			expect(base.isRootAttr(null, "style")).to.equal(true);
		});

		it("returns true for 'on*'.", () => {
			expect(base.isRootAttr(null, "onclick")).to.equal(true);
		});

		it("returns true for 'data-*'.", () => {
			expect(base.isRootAttr(null, "data-key")).to.equal(true);
		});

		it("returns true for 'config'.", () => {
			expect(base.isRootAttr(null, "data-key")).to.equal(true);
		});

		it("returns false for rest.", () => {
			expect(base.isRootAttr(null, "xon")).to.equal(false);
			expect(base.isRootAttr(null, "keydata-1")).to.equal(false);
		});
	});
});

describe("factory", () => {
	let vdom;

	beforeEach(() => {
		vdom = {
			attrs: {}
		};
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
        expect(bComponent.view(vdom)).to.equal(aStruct.view());
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
            let vdom, struct, check, checkThis;

            beforeEach(() => {
				vdom = {
					children: ["child1", "child2"],
					attrs: {}
				};

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
				aComponent.view(vdom);

				expect(check).to.exist;
            });

            it("passes vnode to original view", () => {
                let aComponent = factory(struct);
				vdom.attrs = {attr1: 1};
				vdom.state = aComponent;
				aComponent.view(vdom);

				expect(check.attrs).to.eql({attr1: 1, rootAttrs: {}});
                expect(check.children).to.eql(["child1", "child2"]);
                expect(check.state).to.equal(aComponent);
            });

            it("binds component to original view's 'this'", () => {
                let aComponent = factory(struct);
                aComponent.view(vdom);

                expect(checkThis).to.equal(aComponent);
            });

            it("throws error if attributes validation fails", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.one !== 1) throw Error("One should be 1.");
                };

                let aComponent = factory(struct);
				vdom.attrs = {one: 2};
                expect(aComponent.view.bind(aComponent, vdom)).to.throw(Error);
            });

            it("does not throw if attributes validation passes", () => {
                struct.validateAttrs = function (attrs) {
                    if (attrs.cha !== 1) throw Error("Cha should be 1.");
                };

                let aComponent = factory(struct);
				vdom.attrs = {cha: 1};
                expect(aComponent.view.bind(aComponent, vdom)).not.to.throw(Error);
            });

            it("'s vnode attributes is combination of default and user passed attributes", () => {
                struct.getDefaultAttrs = function () {
                    return {attr1: 1};
                };

                let aComponent = factory(struct);
				vdom.attrs = {attr2: 2};
                aComponent.view(vdom);
                expect(check.attrs).to.eql({attr1: 1, attr2: 2, rootAttrs: {}});
            });

            it("'s vnode.attr.rootAttrs.className is constructed out of class list", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "bclass"];
                };

                let aComponent = factory(struct);
                aComponent.view(vdom);
                expect(check.attrs.rootAttrs.className).to.equal("aclass bclass");
            });

            it("'s vnode.attr.rootAttrs.className includes user supplied class", () => {
                struct.getClassList = function (attrs) {
                    return ["aclass", "cclass"];
                };

                let aComponent = factory(struct);
				vdom.attrs.class = "bclass";
                aComponent.view(vdom);
                expect(check.attrs.rootAttrs.className).to.equal("aclass bclass cclass");
            });

        });
    });
});
