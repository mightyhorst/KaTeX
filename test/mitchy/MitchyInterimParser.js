/* eslint-disable curly */
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

function joinAllNumbersTogether(katexAst) {
    /* 👾 e.g.
    {
        "type": "textord",
        "mode": "math",
        "text": "1"
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "0"
    },
    {
        "type": "textord",
        "mode": "math",
        "text": "0"
    }
    👾 */
    const isNumberNode = (node) => node.type === 'textord' && node.mode === 'math' && !isNaN(node.text);

    const stack = [];
    let currentNumber = ""; // Used to accumulate numbers

    katexAst.forEach((node, index) => {
        if (isNumberNode(node)) {
            // Accumulate numeric text if it's a number
            currentNumber += node.text;
            // Check if next node is not a number or it's the last node
            if (index === katexAst.length - 1 || !isNumberNode(katexAst[index + 1])) {
                // Push the accumulated number as a single node when no more numbers follow
                stack.push({
                    type: 'textord',
                    mode: 'math',
                    text: currentNumber
                });
                currentNumber = ""; // Reset for the next number
            }
        } else {
            // If current node is not a number and there's an accumulated number, push it first
            if (currentNumber.length > 0) {
                stack.push({
                    type: 'textord',
                    mode: 'math',
                    text: currentNumber
                });
                currentNumber = ""; // Reset after pushing
            }
            // Push non-number node to stack
            stack.push(node);
        }
    });

    return stack;
}
function cleanStructuredAst(katexAst) {
    const cleanedAst = [];
    const lenKatexAst = katexAst.length;

    // Iterate through the AST
    for (let i = 0; i < lenKatexAst; i++) {
        const item = katexAst[i];
        const nextIdx = i + 1;
        const nextItem = katexAst[nextIdx];
        //
        // Check for a number followed by a supsub, which signifies a base and exponent
        if (
            (item.type === 'textord' && !isNaN(item.text) && nextIdx < lenKatexAst && !isNum(nextItem.text) && (nextItem.type === 'supsub' || nextItem.type === 'mathord'))
        ) {
            // Assign the coefficient and skip the nextItem since it will be processed now
            if (nextItem.type === 'supsub') {
                // nextItem.base.coefficient = item.text;  // Attach the coefficient
                nextItem.coefficient = item.text;  // Attach the coefficient
            } else if (nextItem.type === 'mathord') {
                nextItem.coefficient = item.text;  // Attach the coefficient
            }
            nextItem.uuid = createUuid();
            cleanedAst.push(nextItem);  // Add the modified 'supsub' to the cleaned AST
            i++;  // Increment to skip the next item as it's already processed
        } else {
            // For all other cases, add the item to the cleaned AST
            item.uuid = createUuid();
            cleanedAst.push(item);
        }
    }
    return cleanedAst;
}
let _uuid = 0;
function createUuid() {
    return _uuid++;
}
function astConstant(constant) {
    return {
        uuid: createUuid(),
        type: 'constant',
        constant,
        text: constant,
    };
}
function astVar(variable) {
    return {
        uuid: createUuid(),
        type: 'variable',
        variable,
        text: variable,
    };
}
function astOp({
    uuid,
    operator,
}) {
    /*
    {
        "type": "atom",
        "mode": "math",
        "family": "bin",
        "text": "*",
        "uuid": 24
    }
    */
    return {
        uuid: uuid || createUuid(),
        type: 'operator',
        operator: operator,
    };
}
function astTerm({
    uuid,
    coefficient,
    base,
    exponent,
}) {
    return {
        uuid: uuid || createUuid(),
        type: 'term',
        coefficient: coefficient || 1,
        base,
        exponent: exponent || 1,
        text: `${coefficient || ''}${base.text}${exponent?.text ? '^' + exponent?.text : ''}`,
    };
}
function convert(node) {
    /* 👾
    {
        "type": "mathord",
        "mode": "math",
        "text": "x",
        "coefficient": "2",
        "uuid": 27
    },
    {
        "type": "supsub",
        "mode": "math",
        "base": {
            "type": "mathord",
            "mode": "math",
            "text": "x"
        },
        "sup": {
            "type": "textord",
            "mode": "math",
            "text": "2"
        },
        "coefficient": "5",
        "uuid": 29
    }
    👾*/
    switch (node.type) {
        case 'mathord':
            return astTerm({
                uuid: node.uuid || null,
                coefficient: node.coefficient || null,
                base: isNum( node.text) ? astConstant(node.text) : astVar(node.text),
                exponent: null,
            });
        case 'supsub':
            const baseText = node?.base?.text;
            const supText = node?.sup?.text;
            return astTerm({
                uuid: node.uuid || null,
                coefficient: node.coefficient || null,
                base: isNum( baseText) ? astConstant(baseText) : astVar(baseText),
                exponent: isNum( supText) ? astConstant(supText) : astVar(supText),
            });
        case 'atom':
            /*
            {
                "type": "atom",
                "mode": "math",
                "family": "bin",
                "text": "*",
                "uuid": 24
            }
            */
            if (node.mode === 'math') {
                switch (node.text) {
                    case '+':
                    case '-':
                    case '*':
                    case '/':
                    case '÷':
                        return astOp({
                            uuid: node.uuid || null,
                            operator: node.text,
                        });
                    default:
                        return node;
                }
            } else {
                return node;
            }
        default:
            return node;
    }
}
function parseBrackets(ast) {
    console.log('🐝 parseBrackets.ast: \n', ast);
    ast = joinAllNumbersTogether(ast);
    // const cleanedAst = cleanStructuredAst(ast);
    let isBracket = false;
    const stack = [];
    let currentGroup = undefined;
    const astWithAst = [];
    for (let i = 0; i < ast.length; i++) {
        const item = ast[i];
        if (item.type === 'atom' && item.text === '(') {
            isBracket = true;
            const newGroup = {
                uuid: createUuid(),
                type: 'group',
                hasBrackets: true,
                isClosed: false,
                body: [],
            };
            stack.push(newGroup);
            currentGroup = newGroup;
        } else if (item.type === 'atom' && item.text === ')') {
            currentGroup.body = cleanStructuredAst(currentGroup.body);
            currentGroup.isClosed = true;
        } else {
            if (currentGroup && currentGroup.body) {
                // currentGroup.body.push(convert(item));
                currentGroup.body.push((item));
            } else {
                // currentGroup.push((item));
                currentGroup.push(convert(item));
            }
        }
    }
    return stack;
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
function isNum(target) {
    return !isNaN(Number(target));
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
function convertFromKatexToAst(ast) {
    function visitGroup(group) {
        const body = group.body;
        const newBody = [];
        for (let i = 0; i < body.length; i++) {
            const term = convert( body[i] );
            newBody.push(term);
        }
        return newBody;
    }
    for (let i = 0; i < ast.length; i++) {
        const item = ast[i];
        if (item.type === 'group') {
            item.body = (visitGroup(item));
        }
    }
    return ast;
}

function createGroupsFromBedmasARCHIVE(ast) {
    function visitGroup(group) {
        const allGroups = [];
        const body = group.body;
        const newGroup = () => ({
            uuid: createUuid(),
            type: 'group',
            operator: null,
            body: [],
        });

        let currentGroup = newGroup();

        for (let i = 0; i < body.length; i++) {
            const term = body[i];
            if (term.type === 'term') {
                currentGroup.body.push(term);
                // Check for the next operator
                if (i + 1 < body.length && body[i + 1].type === 'operator') {
                    const op = body[i + 1];
                    if (currentGroup.operator === null) {
                        currentGroup.operator = op.operator;
                    } else if (currentGroup.operator !== op.operator) {
                        // When the operator changes, finalize the current group and start a new one
                        allGroups.push(currentGroup);
                        currentGroup = newGroup();
                        currentGroup.operator = op.operator;
                    }
                    i++; // Move past the operator
                } else {
                    // If next item is not an operator or doesn't exist, finalize the current group
                    allGroups.push(currentGroup);
                    currentGroup = newGroup();
                }
            } else if (term.type === 'operator') {
                // Handle stray operators that may not be followed by terms
                if (i === body.length - 1 || body[i + 1].type !== 'term') {
                    if (term.operator === '+' || term.operator === '-') {
                        // 👉TODO split the currentGroup into the same base terms
                    } else {
                        currentGroup.operator = term.operator;
                        allGroups.push(currentGroup);
                        currentGroup = newGroup();
                    }
                }
            }
        }

        // If the last group has any items, push it to the result
        if (currentGroup.body.length > 0) {
            allGroups.push(currentGroup);
        }

        return allGroups;
    }

    // Iterate over the main AST, transforming each group
    for (let i = 0; i < ast.length; i++) {
        if (ast[i].type === 'group') {
            ast[i].body = visitGroup(ast[i]);
        }
    }

    return ast;
}
function createGroupsFromBedmas(ast) {
    function visitGroup(group) {
        const allGroups = [];
        const body = group.body;
        const newGroup = () => ({
            uuid: createUuid(),
            type: 'group',
            operator: null,
            body: [],
        });

        let currentGroup = newGroup();

        for (let i = 0; i < body.length; i++) {
            const item = body[i];
            if (item.type === 'term' || item.type === 'textord') {
                // Handle both terms and constants
                currentGroup.body.push(item);
                if (i + 1 < body.length && body[i + 1].type === 'operator') {
                    const op = body[i + 1];
                    if (currentGroup.operator === null) {
                        currentGroup.operator = op.operator;
                    } else if (currentGroup.operator !== op.operator) {
                        allGroups.push(currentGroup);
                        currentGroup = newGroup();
                        currentGroup.operator = op.operator;
                    }
                    i++; // Skip the operator
                } else {
                    allGroups.push(currentGroup);
                    currentGroup = newGroup();
                }
            }
        }

        if (currentGroup.body.length > 0) {
            allGroups.push(currentGroup);
        }

        return groupByBase(allGroups);
    }

    function groupByBase(groups) {
        const groupedByBase = [];
        groups.forEach(group => {
            if (group.operator === '+' || group.operator === '-') {
                const baseMap = {};
                group.body.forEach(term => {
                    const baseKey = term.base ? (term.base.variable + '^' + (term.exponent ? (term.exponent.constant || term.exponent) : '1')) : 'constant';
                    if (!baseMap[baseKey]) {
                        baseMap[baseKey] = {
                            uuid: createUuid(),
                            type: 'group',
                            operator: group.operator,
                            baseKey,
                            body: []
                        };
                    }
                    baseMap[baseKey].body.push(term);
                });
                Object.values(baseMap).forEach(g => groupedByBase.push(g));
            } else {
                groupedByBase.push(group);
            }
        });
        return groupedByBase;
    }

    for (let i = 0; i < ast.length; i++) {
        if (ast[i].type === 'group') {
            ast[i].body = visitGroup(ast[i]);
        }
    }

    return ast;
}


const structuredAst = createStructuredAst(astParserFromKatex);
// const groupedAst = groupByBEDMAS(structuredAst.brackets[0]);
// const groupedAst = parseBrackets(structuredAst.brackets[0]);
let groupedAst = parseBrackets(astParserFromKatex);
groupedAst = convertFromKatexToAst(groupedAst);
groupedAst = createGroupsFromBedmas(groupedAst);


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
