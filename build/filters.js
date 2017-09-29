"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFilterMap = {
    pack() {
        return Object.assign({}, ...this);
    },
    compact() {
        return this.filter(Boolean);
    },
    flatten() {
        return this.reduce((r, a) => r.concat(a));
    },
    words() {
        return this.split(/\s+/g);
    },
    lines() {
        return this.split(/\r?\n/g);
    },
    Number() {
        return Number(this);
    },
    String() {
        return String(this);
    },
    Boolean() {
        return Boolean(this);
    },
    Date() {
        return new Date(this);
    },
};
function defineFilter(name, filter) {
    exports.defaultFilterMap[name] = filter;
}
exports.defineFilter = defineFilter;
