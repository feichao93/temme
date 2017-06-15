"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const pegjs = require("pegjs");
const cheerio = require("cheerio");
const errors = {
    funcNameNotSupported(f) {
        return `${f} is not a valid content func-name.`;
    },
};
const defaultCaptureKey = '@@default-capture@@';
const ignoreCaptureKey = '@@ignore-capture@@';
const ignoreCapture = { capture: ignoreCaptureKey };
const grammar = fs.readFileSync(path.resolve(__dirname, '../src/temme.pegjs'), 'utf8');
exports.temmeParser = pegjs.generate(grammar);
function isCheerioStatic(arg) {
    return typeof arg.root === 'function';
}
function temme(html, selector) {
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
        rootSelector = exports.temmeParser.parse(selector);
    }
    else {
        rootSelector = selector;
    }
    return helper($.root(), [rootSelector]);
    function helper(cntCheerio, selectorArray) {
        const result = {};
        selectorArray.map(selector => {
            if (selector.self === false) {
                const cssSelector = makeNormalCssSelector(selector.css);
                const subCheerio = cntCheerio.find(cssSelector);
                const capturer = makeValueCapturer(selector.css);
                Object.assign(result, capturer(subCheerio));
                if (selector.name && selector.children) {
                    result[selector.name] = subCheerio.toArray()
                        .map(sub => helper($(sub), selector.children))
                        .filter(r => Object.keys(r).length > 0);
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
                    Object.assign(result, capturer(cntCheerio));
                }
            }
        });
        delete result[ignoreCaptureKey];
        if (result[defaultCaptureKey]) {
            return result[defaultCaptureKey];
        }
        else {
            return result;
        }
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
function captureAttrs(node, attrList) {
    const result = {};
    for (const attr of attrList) {
        if (typeof attr.value === 'object') {
            const value = node.attr(attr.name);
            if (value !== undefined) {
                result[attr.value.capture] = value;
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
        console.assert(['text', 'html', 'node', 'contains'].includes(part.funcName), errors.funcNameNotSupported(part.funcName));
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
            Object.assign(result, textCaptureResult);
        }
        else if (part.funcName === 'html') {
            const htmlCaptureResult = captureString(node.html(), part.args);
            if (htmlCaptureResult == null) {
                return null;
            }
            Object.assign(result, htmlCaptureResult);
        }
        else if (part.funcName === 'node') {
            console.assert(part.args.length === 1);
            const arg = part.args[0];
            if (typeof arg === 'object') {
                result[arg.capture] = cheerio(node);
            }
            else {
                throw new Error('Cotnent func `text` must be in `text($foo)` form');
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
                Object.assign(result, textCaptureResult);
            }
            else {
                throw new Error('Cotnent func `contains` must be in `text(<some-text>)` form');
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
            Object.assign(result, captureAttrs(node, selfSelector.attrList));
        }
        if (selfSelector.content) {
            const contentCaptureResult = captureContent(node, selfSelector.content);
            if (contentCaptureResult == null) {
                return null;
            }
            Object.assign(result, contentCaptureResult);
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
    // 标记正在捕获的字段名称, 空字符表示没有在捕获中
    let capturing = '';
    let charIndex = 0;
    for (const arg of args) {
        if (typeof arg === 'string') {
            if (capturing) {
                const c = trimed.indexOf(arg, charIndex);
                if (c === -1) {
                    return null;
                }
                else {
                    result[capturing] = trimed.substring(charIndex, c).trim();
                    capturing = '';
                    charIndex = c + arg.length;
                }
            }
            else {
                if (trimed.substring(charIndex).startsWith(arg)) {
                    charIndex += arg.length;
                    continue;
                }
                else {
                    return null; // fail
                }
            }
        }
        else {
            capturing = arg.capture;
        }
    }
    if (capturing) {
        result[capturing] = trimed.substring(charIndex).trim();
        charIndex = s.length;
    }
    if (charIndex !== s.length) {
        // 字符串结尾处还有字符尚未匹配
        return null;
    }
    return result;
}
exports.captureString = captureString;
// todo makeValueCapturer命名是不是有问题???
function makeValueCapturer(cssPartArray) {
    return (node) => {
        const result = {};
        // todo 目前只能在最后一个part中进行value-capture
        const lastCssPart = cssPartArray[cssPartArray.length - 1];
        if (lastCssPart.attrList) {
            Object.assign(result, captureAttrs(node, lastCssPart.attrList));
        }
        if (lastCssPart.content) {
            const contentCaptureResult = captureContent(node, lastCssPart.content);
            if (contentCaptureResult == null) {
                return null;
            }
            Object.assign(result, contentCaptureResult);
        }
        return result;
    };
}
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
            cssPart.classList.forEach(class_ => result.push('.' + class_));
        }
        if (cssPart.attrList && cssPart.attrList.some(attr => (typeof attr.value === 'string'))) {
            result.push('[');
            cssPart.attrList.forEach(attr => {
                if (attr.value === '') {
                    result.push(attr.name);
                }
                else if (typeof attr.value === 'string') {
                    result.push(`${attr.name}="${attr.value}"`);
                } // else value-capture
                result.push(seperator);
            });
            result.push(']');
        }
    });
    return result.join('');
}
