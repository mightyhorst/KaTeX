/* eslint-disable no-console */
import Lexer from '../../src/Lexer';

describe('Lexer', () => {
    it('should tokenize input correctly', () => {
        const input = 'x^{2}';
        const lexer = new Lexer(input);
        const tokens = [];

        let token = lexer.lex();
        let i = 0;
        const MAX = 100;
        while (token.type !== 'EOF' && i < MAX) {
            tokens.push(token);
            token = lexer.lex();
            i++;
        }
        if (i === MAX) {
            // eslint-disable-next-line no-console
            console.log(`❌ hit the max`);
        }

        // Output tokens to console (only for debugging)
        // eslint-disable-next-line no-console
        console.log(`👜 Tokens: `, tokens);

        // Expectations about the output tokens
        expect(tokens.length).toBeGreaterThan(0); // Ensure we have tokens
        expect(tokens[0].text).toBe('x');
        expect(tokens[1].text).toBe('^');
        expect(tokens[2].text).toBe('{');
        expect(tokens[3].text).toBe('2');
        expect(tokens[4].text).toBe('}');
        expect(tokens[5].text).toBe('EOF');
    });
});
