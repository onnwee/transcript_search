export default {
    test: {
        globals: true,
        environment: 'node',
        coverage: {
            reporter: ['text', 'json', 'html'],
            dir: 'coverage',
        },
        include: ['**/__tests__/**/*.test.js'], // matches deeply
    },
};
