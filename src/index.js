import assign from "lodash/assign";
import clone from "lodash/clone";
import isObject from "lodash/isObject";
import isFunction from "lodash/isFunction";
import classNames from "classnames";
import isArray from "lodash/isArray";
import merge from "lodash/merge";
import pickBy from "lodash/pickBy";
import reduce from "lodash/reduce";



export const validateComponent = (comp) => {
	if (!comp.view) throw Error("View is required.");
};


export const isMithril1 = () => {
	// for browser
	try {
		if (/^1\.\d\.\d$/.test(m.version)) return true;
		return false;
	}
	// node
	catch (err){
		try {
			require("mithril");
			return false;
		}
		catch (err)  {
			return true;
		}
	}
};

export const base = {
	/*
	 * Generates stylesheet based upon data returned by getStyle()
	 * */
	genStyle (jsStyle) {
		function genSingleLevel (js, indent = 1) {
			let leftPad = new Array(indent).join(" ");
			let css = "";

			for (let key in js) {
				if (js.hasOwnProperty(key)) {
					if (typeof js[key] === "object") {
						css += leftPad + key + " {\n";

						css += genSingleLevel(js[key], indent + 2);

						css += leftPad + "}\n";
					}
					else {
						css += leftPad + key + ": " + js[key] + ";\n";
					}
				}
			}

			return css;
		}


		return genSingleLevel(jsStyle);
	},

	/*
	 * Attaches component name to the style.
	 * This increases specificity.
	 * */
	localizeStyle (componentName, style) {
		return style
			.replace(/^([a-zA-Z0-9]+)/gm, `$1[data-component=${componentName}]`)
			.replace(/^([.#:])/gm, `[data-component=${componentName}]$1`)
			.replace(/^(\s\s)([a-zA-Z0-9]+)(.*?{)/gm, `$1$2[data-component=${componentName}]$3`)
			.replace(/^(\s\s)([.#:])/gm, `$1[data-component=${componentName}]$2`)
			// reverse for keyframe styles
			.replace(/^(\s\s[0-9]+).*?{/gm, `$1% {`)
			.replace(/^(\s\sfrom).*?{/gm, `$1 {`)
			.replace(/^(\s\sto).*?{/gm, `$1 {`);
	},

	/*
	 * Returns json which will be used by genStyles() to generate stylesheet for this component.
	 * */
    getStyle (vnode) {},

	/*
	 * Attach styles to the head
	 * */
	attachStyle (style, componentName) {
		let node = document.createElement("style");
		node.id = componentName + "-style";

		if (node.styleSheet) {
			node.styleSheet.cssText = style;
		} else {
			node.appendChild(document.createTextNode(style));
		}

		document.getElementsByTagName('head')[0].appendChild(node);
	},

	/*
	 * Returns true for attirbutes which are selected for root dom of the component.
	 * */
	isRootAttr (value, key) {
		// TODO: if mithril 1.x.x component lifecycle return false
		return /^(id|style|on.*|data-.*|config)$/.test(key)? true: false;
	},

	/*
	 * Returns true if the first argument to the component is an attribute.
	 * */
	isAttr (attrs) {
	  return !isArray(attrs) && isObject(attrs) && !(attrs.view || attrs.tag) && !attrs.length
		? true
		: false;
	},
	insertUserClass (classList, userClass) {
	  if (classList.length == 0) {
		return [userClass];
	  }
	  else if (classList.length == 1) {
		classList.unshift(userClass);
		return classList;
	  }
	  else {
		classList.splice(1,0, userClass);
		return classList;
	  }
	},
	getClass (classList, userClass) {
		// attach component name to the classlist
		return classNames(this.insertUserClass(classList, userClass));
	},

	getAttrs (attrs, component) {
		let defaultAttrs = component.getDefaultAttrs(attrs);
		let newAttrs = {};

		if (!isMithril1()) {
			if(this.isAttr(attrs)) {
				newAttrs = merge(clone(defaultAttrs), attrs);
			}
			else {
				newAttrs = defaultAttrs;
			}
		}
		else {
			newAttrs = merge(clone(defaultAttrs), attrs);
		}


		newAttrs.rootAttrs = merge(newAttrs.rootAttrs, pickBy(newAttrs, this.isRootAttr));

		let newClassName = this.getClass(component.getClassList(newAttrs), newAttrs.class);
		if (newClassName) {
			newAttrs.rootAttrs.className = newClassName;
		}

		return newAttrs;
	},

	getVnode (attrs, children, component) {
	  let newAttrs = this.getAttrs(attrs, component);

	  if (this.isAttr(attrs)) {
		return {attrs: newAttrs, children, state : component};
	  }

	  children.unshift(attrs);

	  return {attrs: newAttrs, children, state: component};
	},

    getDefaultAttrs () {
        return {};
    },

    getClassList (attrs) {
        return [];
    },

    validateAttrs (attrs) {}
};

export const factory = (struct) => {
	let mixins = struct.mixins || [];
	let sources = [base, struct.base || {}].concat(mixins);
	sources.push(struct);
    let component = reduce(sources, assign, {});

    validateComponent(component);

	let originalOninit = component.oninit;
	component.oninit = function (vnode) {
		originalOninit.bind(component, vnode);

		let style = component.getStyle(vnode);
		let cName = component.name;

		if (style && document.getElementById(cName + "-style")) return;

		component.attachStyle(component.localizeStyle(cName, component.genStyle(style));
	};

    let originalView = component.view.originalView || component.view;

	// for mithril 0.2.x
	if (!isMithril1()) {
		let ctrlReturn = {};
		if (component.onremove) {
			ctrlReturn.onunload = component.onremove.bind(component);
		}

		component.controller = function (attrs, ...children) {
			let vnode = component.getVnode(attrs, children, component);
			if (component.oninit) {
				component.oninit(vnode);
			}
			return ctrlReturn;
		};

		component.view = function (ctrl, attrs, ...children) {
			let vnode = this.getVnode(attrs, children, component);

			this.validateAttrs(vnode.attrs);

			return originalView.call(this, vnode);
		};
	}
	// for mithril 1.x.x
	else {
		component.view = function (vnode) {
			vnode.attrs = this.getAttrs(vnode.attrs, component);
			this.validateAttrs(vnode.attrs);

			return originalView.call(this, vnode);
		};
	}

	component.view.originalView = originalView;

    return component;
};
