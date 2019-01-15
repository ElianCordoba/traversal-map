import { Options } from "./interfaces";

export const DEFAULTS: Options = {
  useDotNotationOnKeys: true
};

interface FlowControlReturnValues {
  CONTINUE: '0' | undefined;
  BREAK_CURRENT: '10' | false;
  BREAK_ALL: '11';
  SKIP_CHILDREN: '20';
}

export const LOOP: FlowControlReturnValues = {
  CONTINUE: '0',
  BREAK_CURRENT: '10',
  BREAK_ALL: '11',
  SKIP_CHILDREN: '20'
};
