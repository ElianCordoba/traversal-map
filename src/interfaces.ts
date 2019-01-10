export interface Options {
  useDotNotationOnKeys?: boolean;
}

type ArrayLike = { lenght: number };
export type Iterable = Object | Array<any> | ArrayLike;
