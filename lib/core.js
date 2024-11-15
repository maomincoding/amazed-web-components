import { ReactiveEffect } from './reactivity.js';

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element
const HTML_TAGS =
    'html,body,base,head,link,meta,style,title,address,article,aside,footer,' +
    'header,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,' +
    'figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,' +
    'data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,' +
    'time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,' +
    'canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,' +
    'th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,' +
    'option,output,progress,select,textarea,details,dialog,menu,' +
    'summary,template,blockquote,iframe,tfoot';
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element
const SVG_TAGS =
    'svg,animate,circle,clippath,cursor,image,defs,desc,ellipse,filter,font-face' +
    'foreignobject,g,glyph,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view,' +
    'feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feFlood,feGaussianBlur,' +
    'feImage,feMerge,feMorphology,feOffset,feSpecularLighting,feTile,feTurbulence,feDistantLight,fePointLight,feSpotLight,' +
    'linearGradient,stop,radialGradient,' +
    'animateTransform,animateMotion';
function makeMap(str) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return function (val) {
        return map[val];
    };
}
const isHTMLTag = /*#__PURE__*/ makeMap(HTML_TAGS);
const isSVG = /*#__PURE__*/ makeMap(SVG_TAGS);
function isXlink(name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
}
const namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML',
};
const xlinkNS = 'http://www.w3.org/1999/xlink';
function getXlinkProp(name) {
    return isXlink(name) ? name.slice(6, name.length) : '';
}
function getTagNamespace(tag) {
    if (isSVG(tag)) {
        return 'svg';
    }
    if (tag === 'math') {
        return 'math';
    }
    return undefined;
}
function createElementNS(namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName);
}
function getType(v) {
    return Object.prototype.toString
        .call(v)
        .match(/\[object (.+?)\]/)[1]
        .toLowerCase();
}
const typeData = ['object', 'array', 'function', 'regexp', 'date', 'math'];
function isComplexType(v) {
    return typeData.includes(getType(v));
}
function isUndef(v) {
    return v === undefined || v === null;
}
function checkSameVnode(o, n) {
    return o.tag === n.tag && o.key === n.key;
}
function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
function isVnode(vnode) {
    if (vnode) {
        return (
            hasOwnProperty(vnode, 'tag') &&
            hasOwnProperty(vnode, 'props') &&
            hasOwnProperty(vnode, 'children') &&
            hasOwnProperty(vnode, 'key') &&
            hasOwnProperty(vnode, 'el')
        );
    }
}
function isArrayVnode(vnodes) {
    return vnodes.every(isVnode);
}
function checkVnode(vnodes) {
    return Array.isArray(vnodes) ? isArrayVnode(vnodes) : isVnode(vnodes);
}
function warn(msg) {
    console.warn(`[Strve warn]: ${msg}`);
}
function setStyleProp(el, prototype) {
    Object.assign(el.style, prototype);
}
function addEvent(el, props) {
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('on')) {
            const name = key.slice(2).toLowerCase();
            el.addEventListener(name, value);
        }
    }
}
function removeEvent(el, key, oldProps) {
    if (key.startsWith('on')) {
        const name = key.slice(2, 3).toLowerCase() + key.slice(3);
        if (typeof oldProps[key] === 'function') {
            el.removeEventListener(name, oldProps[key]);
        }
    }
}
function setAttribute(el, key, value) {
    if (typeof isXlink === 'function' && !isXlink(key)) {
        el.setAttribute(key, value.toString());
    } else {
        const xlinkNS = 'http://www.w3.org/1999/xlink';
        el.setAttributeNS(xlinkNS, key, value.toString());
    }
}
function removeAttribute(el, key) {
    if (!isXlink(key)) {
        el.removeAttribute(key);
    } else {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    }
}
function createNode(tag) {
    switch (true) {
        // Html
        case isHTMLTag(tag):
            return document.createElement(tag);
        // Svg
        case isSVG(tag):
            return createElementNS(getTagNamespace(tag), tag);
        // Fragment
        case tag === 'fragment':
            return document.createDocumentFragment();
        // Comment
        case tag === 'comment' || tag === 'null':
            return document.createComment(tag);
        // Default
        default:
            return document.createElement(tag);
    }
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = ((u + v) / 2) | 0;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
// Flag
const flag = ['$ref'];
// domInfo
const domInfo = Object.create(null);
// Update text node
function updateTextNode(val, el) {
    let _text = '';
    if (Array.isArray(val)) {
        if (val.length > 1) {
            let _texts = [];
            for (let index = 0; index < val.length; index++) {
                const c = val[index];
                _texts.push(isComplexType(c) ? JSON.stringify(c) : c);
            }
            _text = _texts.join('');
        } else if (val.length === 0) {
            _text = '';
        } else {
            _text = JSON.stringify(val).replace(/,/g, '');
        }
    } else if (isComplexType(val)) {
        _text = JSON.stringify(val);
    } else {
        _text = val;
    }
    el.textContent = _text;
}
// Convert virtual dom to real dom
function mount(vnode, container, anchor) {
    const { tag, props, children } = vnode;
    // tag
    if (!isUndef(tag)) {
        const el = createNode(tag);
        vnode.el = el;
        // props
        if (!isUndef(props)) {
            addEvent(el, props);
            const keys = Object.keys(props);
            for (let index = 0; index < keys.length; index++) {
                const key = keys[index];
                const propValue = props[key];
                const propValueType = getType(propValue);
                if (propValueType !== 'function' && key !== 'key' && !flag.includes(key)) {
                    setAttribute(el, key, propValue);
                }
                if (key === 'style' && propValueType === 'object') {
                    setStyleProp(el, propValue);
                }
                // domInfo
                if (key === flag[0] && propValueType === 'string') {
                    domInfo[propValue] = el;
                }
            }
        }
        // children
        if (!isUndef(children)) {
            if (!checkVnode(children)) {
                if (el) {
                    updateTextNode(children, el);
                }
            } else {
                const childrenType = getType(children);
                if (childrenType === 'array') {
                    for (let index = 0; index < children.length; index++) {
                        const child = children[index];
                        if (isVnode(child)) {
                            mount(child, el);
                        }
                    }
                } else if (childrenType === 'object') {
                    mount(children, el);
                }
            }
        }
        if (anchor) {
            container.insertBefore(el, anchor);
        } else if (container) {
            container.appendChild(el);
        } else {
            return el;
        }
    }
}
// diff
function patch(oNode, nNode) {
    if (!checkSameVnode(oNode, nNode)) {
        const parent = oNode.el.parentNode;
        const anchor = oNode.el.nextSibling;
        parent.removeChild(oNode.el);
        mount(nNode, parent, anchor);
    } else {
        const el = (nNode.el = oNode.el);
        // props
        const oldProps = oNode.props || {};
        const newProps = nNode.props || {};
        const newKeys = Object.keys(newProps);
        const oldKeys = Object.keys(oldProps);
        for (let index = 0; index < newKeys.length; index++) {
            const key = newKeys[index];
            const newValue = newProps[key];
            const oldValue = oldProps[key];
            const newPropValueType = getType(newValue);
            if (newValue !== oldValue) {
                if (!isUndef(newValue)) {
                    if (newPropValueType !== 'function' && key !== 'key' && !flag.includes(key)) {
                        setAttribute(el, key, newValue);
                    }
                    if (key === 'style' && newPropValueType === 'object') {
                        setStyleProp(el, newValue);
                    }
                    if (newPropValueType === 'function' && newValue.toString() !== oldValue.toString()) {
                        removeEvent(el, key, oldProps);
                        addEvent(el, newProps);
                    }
                } else {
                    removeAttribute(el, key);
                }
            }
        }
        for (let index = 0; index < oldKeys.length; index++) {
            const key = oldKeys[index];
            if (!newKeys.includes(key)) {
                removeAttribute(el, key);
            }
        }
        // children
        const oc = oNode.children;
        const nc = nNode.children;
        if (getType(oc) === 'array' && getType(nc) === 'array') {
            patchKeyChildren(oc, nc, el);
        } else if (isVnode(oc) && isVnode(nc)) {
            patch(oc, nc);
        } else if (!checkVnode(oc) && !checkVnode(nc) && oc !== nc) {
            updateTextNode(nc, el);
        }
    }
}
// can be all-keyed or mixed
function patchKeyChildren(n1, n2, parentElm) {
    const l2 = n2.length;
    let i = 0;
    let e1 = n1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
        if (checkSameVnode(n1[i], n2[i])) {
            patch(n1[i], n2[i]);
        } else {
            break;
        }
        i++;
    }
    while (i <= e1 && i <= e2) {
        if (checkSameVnode(n1[e1], n2[e2])) {
            patch(n1[e1], n2[e2]);
        } else {
            break;
        }
        e1--;
        e2--;
    }
    if (i > e1) {
        if (i <= e2) {
            const nextPos = e2 + 1;
            const anchor = nextPos < l2 ? n2[nextPos].el : null;
            while (i <= e2) {
                parentElm.insertBefore(mount(n2[i]), anchor);
                i++;
            }
        }
    } else if (i > e2) {
        while (i <= e1) {
            parentElm.removeChild(n1[i].el);
            i++;
        }
    } else {
        const s1 = i;
        const s2 = i;
        const keyToNewIndexMap = new Map();
        for (i = s2; i <= e2; i++) {
            const nextChild = n2[i];
            if (nextChild.key != null) {
                keyToNewIndexMap.set(nextChild.key, i);
            }
        }
        let j;
        let patched = 0;
        const toBePatched = e2 - s2 + 1;
        let moved = false;
        let maxIndexSoFar = 0;
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
        for (let i = s1; i <= e1; i++) {
            if (patched >= toBePatched) {
                parentElm.removeChild(n1[i].el);
                continue;
            }
            let newIndex;
            if (n1[i].key !== null) {
                newIndex = keyToNewIndexMap.get(n1[i].key);
            } else {
                for (j = s2; j <= e2; j++) {
                    if (newIndexToOldIndexMap[j - s2] === 0 && checkSameVnode(n1[i], n2[j])) {
                        newIndex = j;
                        break;
                    }
                }
            }
            if (newIndex === undefined) {
                parentElm.removeChild(n1[i].el);
            } else {
                newIndexToOldIndexMap[newIndex - s2] = i + 1;
                if (newIndex > maxIndexSoFar) {
                    maxIndexSoFar = newIndex;
                } else {
                    moved = true;
                }
                patch(n1[i], n2[newIndex]);
                patched++;
            }
        }
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
        j = increasingNewIndexSequence.length - 1;
        for (let i = toBePatched - 1; i >= 0; i--) {
            const nextIndex = i + s2;
            const anchor = nextIndex + 1 < l2 ? n2[nextIndex + 1].el : null;
            if (newIndexToOldIndexMap[i] === 0) {
                parentElm.insertBefore(mount(n2[nextIndex]), anchor);
            } else if (moved) {
                if (j < 0 || i !== increasingNewIndexSequence[j]) {
                    parentElm.insertBefore(n2[nextIndex].el, anchor);
                } else {
                    j--;
                }
            }
        }
    }
}

let _el = null;
let _template = null;

// reset view
function resetView() {
    _el.innerHTML = '';
    const tem = _template();
    mount(tem, _el);
}

function normalizeContainer(container) {
    if (typeof container === 'string') {
        const res = document.querySelector(container);
        if (!res) {
            let elem = null;
            if (container.startsWith('#')) {
                elem = document.createElement('div');
                elem.setAttribute('id', container.substring(1, container.length));
            } else if (container.startsWith('.')) {
                elem = document.createElement('div');
                elem.setAttribute('class', container.substring(1, container.length));
            } else {
                warn(`Failed to mount app: mount target selector "${container}" returned null.`);
            }
            document.body.insertAdjacentElement('afterbegin', elem);
            return elem;
        }
        return res;
    } else if (container instanceof HTMLElement) {
        return container;
    } else if (
        window.ShadowRoot &&
        container instanceof window.ShadowRoot &&
        container.mode === 'closed'
    ) {
        warn('mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs.');
        return null;
    } else {
        return null;
    }
}

function createApp(template) {
    const app = {
        mount(el) {
            const mountNodeEl = normalizeContainer(el);

            if (mountNodeEl) {
                const tem = template();
                const temType = getType(tem) === 'array';
                if (temType) {
                    warn('Please provide a root node.');
                } else {
                    _el = mountNodeEl;
                    _template = template;
                    // Need to mount the entry page
                    mount(tem, mountNodeEl);
                }
            } else {
                warn('There must be a mount element node.');
            }
        },
    };
    return app;
}

let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /*#__PURE__*/ Promise.resolve();
let currentFlushPromise = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
function callWithErrorHandling(fn, instance, type, args) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    }
    catch (err) {
        console.error(err);
    }
    return res;
}
function findInsertionIndex(id) {
    // the start index should be `flushIndex + 1`
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
        const middle = (start + end) >>> 1;
        const middleJobId = getId(queue[middle]);
        middleJobId < id ? (start = middle + 1) : (end = middle);
    }
    return start;
}
function queueJob(job) {
    if (!queue.length ||
        !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) {
        if (job.id == null) {
            queue.push(job);
        }
        else {
            queue.splice(findInsertionIndex(job.id), 0, job);
        }
        queueFlush();
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true;
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
        const deduped = [...new Set(pendingPostFlushCbs)];
        pendingPostFlushCbs.length = 0;
        if (activePostFlushCbs) {
            activePostFlushCbs.push(...deduped);
            return;
        }
        activePostFlushCbs = deduped;
        {
            seen = seen || new Map();
        }
        activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            if (checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex])) {
                continue;
            }
            activePostFlushCbs[postFlushIndex]();
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
const getId = (job) => job.id == null ? Infinity : job.id;
const comparator = (a, b) => {
    const diff = getId(a) - getId(b);
    if (diff === 0) {
        if (a.pre && !b.pre)
            return -1;
        if (b.pre && !a.pre)
            return 1;
    }
    return diff;
};
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    {
        seen = seen || new Map();
    }
    queue.sort(comparator);
    const check = (job) => checkRecursiveUpdates(seen, job);
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job && job.active !== false) {
                if (true && check(job)) {
                    continue;
                }

                callWithErrorHandling(job, null, 14);
            }
        }
    }
    finally {
        flushIndex = 0;
        queue.length = 0;
        flushPostFlushCbs(seen);
        isFlushing = false;
        currentFlushPromise = null;
        // some postFlushCb queued jobs!
        // keep flushing until it drains.
        if (queue.length || pendingPostFlushCbs.length) {
            flushJobs(seen);
        }
    }
}
const isFunction = (val) => typeof val === 'function';
function getComponentName(Component, includeInferred = true) {
    return isFunction(Component)
        ? Component.displayName || Component.name
        : Component.name || (includeInferred && Component.__name);
}
function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) {
        seen.set(fn, 1);
    }
    else {
        const count = seen.get(fn);
        if (count > RECURSION_LIMIT) {
            const instance = fn.ownerInstance;
            const componentName = instance && getComponentName(instance.type);
            console.warn(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. ` +
                `This means you have a reactive effect that is mutating its own ` +
                `dependencies and thus recursively triggering itself. Possible sources ` +
                `include component template, render function, updated hook or ` +
                `watcher source function.`)
            return true;
        }
        else {
            seen.set(fn, count + 1);
        }
    }
}

let currentInstance;
function defineComponent(options, factory) {
    if (typeof options === 'function') {
        factory = options;
        options = Object.create(null);
    }

    class Component extends HTMLElement {
        static get observedAttributes() {
            return options.props;
        }
        constructor() {
            super();
            const props = (this._props = {});
            currentInstance = this;
            const dispatch = (event, args) => {
                this.dispatchEvent(
                    new CustomEvent(event, {
                        detail: args,
                    })
                );
            };
            this.emit = (event, ...args) => {
                dispatch(event, args);
            };
            const param = { props, content: this };
            const template = factory.call(this, param);
            currentInstance = null;
            const root = this.attachShadow({ mode: 'open' });
            if (options.styles && Array.isArray(options.styles)) {
                const s = document.createElement('style');
                s.textContent = options.styles.join('');
                root.appendChild(s);
            }

            let isMounted = false;
            let oldTree = null;
            const componentUpdateFn = () => {
                const _tem = template();
                if (isMounted) {
                    patch(oldTree, _tem);
                } else {
                    mount(_tem, root);
                    isMounted = true;
                }
                oldTree = _tem;
            }
            const effect = new ReactiveEffect(componentUpdateFn, () => queueJob(update));
            const update = () => effect.run()
            update();
        }
        connectedCallback() {
            this._m && this._m.forEach((cb) => cb());
        }
        disconnectedCallback() {
            this._um && this._um.forEach((cb) => cb());
        }
        attributeChangedCallback(name, oldValue, newValue) {
            this._props[name] = newValue;
            this._w && this._w.forEach((cb) => cb());
        }
    }

    return Component;
}

function createLifecycleMethod(name) {
    return (cb) => {
        if (currentInstance) {
            (currentInstance[name] || (currentInstance[name] = [])).push(cb);
        }
    };
}
// Life cycle hooks
const onMounted = createLifecycleMethod('_m');
const onUnmounted = createLifecycleMethod('_um');

// watchProps
const watchProps = createLifecycleMethod('_w');

// register component
function registerComponent(name, constructor, options) {
    if (!customElements.get(name)) {
        customElements.define(name, constructor, options);
    }
}

// strve-reactivity API
export {
    resetView,
    createApp,
    nextTick,
    domInfo,
    onMounted,
    onUnmounted,
    watchProps,
    registerComponent,
    defineComponent,
};
// @vue/reactivity API
export * from './reactivity.js';
