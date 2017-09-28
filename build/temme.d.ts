/// <reference types="cheerio" />
import * as pegjs from 'pegjs';
import * as cheerio from 'cheerio';
export { cheerio };
export declare const errors: {
    hasLeadingCapture(): string;
};
export declare const temmeParser: pegjs.Parser;
export interface FilterFn {
    (this: any, ...args: any[]): any;
}
export interface FilterFnMap {
    [key: string]: FilterFn;
}
export declare type TemmeSelector = SelfSelector | NonSelfSelector;
export interface NonSelfSelector {
    self: false;
    name: string;
    css: CssPart[];
    children: TemmeSelector[];
    filterList: Filter[];
}
export interface SelfSelector {
    self: true;
    id: string;
    classList: string[];
    attrList: CssAttr[];
    content: ContentPart[];
}
export interface CssAttr {
    name: string;
    value: string | Capture<string>;
}
export declare type CaptureResult = any;
export interface CssPart {
    direct: boolean;
    tag: string;
    id: string;
    classList: string[];
    attrList: CssAttr[];
    content: ContentPart[];
}
export declare type ContentPart = {
    funcName: FuncName;
    args: ContentPartArg[];
};
export declare type ContentPartArg = string | Capture<string>;
export declare type FuncName = 'text' | 'html' | 'node' | 'contains';
export declare type Capture<T> = {
    capture: T;
    filterList: Filter[];
};
export interface Filter {
    name: string;
    args: string[];
}
export declare function mergeResult<T, S>(target: T, source: S): T & S;
export default function temme(html: string | CheerioStatic | CheerioElement, selector: string | TemmeSelector[], extraFilters?: {
    [key: string]: FilterFn;
}): any;
export declare function defineFilter(name: string, filter: FilterFn): void;
