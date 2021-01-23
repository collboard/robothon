import { FunctionBuilderVariable } from './FunctionBuilderVariable';

export type FunctionBuilderFunction = {
    title: string;
    variables: { [key: string]: FunctionBuilderVariable };
    func: (x: number, variables: { [key: string]: number }) => number;
};
