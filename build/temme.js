"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pegjs = require("pegjs");
const cheerio = require("cheerio");
exports.cheerio = cheerio;
const grammar_1 = require("./grammar");
const makeGrammarErrorMessage_1 = require("./makeGrammarErrorMessage");
const filters_1 = require("./filters");
exports.defineFilter = filters_1.defineFilter;
exports.errors = {
    // funcNameNotSupported(f: string) {
    //   return `${f} is not a valid content func-name.`
    // },
    hasLeadingCapture() {
        return 'Attr capturing and content matching/capturing are only allowed in the last part of css-selector. Capture in leading css-selectors will be omitted. Did you forget the comma?';
    },
};
const defaultCaptureKey = '@@default-capture@@';
const ignoreCaptureKey = '@@ignore-capture@@';
const ignoreCapture = { capture: ignoreCaptureKey, filterList: [] };
exports.temmeParser = pegjs.generate(grammar_1.default);
function isEmptyObject(x) {
    return typeof x === 'object'
        && Object.getPrototypeOf(x) === Object.prototype
        && Object.keys(x).length === 0;
}
function isCheerioStatic(arg) {
    return typeof arg.root === 'function';
}
function containsAnyCaptureInAttrListOrContent(cssParts) {
    return cssParts.some(part => {
        const hasAttrCapture = part.attrList && part.attrList.some(attr => typeof attr.value !== 'string');
        if (hasAttrCapture) {
            return true;
        }
        const hasContentCapture = part.content && part.content.length > 0;
        if (hasContentCapture) {
            return true;
        }
        return false;
    });
}
// notice 递归的检查 selector是否合法
function check(selector) {
    if (selector.self === true) {
    }
    else {
        const cssPartsLength = selector.css.length;
        const leadingParts = selector.css.slice(0, cssPartsLength - 1);
        const hasLeadingCapture = containsAnyCaptureInAttrListOrContent(leadingParts);
        if (hasLeadingCapture) {
            throw new Error(exports.errors.hasLeadingCapture());
        }
        if (selector.children) {
            for (const child of selector.children) {
                check(child);
            }
        }
    }
}
function mergeResult(target, source) {
    for (const key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
    return target;
}
exports.mergeResult = mergeResult;
function temme(html, selector, extraFilters = {}) {
    let $;
    if (typeof html === 'string') {
        $ = cheerio.load(html, { decodeEntities: false });
    }
    else if (isCheerioStatic(html)) {
        $ = html;
    }
    else {
        $ = cheerio.load(html);
    }
    let rootSelector;
    if (typeof selector === 'string') {
        try {
            rootSelector = exports.temmeParser.parse(selector);
        }
        catch (error) {
            const message = makeGrammarErrorMessage_1.default(selector, error);
            throw new Error(message);
        }
    }
    else {
        rootSelector = selector;
    }
    if (rootSelector == null) {
        return null;
    }
    const filterFnMap = Object.assign({}, filters_1.defaultFilterMap, extraFilters);
    rootSelector.forEach(check);
    return helper($.root(), rootSelector);
    function helper(cntCheerio, selectorArray) {
        const result = {};
        selectorArray.map(selector => {
            if (selector.self === false) {
                const cssSelector = makeNormalCssSelector(selector.css);
                const subCheerio = cntCheerio.find(cssSelector);
                if (subCheerio.length > 0) {
                    const capturer = makeValueCapturer(selector.css);
                    mergeResult(result, capturer(subCheerio));
                    if (selector.name && selector.children) {
                        const beforeValue = subCheerio.toArray()
                            .map(sub => helper($(sub), selector.children));
                        result[selector.name] = applyFilters(beforeValue, selector.filterList);
                    }
                }
                else if (selector.name) {
                    result[selector.name] = applyFilters([], selector.filterList);
                }
            }
            else {
                const cssSelector = makeNormalCssSelector([{
                        direct: false,
                        tag: '',
                        id: selector.id,
                        classList: selector.classList,
                        attrList: selector.attrList,
                        content: selector.content,
                    }]);
                if (cssSelector === '' || cntCheerio.is(cssSelector)) {
                    const capturer = makeSelfCapturer(selector);
                    mergeResult(result, capturer(cntCheerio));
                }
            }
        });
        delete result[ignoreCaptureKey];
        let returnVal = result;
        if (result.hasOwnProperty(defaultCaptureKey)) {
            returnVal = result[defaultCaptureKey];
        }
        if (returnVal == null || isEmptyObject(returnVal)) {
            return null;
        }
        else {
            return returnVal;
        }
    }
    function applyFilters(initValue, filterList) {
        return filterList.reduce((value, filter) => {
            if (filter.name in filterFnMap) {
                const filterFn = filterFnMap[filter.name];
                return filterFn.apply(value, filter.args);
            }
            else if (typeof value[filter.name] === 'function') {
                const filterFn = value[filter.name];
                return filterFn.apply(value, filter.args);
            }
            else {
                throw new Error(`${filter.name} is not a valid filter.`);
            }
        }, initValue);
    }
    function captureAttrs(node, attrList) {
        const result = {};
        for (const attr of attrList) {
            if (typeof attr.value === 'object') {
                const value = node.attr(attr.name);
                if (value !== undefined) {
                    result[attr.value.capture] = applyFilters(value, attr.value.filterList);
                }
            }
            // todo 这里是否需要同时验证匹配? 例如 foo=bar
        }
        return result;
    }
    function captureContent(node, content) {
        const result = {};
        for (const part of content) {
            // 目前只支持这几个func
            // console.assert(['text', 'html', 'node', 'contains'].includes(part.funcName),
            // errors.funcNameNotSupported(part.funcName))
            // 至少有一个是value-capture
            // console.assert(part.args.some(isCapture),
            //   errors.needValueCapture(part.funcName))
            // 不能出现连续两个值捕获
            console.assert(!hasConsecutiveValueCapture(part.args));
            if (part.funcName === 'text') {
                const textCaptureResult = captureString(node.text(), part.args);
                if (textCaptureResult == null) {
                    return null;
                }
                mergeResult(result, textCaptureResult);
            }
            else if (part.funcName === 'html') {
                const htmlCaptureResult = captureString(node.html(), part.args);
                if (htmlCaptureResult == null) {
                    return null;
                }
                mergeResult(result, htmlCaptureResult);
            }
            else if (part.funcName === 'node') {
                console.assert(part.args.length === 1);
                const arg = part.args[0];
                if (typeof arg === 'object') {
                    result[arg.capture] = applyFilters(cheerio(node), arg.filterList);
                }
                else {
                    throw new Error('Content func `node` must be in `node($foo)` form');
                }
            }
            else if (part.funcName === 'contains') {
                console.assert(part.args.length === 1);
                const arg = part.args[0];
                if (typeof arg === 'string') {
                    // contains('<some-text>') -> text(_, '<some-text>', _)
                    const textCaptureResult = captureString(node.text(), [ignoreCapture, arg, ignoreCapture]);
                    if (textCaptureResult == null) {
                        return null;
                    }
                    mergeResult(result, textCaptureResult);
                }
                else {
                    throw new Error('Content func `contains` must be in `text(<some-text>)` form');
                }
            }
            else {
                throw new Error(`${part.funcName} is not a valid content-func.`);
            }
        }
        return result;
    }
    function makeSelfCapturer(selfSelector) {
        return (node) => {
            const result = {};
            if (selfSelector.attrList) {
                mergeResult(result, captureAttrs(node, selfSelector.attrList));
            }
            if (selfSelector.content) {
                const contentCaptureResult = captureContent(node, selfSelector.content);
                if (contentCaptureResult == null) {
                    return null;
                }
                mergeResult(result, contentCaptureResult);
            }
            return result;
        };
    }
    // 对string进行多段匹配/捕获. 匹配之前会先调用String#trim来修剪参数s
    // matchString('I like apple', ['I', { capture: 'foo' }])的结果为
    //  { foo: ' like apple' }
    // 如果匹配失败, 则返回null
    // todo 需要用回溯的方法来正确处理多种匹配选择的情况
    function captureString(s, args) {
        const trimed = s.trim();
        const result = {};
        // 标记正在进行的capture, null表示没有在捕获中
        let capturing = null;
        let charIndex = 0;
        for (const arg of args) {
            if (typeof arg === 'string') {
                if (capturing) {
                    const c = trimed.indexOf(arg, charIndex);
                    if (c === -1) {
                        return null;
                    }
                    else {
                        result[capturing.capture] = applyFilters(trimed.substring(charIndex, c), capturing.filterList);
                        capturing = null;
                        charIndex = c + arg.length;
                    }
                }
                else {
                    if (trimed.substring(charIndex).startsWith(arg)) {
                        charIndex += arg.length;
                    }
                    else {
                        return null; // fail
                    }
                }
            }
            else {
                capturing = arg;
            }
        }
        if (capturing) {
            result[capturing.capture] = applyFilters(trimed.substring(charIndex).trim(), capturing.filterList);
            charIndex = s.length;
        }
        if (charIndex !== s.length) {
            // 字符串结尾处还有字符尚未匹配
            return null;
        }
        return result;
    }
    // todo makeValueCapturer命名是不是有问题???
    function makeValueCapturer(cssPartArray) {
        return (node) => {
            const result = {};
            // notice 目前只能在最后一个part中进行value-capture
            const lastCssPart = cssPartArray[cssPartArray.length - 1];
            if (lastCssPart.attrList) {
                mergeResult(result, captureAttrs(node, lastCssPart.attrList));
            }
            if (lastCssPart.content) {
                const contentCaptureResult = captureContent(node, lastCssPart.content);
                if (contentCaptureResult == null) {
                    return null;
                }
                mergeResult(result, contentCaptureResult);
            }
            return result;
        };
    }
}
exports.default = temme;
function hasConsecutiveValueCapture(args) {
    for (let i = 1; i < args.length; i++) {
        const prev = typeof args[i - 1] === 'object';
        const cnt = typeof args[i] === 'object';
        if (prev && cnt) {
            return true;
        }
    }
    return false;
}
/** 根据CssPart数组构造标准的css selector */
function makeNormalCssSelector(cssPartArray) {
    const seperator = ' ';
    const result = [];
    cssPartArray.forEach((cssPart, index) => {
        if (index !== 0) {
            result.push(seperator);
        }
        if (cssPart.direct) {
            result.push('>');
        }
        if (cssPart.tag) {
            result.push(cssPart.tag);
        }
        if (cssPart.id) {
            result.push('#' + cssPart.id);
        }
        if (cssPart.classList) {
            cssPart.classList.forEach(cls => result.push('.' + cls));
        }
        if (cssPart.attrList && cssPart.attrList.some(attr => (typeof attr.value === 'string'))) {
            result.push('[');
            cssPart.attrList.forEach(attr => {
                if (attr.value === '') {
                    result.push(attr.name);
                }
                else if (typeof attr.value === 'string') {
                    result.push(`${attr.name}="${attr.value}"`);
                }
                else {
                    result.push(seperator);
                }
            });
            result.push(']');
        }
    });
    return result.join('');
}
