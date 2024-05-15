/* eslint-disable no-console */
import Parser from '../../src/Parser';
import Settings from '../../src/Settings';
import fs from 'fs';
import path from 'path';

describe('Parser', () => {
    let parser;
    const logFilePath = path.join(__dirname, 'logs.json');

    beforeEach(() => {
        const settings = new Settings();
        parser = new Parser("", settings);
    });

    test('parses simple mathematical expressions', () => {
        parser = new Parser("x^{2} + y", new Settings());
        parser = new Parser(
            // eslint-disable-next-line no-useless-escape
            "(2x^2 * 3x^4 + 2x + 5x^2 + 6x + 100 + 9)(x - 2)",
            new Settings());
        const output = parser.parse();
        console.log(`👾 parser.output[0]: `, output[0]);
        console.log(`👾 parser.output[0].sup: `, output[0].sup);
        try {
            fs.writeFileSync(
                logFilePath,
                JSON.stringify(output, ((_k, _v) => {
                    if (_k !== 'loc') {
                        return _v;
                    } else {
                        return undefined;
                    }
                }), 4),
                'utf-8'
            );
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
        expect(output.length).toBeGreaterThan(0);
        // Check the type of the parse node
        expect(output[0].type).toEqual('ordgroup');
    });

    test('throws errors for unsupported commands', () => {
        parser = new Parser("\\foobar", new Settings());
        expect(() => parser.parse()).toThrow();
    });

    test('expands macros correctly', () => {
        const settings = new Settings({
            macros: {
                "\\foo": "1 + 1",
            },
        });
        parser = new Parser("\\foo + x", settings);
        const output = parser.parse();
        expect(output).toEqual(expect.arrayContaining([
            expect.objectContaining({type: 'ordgroup'}),
        ]));
    });

    test('handles LaTeX environments', () => {
        parser = new Parser("\\begin{array}{c} x \\end{array}", new Settings());
        const output = parser.parse();
        expect(output).toEqual(expect.arrayContaining([
            expect.objectContaining({type: 'array'}),
        ]));
    });

    test('parses complex expressions with functions', () => {
        parser = new Parser("\\frac{1}{2}", new Settings());
        const output = parser.parse();
        expect(output).toEqual(expect.arrayContaining([
            expect.objectContaining({type: 'genfrac'}),
        ]));
    });
});
