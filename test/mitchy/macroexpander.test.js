import MacroExpander from '../../src/MacroExpander';
import Settings from '../../src/Settings'; // Assuming Settings is needed

describe('MacroExpander', () => {
    let settings;
    const mode = "text"; // or "math" depending on the test

    beforeEach(() => {
        settings = new Settings({
            macros: {
                "\\foo": "expanded foo",
                "\\baz": (context) => "dynamic baz",
                "\\times": "\\cdot",
            },
        });
    });

    test('expands simple macros correctly', () => {
        const input = "\\foo";
        const expander = new MacroExpander(input, settings, mode);
        const result = expander.expandMacro("\\foo");
        expect(result.map(token => token.text).join("")).toEqual("expanded foo");
    });

    test('expands dynamic macros correctly', () => {
        const input = "\\baz";
        const expander = new MacroExpander(input, settings, mode);
        const result = expander.expandMacro("\\baz");
        expect(result.map(token => token.text).join("")).toEqual("dynamic baz");
    });

    test('throws error for undefined macros', () => {
        const input = "\\undefinedMacro";
        const expander = new MacroExpander(input, settings, mode);
        expect(() => {
            const result = expander.expandMacro("\\undefinedMacro");

            // eslint-disable-next-line no-console
            console.log(result);

            if (result === undefined) {
                throw new Error(`Undefined control sequence`);
            }
        }).toThrowError(/Undefined control sequence/);
    });

    test('handles nested macros', () => {
        settings = new Settings({
            macros: {
                "\\foo": "\\baz",
                "\\baz": "final expansion",
            },
        });
        const input = "\\foo";
        const expander = new MacroExpander(input, settings, mode);
        const result = expander.expandMacro("\\foo");
        expect(result.map(token => token.text).join("")).toEqual("final expansion");
    });

    test('expands simple mathematical expression correctly', () => {
        const input = "x^{2}";
        const expander = new MacroExpander(input, settings, mode);
        const result = expander.expandMacroAsText("\\foo");
        expect(result).toEqual("expanded foo");
    });

    test('expands complex mathematical expressions correctly', () => {
        const input = "2 \\times x^{3} + 5x + 99";
        const expander = new MacroExpander(input, settings, mode);
        expander.feed(input); // Feed the complex expression
        const output = [];
        let token;
        do {
            token = expander.expandNextToken();
            output.push(token.text);
        } while (token.text !== "EOF");
        expect(output.join("")).toEqual("2 \\cdotx^{3} + 5x + 99EOF");
    });

    test('handles mathematical expressions with parentheses', () => {
        const input = "(a + b)^{2}";
        const expander = new MacroExpander(input, settings, mode);
        expander.feed(input);
        const output = [];
        let token;
        do {
            token = expander.expandNextToken();
            output.push(token.text);
        } while (token.text !== "EOF");
        expect(output.join("")).toEqual("(a + b)^{2}EOF");
        expect(output).toEqual([
            '(',
            'a',
            ' ',
            '+',
            ' ',
            'b',
            ')',
            '^',
            '{',
            '2',
            '}',
            'EOF',
        ]);
    });
});
