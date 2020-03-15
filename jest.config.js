module.exports = { // eslint-disable-line
    preset: "ts-jest",
    collectCoverage: true,
    moduleFileExtensions: ['js', 'json', 'vue'],
    coverageDirectory: "<rootDir>/docs/coverage",
    collectCoverageFrom: [
        "src/**/*.{js,ts}",
        "src/components/*.vue",
    ],
    moduleNameMapper: {
        "^vue$": "vue/dist/vue.common.js",
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    moduleFileExtensions: [
        "js",
        "ts",
        "vue"
    ],
    transform: {
        "^.+\\.ts$": "<rootDir>/node_modules/ts-jest",
        "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
        "^.+\\.vue$": "<rootDir>/node_modules/vue-jest"
    },
    transformIgnorePatterns: [
        "/node_modules/(?!vuetify).+(js|jsx|css)$"
    ],
};
