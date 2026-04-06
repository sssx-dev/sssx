# Contributing to SSSX

Thank you for your interest in contributing to SSSX! PRs are welcome.

## Getting Started

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Run the example project**:
   ```shell
   cd packages/example
   npx sssx dev open
   ```

## Development

This repository is a monorepo using npm workspaces.

### Project Structure

```
packages/
  sssx/       # Main SSSX framework package
  example/    # Example website project
```

### Running Tests

```shell
cd packages/sssx
npm test
```

### Code Style

- TypeScript strict mode is enabled
- Use `import type` for type-only imports
- Prefer async/await over callbacks
- Add tests for new utilities and features

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## Reporting Issues

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) for bugs
- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) for feature ideas

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
