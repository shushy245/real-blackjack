/* eslint-env node */
'use strict';

/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import', 'prettier', 'perfectionist', 'react'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'prettier',
    ],
    settings: {
        react: { version: 'detect' },
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
                project: ['packages/*/tsconfig.json', 'tsconfig.base.json'],
            },
            node: true,
        },
    },
    rules: {
        // ── Const only: no let ────────────────────────────────────────────────────
        'prefer-const': 'error',
        'no-var': 'error',

        // ── No type assertions (as X / as any) ───────────────────────────────────
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],

        // ── No null (use undefined) ───────────────────────────────────────────────
        'no-restricted-syntax': [
            'error',
            {
                selector: 'ChainExpression',
                message:
                    'Avoid optional chaining (?.). Either narrow the type so undefined is ruled out, or write an explicit guard clause (if (x === undefined) return ...).',
            },
            {
                selector: 'Literal[value=null]',
                message:
                    'Use undefined instead of null. Normalise null at the boundary (row-mappers.utils.ts, http-client.ts).',
            },
            {
                selector: "JSXAttribute[name.name='data-testid'] > Literal",
                message: 'Use the component *TestIds object — never raw strings in data-testid.',
            },
            {
                selector: ':matches(JSXElement, JSXFragment) > JSXText[value=/\\S/]',
                message: 'Wrap JSX text nodes in {`backticks`} — even static ones.',
            },
            {
                selector: 'JSXExpressionContainer > Literal[value=type(string)]',
                message: 'Use {`backticks`} for JSX text expressions, not quoted strings.',
            },
        ],

        // ── Named exports only (no default exports) ───────────────────────────────
        'import/no-default-export': 'error',

        // ── Blank line before standalone return ──────────────────────────────────
        'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],

        // ── No non-null assertions (!) ────────────────────────────────────────────
        '@typescript-eslint/no-non-null-assertion': 'error',

        // ── Implicit arrow returns over explicit ──────────────────────────────────
        'arrow-body-style': ['error', 'as-needed'],

        // ── Guard clauses: no else after return, shallow nesting ──────────────────
        'no-else-return': ['error', { allowElseIf: false }],
        'max-depth': ['error', 2],

        // ── Immutability: never reassign params ───────────────────────────────────
        'no-param-reassign': 'error',

        // ── JSX handler naming: on* props receive handle* functions ───────────────
        'react/jsx-handler-names': 'error',

        // ── No React.FC — explicit return type instead ────────────────────────────
        '@typescript-eslint/ban-types': [
            'error',
            {
                extendDefaults: true,
                types: {
                    'React.FC': { message: 'Avoid React.FC — use an explicit return type instead.' },
                },
            },
        ],

        // ── No circular dependencies (strictly acyclic DAG) ──────────────────────
        'import/no-cycle': ['error', { maxDepth: Infinity }],

        // ── Explicit return types on exported functions and *.utils.ts ────────────
        '@typescript-eslint/explicit-module-boundary-types': 'error',

        // ── Template literals over string concatenation ───────────────────────────
        'prefer-template': 'error',

        // ── No unused vars (prefix _ for intentionally unused) ───────────────────
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

        // ── Prettier ──────────────────────────────────────────────────────────────
        'prettier/prettier': [
            'error',
            {
                printWidth: 120,
                semi: true,
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'all',
                useTabs: false,
                endOfLine: 'lf',
                bracketSpacing: true,
            },
        ],

        // ── Import ordering ──────────────────────────────────────────────────────
        'import/order': 'off',
        'perfectionist/sort-imports': [
            'error',
            {
                type: 'line-length',
                order: 'asc',
                internalPattern: ['^~/.+'],
                newlinesBetween: 1,
                groups: [
                    ['value-builtin', 'value-external', 'type-builtin', 'type-external'],
                    ['value-internal', 'type-internal'],
                    ['value-parent', 'value-sibling', 'value-index', 'type-parent', 'type-sibling', 'type-index'],
                    'style',
                    'unknown',
                ],
                customGroups: [
                    {
                        groupName: 'style',
                        elementNamePattern: '\\.(module\\.)?(css|scss)$',
                    },
                ],
            },
        ],

        // ── Wrapped borrowed code: raw third-party imports are forbidden ──────────
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'axios',
                        message: 'axios is wrapped — import httpClient from ~/api/http-client instead.',
                    },
                ],
            },
        ],

        // ── Misc quality ─────────────────────────────────────────────────────────
        'no-console': 'warn',
        'no-debugger': 'error',
        eqeqeq: ['error', 'always'],
    },
    overrides: [
        // ── Type-aware rules (need parserOptions.project; scoped to src) ──────────
        {
            files: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
            parserOptions: {
                project: ['packages/*/tsconfig.json'],
                tsconfigRootDir: __dirname,
            },
            rules: {
                '@typescript-eslint/prefer-nullish-coalescing': 'error',
                '@typescript-eslint/strict-boolean-expressions': 'error',
                '@typescript-eslint/no-unnecessary-condition': 'error',
            },
        },
        // ── Lazy-loaded route files: default exports are allowed ──────────────────
        {
            files: ['**/routes/**/*.tsx', '**/routes/**/*.ts'],
            rules: {
                'import/no-default-export': 'off',
            },
        },
        // ── Boundary files: null is allowed (normalise at the seam) ──────────────
        {
            files: ['**/row-mappers.utils.ts', '**/http-client.ts', '**/main.tsx', '**/cypress.config.ts'],
            rules: {
                'no-restricted-syntax': 'off',
            },
        },
        // ── Component files: no relational operators (domain logic belongs in model/selectors/utils) ──
        {
            files: ['**/*.tsx'],
            excludedFiles: ['**/*.test.tsx', '**/*.driver.tsx'],
            rules: {
                // Override replaces the global rule — repeat all global selectors here
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: 'ChainExpression',
                        message:
                            'Avoid optional chaining (?.). Either narrow the type so undefined is ruled out, or write an explicit guard clause (if (x === undefined) return ...).',
                    },
                    {
                        selector: 'Literal[value=null]',
                        message:
                            'Use undefined instead of null. Normalise null at the boundary (row-mappers.utils.ts, http-client.ts).',
                    },
                    {
                        selector: "JSXAttribute[name.name='data-testid'] > Literal",
                        message: 'Use the component *TestIds object — never raw strings in data-testid.',
                    },
                    {
                        selector: ':matches(JSXElement, JSXFragment) > JSXText[value=/\\S/]',
                        message: 'Wrap JSX text nodes in {`backticks`} — even static ones.',
                    },
                    {
                        selector: 'JSXExpressionContainer > Literal[value=type(string)]',
                        message: 'Use {`backticks`} for JSX text expressions, not quoted strings.',
                    },
                    {
                        selector: 'BinaryExpression[operator=/^(>=|<=|>|<)$/]',
                        message:
                            'Relational comparisons belong in model classes, selectors.ts, or *.utils.ts — not in component files.',
                    },
                ],
            },
        },
        // ── Test files: relax some rules + enforce builder pattern ───────────────
        {
            files: ['**/*.test.ts', '**/*.test.tsx', '**/cypress/**/*.ts', '**/cypress/**/*.tsx'],
            rules: {
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                'no-console': 'off',
                // Override replaces the global rule — repeat all global selectors here
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: 'Literal[value=null]',
                        message:
                            'Use undefined instead of null. Normalise null at the boundary (row-mappers.utils.ts, http-client.ts).',
                    },
                    {
                        selector: "JSXAttribute[name.name='data-testid'] > Literal",
                        message: 'Use the component *TestIds object — never raw strings in data-testid.',
                    },
                    {
                        selector: ':matches(JSXElement, JSXFragment) > JSXText[value=/\\S/]',
                        message: 'Wrap JSX text nodes in {`backticks`} — even static ones.',
                    },
                    {
                        selector: 'JSXExpressionContainer > Literal[value=type(string)]',
                        message: 'Use {`backticks`} for JSX text expressions, not quoted strings.',
                    },
                    // ── Raw expect() forbidden in test bodies — use driver assert.* methods ──
                    {
                        selector: "CallExpression[callee.name='expect']",
                        message:
                            'Raw expect() in test body is forbidden — assertions belong in a driver assert.* method (*.driver.ts / *.driver.tsx).',
                    },
                    // ── Builder pattern: no inline domain object factories in test files ──
                    // Catches: const f = (): AnyType => ({ ... }) — implicit arrow with object body
                    {
                        selector: 'ArrowFunctionExpression[returnType][body.type="ObjectExpression"]',
                        message:
                            'Define domain object builders in testkit/builders/ — never inline factory functions in test files.',
                    },
                    // Catches: const f = (): T => { return {...}; } and function f(): T { return {...}; }
                    {
                        selector:
                            ':matches(ArrowFunctionExpression, FunctionExpression, FunctionDeclaration)[returnType]:has(ReturnStatement ObjectExpression)',
                        message:
                            'Define domain object builders in testkit/builders/ — never inline factory functions in test files.',
                    },
                ],
            },
        },
        // ── Builder files: constructors must take no parameters ──────────────────
        {
            files: ['**/testkit/builders/**/*.ts'],
            rules: {
                // Override replaces the global rule — repeat all global selectors here
                'no-restricted-syntax': [
                    'error',
                    {
                        selector: 'ChainExpression',
                        message:
                            'Avoid optional chaining (?.). Either narrow the type so undefined is ruled out, or write an explicit guard clause (if (x === undefined) return ...).',
                    },
                    {
                        selector: 'Literal[value=null]',
                        message:
                            'Use undefined instead of null. Normalise null at the boundary (row-mappers.utils.ts, http-client.ts).',
                    },
                    {
                        selector: "JSXAttribute[name.name='data-testid'] > Literal",
                        message: 'Use the component *TestIds object — never raw strings in data-testid.',
                    },
                    {
                        selector: ':matches(JSXElement, JSXFragment) > JSXText[value=/\\S/]',
                        message: 'Wrap JSX text nodes in {`backticks`} — even static ones.',
                    },
                    {
                        selector: 'JSXExpressionContainer > Literal[value=type(string)]',
                        message: 'Use {`backticks`} for JSX text expressions, not quoted strings.',
                    },
                    // ── Builder constructors must take no parameters ──────────────────────
                    {
                        selector: "MethodDefinition[kind='constructor'] > FunctionExpression[params.0]",
                        message:
                            'Builder constructors must take no arguments — use with*/as* chain methods. aFoo({ field }) is a TypeScript error at the call site by design.',
                    },
                ],
            },
        },
        // ── Config files ──────────────────────────────────────────────────────────
        {
            files: ['**/*.config.ts', '**/*.config.cjs', '**/*.config.js', '**/knexfile.ts'],
            rules: {
                'import/no-default-export': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
            },
        },
        // ── Ambient declaration files (.d.ts) ─────────────────────────────────────
        {
            files: ['**/*.d.ts'],
            rules: {
                'import/no-default-export': 'off',
            },
        },
        // ── Composition root: console allowed (structured logger wired separately) ─
        {
            files: ['**/main.ts'],
            rules: {
                'no-console': 'off',
            },
        },
        // ── http-client wrapper: axios direct import allowed ──────────────────────
        {
            files: ['**/api/http-client.ts'],
            rules: { 'no-restricted-imports': 'off' },
        },
    ],
    ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js'],
};
