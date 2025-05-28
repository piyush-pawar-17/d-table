/* eslint-disable-next-line */
export default {
    arrowParens: 'always',
    bracketSpacing: true,
    jsxSingleQuote: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'none',
    useTabs: false,
    importOrder: [
        '^react$',
        '<BUILTIN_MODULES>',
        '<THIRD_PARTY_MODULES>',
        '^@/ui(.*)$',
        '^@/components(.*)$',
        '^@/utils(.*)$',
        '^[./]',
        '^import\\s+type.*$',
        '\\.css$'
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss']
};
