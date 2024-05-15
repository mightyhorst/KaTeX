/* eslint-disable comma-dangle */
/* eslint-disable no-case-declarations */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-len */
// input text
const txtMaths = "(2x^2 * 3x^4 + 2x + 5x^2 + 6x + 100 + 9)(x - 2)";
// parser from katex
const astParserFromKatex = [
    {
        "type": "atom",
        "mode": "math",
        "family": "open",
        "text": "(",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "2",
    },
    {
        "type": "supsub",
        "mode": "math",
        "base": {
            "type": "mathord",
            "mode": "math",
            "text": "x",
        },
        "sup": {
            "type": "textord",
            "mode": "math",
            "text": "2",
        },
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "*",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "3",
    },
    {
        "type": "supsub",
        "mode": "math",
        "base": {
            "type": "mathord",
            "mode": "math",
            "text": "x",
        },
        "sup": {
            "type": "textord",
            "mode": "math",
            "text": "4",
        },
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "+",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "2",
    },
    {
        "type": "mathord",
        "mode": "math",
        "text": "x",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "+",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "5",
    },
    {
        "type": "supsub",
        "mode": "math",
        "base": {
            "type": "mathord",
            "mode": "math",
            "text": "x",
        },
        "sup": {
            "type": "textord",
            "mode": "math",
            "text": "2",
        },
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "+",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "6",
    },
    {
        "type": "mathord",
        "mode": "math",
        "text": "x",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "+",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "1",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "0",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "0",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "+",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "9",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "close",
        "text": ")",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "open",
        "text": "(",
    },
    {
        "type": "mathord",
        "mode": "math",
        "text": "x",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "-",
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "2",
    },
    {
        "type": "atom",
        "mode": "math",
        "family": "close",
        "text": ")",
    },
];

function cleanStructuredAst(katexAst) {
    const cleanedAst = [];
    const lenKatexAst = katexAst.length;

    // Iterate through the AST
    for (let i = 0; i < lenKatexAst; i++) {
        const item = katexAst[i];

        // Check for a number followed by a supsub, which signifies a base and exponent
        if (item.type === 'textord' && !isNaN(item.text) && i + 1 < lenKatexAst && katexAst[i + 1].type === 'supsub') {
            const nextItem = katexAst[i + 1];

            // Assign the coefficient and skip the nextItem since it will be processed now
            nextItem.base.coefficient = item.text;  // Attach the coefficient
            cleanedAst.push(nextItem);  // Add the modified 'supsub' to the cleaned AST
            i++;  // Increment to skip the next item as it's already processed
        } else {
            // For all other cases, add the item to the cleaned AST
            cleanedAst.push(item);
        }
    }
    return cleanedAst;
}


function createStructuredAst(ast) {
    const katexAst = cleanStructuredAst(ast);
    console.log('🌳 ast:\n', ast);
    console.log('🌳 katexAst:\n', katexAst);
    const stack = [];
    let currentGroup = [];
    const hasBracketStack = [];  // Stack to track if current group has brackets
    let lastNumberBuffer = ''; // Buffer to accumulate digit sequences

    // Inside your createStructuredAst or relevant function
    katexAst.forEach(token => {
        if (token.type === 'textord' && !isNaN(token.text)) {
            // Buffer digits to form complete numbers
            lastNumberBuffer += token.text;
            return; // Delay pushing until non-digit is encountered
        }

        if (lastNumberBuffer) {
            // If we have a buffered number and encounter a non-digit
            currentGroup.push({
                type: 'term',
                base: lastNumberBuffer,
                exponent: 1
            });
            lastNumberBuffer = '';  // Reset buffer
        }

        switch (token.type) {
            case 'atom':
                if (token.family === 'open') {
                    stack.push(currentGroup);
                    hasBracketStack.push(true);  // Note this group has brackets
                    currentGroup = [];
                } else if (token.family === 'close') {
                    const group = currentGroup;
                    const hasBrackets = hasBracketStack.pop();
                    currentGroup = stack.pop();
                    currentGroup.push({
                        type: 'grouping',
                        hasBrackets: hasBrackets,
                        grouping: group,
                        operator: determineOperator(group)
                    });
                } else if (token.family === 'bin') {
                    currentGroup.push({
                        type: 'operator',
                        value: token.text
                    });
                }
                break;
            case 'textord':
            case 'mathord':
                currentGroup.push({
                    type: 'term',
                    coefficient: token.text === 'x' ? undefined : token.text,
                    base: token.text,
                    exponent: 1
                });
                break;
            case 'supsub':
                if (currentGroup.length > 0) {
                    const lastTerm = currentGroup.pop();
                    if (lastTerm && !lastTerm.coefficient && /^\d+$/.test(lastTerm.base)) {
                        // If the last term is just a number, treat it as a coefficient
                        lastTerm.coefficient = lastTerm.base;
                        lastTerm.base = token.base.text;
                    }
                    lastTerm.exponent = token.sup.text;
                    currentGroup.push(lastTerm);
                } else {
                    console.error('Unexpected state: No last term to pop for supsub processing');
                }
                break;
        }
    });


    // Check if there's any remaining number buffered (in case the input ends with numbers)
    if (lastNumberBuffer) {
        currentGroup.push({
            type: 'term',
            base: lastNumberBuffer,
            exponent: 1
        });
    }

    return {
        type: 'quadratic',
        brackets: currentGroup
    };
}

function determineOperator(group) {
    // Implement logic to determine the main operator based on the group content
    return group.reduce((acc, elem) => elem.type === 'operator' ? elem.value : acc, '+');
}
function hasKey(obj, key) {
    return obj.hasOwnProperty(key);
}
function getKey(obj, key) {
    if (hasKey(obj, key)) {
        return obj[key];
    }
    throw new Error(`⛑️ the obj does not have the key: 👉` + key + `, \nobj: 👉` + JSON.stringify(obj, null, 2));
}
function smooshGroup(grouping) {
    if (getKey(grouping, 'type') === 'grouping') {
        const payload = getKey(grouping, 'grouping');
        const coolPayload = [];
        let lastOperator = undefined;
        for (let i = 0; i < payload.length; i++) {
            const item = payload[i];
            switch (item.type) {
                case 'operator':
                    lastOperator = item;
                    break;
                case 'term':
                    if (lastOperator) {
                        item.operator = lastOperator.value;
                        lastOperator = undefined;
                    }
                    coolPayload.push(item);
                    break;
                case 'grouping':
                    coolPayload.push(smooshGroup(item));
                    break;
            }

        }
        return coolPayload;
    }
}
function pass() { }
function groupByBEDMAS(grouping) {
    const group = smooshGroup(grouping);
    const payload = [];
    let lastGroup = [];
    let lastItem = undefined;
    let lastOperator = undefined;
    for (let i = 0; i < group.length; i++) {
        const item = group[i];
        switch (item.type) {
            case 'term':
                lastGroup.push(item);
                if (i > 0) {
                    if (lastOperator !== item.operator) {
                        if (
                            (lastOperator === '+' && item.operator === '-') ||
                            (lastOperator === '-' && item.operator === '+')
                        ) {
                            if (lastItem.base !== item.base) {
                                if (isNaN(lastItem.base) && isNaN(item.base)) {
                                    payload.push(lastGroup);
                                    lastGroup = [];
                                }
                            }
                            pass();
                        } else if (lastOperator === '*' && item.operator === '/') {
                            pass();
                        } else if (lastOperator === '/' && item.operator === '*') {
                            pass();
                        } else {
                            payload.push(lastGroup);
                            lastGroup = [];
                        }
                    }
                    if (item.operator) {
                        lastItem = item;
                        lastOperator = item.operator;
                    }
                }
                break;
            case 'grouping':
                payload.push(groupByBEDMAS(item));
                break;
            case 'operator':
                console.error('🚨 "operator" is not implemented');
                break;
        }
    }
    return payload;
}

const structuredAst = createStructuredAst(astParserFromKatex);
const groupedAst = groupByBEDMAS(structuredAst.brackets[0]);


// Example use
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs.ast.json');
fs.writeFileSync(
    logFilePath,
    JSON.stringify(structuredAst, null, 4),
    'utf-8',
);
fs.writeFileSync(
    path.join(__dirname, 'logs.ast.grouped.json'),
    JSON.stringify(groupedAst, null, 4),
    'utf-8',
);


// how do we convert the ast tree from katex into the ast tree below
// (2x^2 * 3x^4 + 2x + 5x^2 + 6x + 100 + 9)(x - 2)
const astTree = {
    type: 'quadratic',
    brackets: [
        {
            type: 'grouping',
            operator: '+',
            grouping: [
                {
                    // 2x^2 * 3x^4
                    type: 'grouping',
                    hasBrackets: false,
                    operator: '*',
                    grouping: [
                        {
                            type: 'term',
                            sign: '+',
                            coefficient: 2,
                            base: 'x',
                            exponent: 2,
                        },
                        {
                            operator: '*',
                            type: 'term',
                            sign: '+',
                            coefficient: 3,
                            base: 'x',
                            exponent: 4,
                        },
                        {
                            type: 'term',
                            sign: '+',
                            coefficient: 2,
                            base: 'x',
                            exponent: 1,
                        },
                    ],
                },
                // 5x^2
                {
                    type: 'grouping',
                    operator: '+',
                    hasBrackets: false,
                    grouping: [
                        {
                            type: 'term',
                            coefficient: 5,
                            base: 'x',
                            exponent: 2,
                        },
                    ],
                },
                // 2x + 6x
                {
                    type: 'grouping',
                    operator: '+',
                    hasBrackets: false,
                    grouping: [
                        {
                            type: 'term',
                            coefficient: 2,
                            base: 'x',
                            exponent: 1,
                        },
                        {
                            type: 'term',
                            coefficient: 6,
                            base: 'x',
                            exponent: 1,
                        },
                    ],
                },
                // 100 + 9
                {
                    type: 'grouping',
                    operator: '+',
                    hasBrackets: false,
                    grouping: [
                        {
                            type: 'term',
                            base: 100,
                            exponent: 1,
                        },
                        {
                            type: 'term',
                            base: 9,
                            exponent: 1,
                        },
                    ],
                },
            ],
        },
        {
            type: 'grouping',
            defaultOperator: '+',
            grouping: [
                {
                    type: 'term',
                    base: 'x',
                },
                {
                    operator: '-',
                    base: 2,
                },
            ],
        },
    ],
};
// export default astTree;
