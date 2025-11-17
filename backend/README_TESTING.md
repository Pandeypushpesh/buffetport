# Testing Guide

## Setup

1. Install test dependencies:
```bash
cd backend
npm install
```

2. Create `.env.test` file (optional, for test-specific config):
```env
NODE_ENV=test
PORT=5001
```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with verbose output:
```bash
npm run test:verbose
```

### Run with coverage:
```bash
npm test -- --coverage
```

## Test Files

- **`server.test.js`** - Integration tests for `/api/send-resume` endpoint
- **`MANUAL_TEST_CASES.md`** - Manual testing checklist

## Test Coverage

The integration test covers:
- ✅ Valid email requests (200)
- ✅ Invalid email requests (400)
- ✅ Input sanitization
- ✅ Response format validation
- ✅ Error handling

## Manual Testing

See `MANUAL_TEST_CASES.md` for complete manual test cases with cURL commands.

## Troubleshooting

### Jest ES Modules Error

If you see "SyntaxError: Cannot use import statement outside a module":
- Ensure `"type": "module"` is in package.json
- Use `--experimental-vm-modules` flag (already in test scripts)

### Module Not Found

If tests can't find modules:
- Check file paths are correct
- Ensure all dependencies are installed
- Check Jest moduleNameMapper configuration

