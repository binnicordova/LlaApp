module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	// match files like *.test.ts located next to source files
	testMatch: ['**/*.test.[tj]s?(x)'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	roots: ['<rootDir>/src', '<rootDir>/test'],
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.{ts,js}'],
	coveragePathIgnorePatterns: ['<rootDir>/src/auth/wsp.ts', '/node_modules/'],
	coverageDirectory: '<rootDir>/coverage',
	coverageThreshold: {
		global: {
			branches: 80,
			functions: 80,
			lines: 80,
			statements: 80
		}
	}
};

