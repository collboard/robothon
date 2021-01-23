import { FunctionBuilderFunction } from './interfaces/FunctionBuilderFunction';

export const functionBuilderDefinitions: { [key: string]: FunctionBuilderFunction } = {
    x: {
        title: 'x',
        variables: {},
        func: (x, _args) => {
            return x;
        },
    },
    sin: {
        title: 'sin($a)',
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            return Math.sin(a);
        },
    },
    cos: {
        title: 'cos($a)',
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            return Math.cos(a);
        },
    },
    tan: {
        title: 'tan($a)',
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            return Math.tan(a);
        },
    },
    sinh: {
        title: 'sinh($a)',
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            return Math.sinh(a);
        },
    },
    cosh: {
        title: 'cosh($a)',
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            return Math.cosh(a);
        },
    },
    fract: {
        title: '$a / $b',
        variables: {
            a: {
                title: 'a',
            },
            b: {
                title: 'b',
            },
        },
        func: (_x, { a, b }) => {
            return a / b;
        },
    },
    add: {
        title: '$a + $b',
        variables: {
            a: {
                title: 'a',
            },
            b: {
                title: 'b',
            },
        },
        func: (_x, { a, b }) => {
            return a + b;
        },
    },
    subtract: {
        title: '$a - $b',
        variables: {
            a: {
                title: 'a',
            },
            b: {
                title: 'b',
            },
        },
        func: (_x, { a, b }) => {
            return a - b;
        },
    },
    multiply: {
        title: '$a * $b',
        variables: {
            a: {
                title: 'a',
            },
            b: {
                title: 'b',
            },
        },
        func: (_x, { a, b }) => {
            return a * b;
        },
    },

    // *TODO: How to do constants?
    // *TODO: constant+a/b
    // ?TODO: Logistic
    // *TODO: Magic triangle - log, power,...
    // ?TODO: cotg
    // *TODO: sinh, cosh,...
    // *TODO: sin<sup>-1</sup>

    /*
    Note: big nice to have

    derivative: {
        title: `∂($a)`,
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            // TODO: Previous values
            // TODO:
            return 0;
        },
    },

    integral: {
        title: `∫($a)`,
        variables: {
            a: {
                title: 'a',
            },
        },
        func: (_x, { a }) => {
            // TODO: Previous values
            // TODO:
            return 0;
        },
    },
    */
};
