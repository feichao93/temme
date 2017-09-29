export interface FilterFn {
    (this: any, ...args: any[]): any;
}
export interface FilterFnMap {
    [key: string]: FilterFn;
}
export declare const defaultFilterMap: FilterFnMap;
export declare function defineFilter(name: string, filter: FilterFn): void;
