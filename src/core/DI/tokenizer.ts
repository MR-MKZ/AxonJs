type Token =
    | { type: 'identifier'; value: string }
    | { type: 'brace'; value: '{' | '}' }
    | { type: 'bracket'; value: '[' | ']' }
    | { type: 'paren'; value: '(' | ')' }
    | { type: 'comma' }
    | { type: 'colon' }
    | { type: 'equals' }
    | { type: 'string'; value: string }
    | { type: 'number'; value: string }
    | { type: 'operator'; value: string }
    | { type: 'eof' };

const tokenize = (str: string): Token[] => {
    const tokens: Token[] = [];
    let i = 0;

    const isWhitespace = (ch: string) => /\s/.test(ch);
    const isIdentifierChar = (ch: string) => /[a-zA-Z0-9_$]/.test(ch);

    while (i < str.length) {
        const ch = str[i];

        if (isWhitespace(ch)) {
            i++;
            continue;
        }

        if (ch === '{' || ch === '}') {
            tokens.push({ type: 'brace', value: ch });
            i++;
            continue;
        }

        if (ch === '[' || ch === ']') {
            tokens.push({ type: 'bracket', value: ch });
            i++;
            continue;
        }

        if (ch === '(' || ch === ')') {
            tokens.push({ type: 'paren', value: ch });
            i++;
            continue;
        }

        if (ch === ',') {
            tokens.push({ type: 'comma' });
            i++;
            continue;
        }

        if (ch === ':') {
            tokens.push({ type: 'colon' });
            i++;
            continue;
        }

        if (ch === '=') {
            tokens.push({ type: 'equals' });
            i++;
            continue;
        }

        if (ch === '"' || ch === "'") {
            const quote = ch;
            let value = '';
            i++;
            while (i < str.length && str[i] !== quote) {
                value += str[i++];
            }
            i++; // Skip closing quote
            tokens.push({ type: 'string', value });
            continue;
        }

        if (/\d/.test(ch)) {
            let num = '';
            while (i < str.length && /[\d.]/.test(str[i])) {
                num += str[i++];
            }
            tokens.push({ type: 'number', value: num });
            continue;
        }

        if (isIdentifierChar(ch)) {
            let id = '';
            while (i < str.length && isIdentifierChar(str[i])) {
                id += str[i++];
            }
            tokens.push({ type: 'identifier', value: id });
            continue;
        }

        throw new Error(`Unknown token: ${ch}`);
    }

    tokens.push({ type: 'eof' });
    return tokens;
};


/** Parser: extract keys from the 3rd argument if it's a destructured object */
export function extractDestructuredThirdArgKeys(fn: Function): string[] {
    const fnStr = fn.toString();
    const match = fnStr.match(/\(([^)]*)\)/);
    if (!match) return [];

    const args = match[1];
    const tokens = tokenize(args);

    // Get third argument tokens by parsing top-level commas
    const thirdArgTokens: Token[] = [];
    let depth = 0;
    let argIndex = 0;

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        if (t.type === 'comma' && depth === 0) {
            argIndex++;
            continue;
        }

        if (argIndex === 2) thirdArgTokens.push(t);

        if (t.type === 'brace' || t.type === 'bracket' || t.type === 'paren') {
            if (['{', '[', '('].includes(t.value)) depth++;
            else if (['}', ']', ')'].includes(t.value)) depth--;
        }

    }

    if (
        thirdArgTokens.length === 0 ||
        thirdArgTokens[0].type !== 'brace' ||
        thirdArgTokens[0].value !== '{'
    ) {
        return [];
    }

    // Extract keys from destructured object
    const keys: string[] = [];
    let i = 1; // skip initial '{'

    while (i < thirdArgTokens.length) {
        const token = thirdArgTokens[i];

        if (!token || (token.type === 'brace' && token.value === '}')) break;

        if (token.type === 'identifier') {
            keys.push(token.value);

            // Check for `=` and skip default value expression
            if (thirdArgTokens[i + 1]?.type === 'equals') {
                i += 2;
                let nested = 0;
                while (i < thirdArgTokens.length) {
                    const t = thirdArgTokens[i];

                    if (t.type === 'brace' || t.type === 'bracket' || t.type === 'paren') {
                        if (['{', '[', '('].includes(t.value)) nested++;
                        else if (['}', ']', ')'].includes(t.value)) nested--;
                    }


                    // exit if we hit comma at top-level
                    if (nested <= 0 && t.type === 'comma') break;

                    i++;
                }
            }
        }

        i++;

        // Skip non-identifiers (commas, colons, etc.)
        while (
            i < thirdArgTokens.length &&
            !['identifier', 'brace'].includes(thirdArgTokens[i]?.type)
        ) {
            i++;
        }
    }

    return keys;
}