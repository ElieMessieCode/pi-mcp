# Contributing to pi-mcp

Thank you for your interest in contributing to pi-mcp! This document provides guidelines and instructions for contributing.

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/ElieMessieCode/pi-mcp.git
cd pi-mcp
```

2. Copy to your Pi extensions folder:
```bash
cp -r . ~/.pi/agent/extensions/pi-mcp/
```

3. Test the extension:
```bash
pi -e ~/.pi/agent/extensions/pi-mcp/index.ts
```

## Testing

Run the validation script:
```bash
npx tsx validate.ts
```

Run the test suite:
```bash
npx tsx test-extension.ts
```

## Code Style

- Use TypeScript
- Follow existing code patterns in the extension
- Use `mcpLog()` for debug logging instead of `console.log()`
- Handle errors gracefully

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Commit Messages

- Use clear, descriptive commit messages
- Start with a verb in imperative mood (e.g., "Add", "Fix", "Update")
- Keep the first line under 72 characters

## Reporting Issues

- Use the GitHub issue tracker
- Include steps to reproduce the problem
- Include expected and actual behavior
- Include Pi version and Node.js version

## Feature Requests

- Open an issue with the "enhancement" label
- Describe the use case
- Explain why existing features don't meet the need

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
