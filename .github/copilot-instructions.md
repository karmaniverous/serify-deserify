# Copilot Review Instructions

## Review Philosophy

If you find an issue in this PR, the most important question is: **why did existing quality controls let this through?**

The highest-value review comment is not "fix this line" — it is "add a lint rule / CI check / pre-commit hook that catches this class of issue everywhere, forever." Point fixes are acceptable, but always prefer suggesting a systemic control improvement over a one-off code comment.

The presumption is that any issue you find has survived the project's existing quality gates. The right answer is to strengthen the gates.

## Critical — Always Flag These

### No Lint/Check Suppression

Never suggest disabling linting or type-checking rules. This includes `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `noqa`, `noinspection`, or any language/framework equivalent. The code must be fixed, not suppressed. If a rule fires, the code is wrong.

For test mocks: suggest properly typed partial objects (`Partial<RealType>`, typed mock interfaces) instead of `any` or type-suppression comments. Tests are production code.

### No Unsafe Types

Flag every use of `any` (or language equivalent for untyped escape hatches). Prefer `unknown` with type narrowing, or the narrowest possible type. If a lint rule could catch this automatically, suggest which rule and how to configure it.

### Type Safety Violations

Flag implicit `any`, missing return types on exported functions, and unchecked type assertions (e.g. `as Foo` without validation). If the project's type-checking configuration could be tightened to prevent these (e.g. `strict: true`, `noImplicitAny`), say so.

### Missing Error Handling

Flag unhandled promise rejections, missing try/catch around I/O operations, swallowed errors (empty catch blocks), and fire-and-forget async calls without error handling.

### Security

Flag hardcoded secrets, credentials in source, injection vectors (SQL, command, template), unsanitized user input, and `eval()` or equivalent dynamic code execution.

## Important — Review Carefully

### File Size

Flag any file exceeding 300 lines of code. It should be decomposed into smaller, single-responsibility modules.

### Schema-First Config

If a configuration or validation surface is defined with bare type declarations instead of runtime schemas, flag it. Prefer Zod 4 (or the project's runtime validation library). Types should be derived from schemas (`z.infer<>`), not declared separately.

### Zod Version

Flag any new code that uses Zod 3 patterns or adds a `zod@^3` dependency. Zod 4 (`zod@^4`) is required for all new work.

### Test Coverage

If a PR adds a new module without a corresponding test file in the same PR, flag it. Tests should cover both happy paths and representative error paths.

### CHANGELOG Edits

Flag manual CHANGELOG edits. The changelog is generated from conventional commits during the release process.

### Lock File Consistency

If `package.json` (or equivalent manifest) is modified but the lock file is not included in the PR, flag it.

## Suggestions — Code Quality

### Architecture & Design

- **SOLID principles.** Flag violations: classes/modules with multiple reasons to change (SRP), concrete dependencies where abstractions would decouple (DIP), interfaces that force implementers to depend on methods they don't use (ISP), base classes that break when extended (LSP). Suggest the specific principle being violated.
- **DRY.** Flag duplicated logic, copy-pasted code blocks, and repeated patterns that should be extracted into shared utilities or abstractions. If the same logic appears in two or more places in the PR, it belongs in one place.
- **Services-first.** Core logic belongs in service modules behind clean interfaces. Adapters should be thin. Side effects should be pushed to boundaries.
- **Open-source first.** Before suggesting custom implementations, consider whether an established package already solves the problem.

### Testing

- **Adequate coverage.** Tests should exercise meaningful behavior: decision branches, edge cases, error paths, and integration boundaries. Flag PRs that add non-trivial logic without corresponding tests.
- **No trivial tests.** Flag tests that assert only the obvious (e.g. testing that a constant equals itself, that a constructor sets a field, or that a mock returns what it was configured to return). Tests should prove behavior, not restate implementation.
- **Table-driven cases.** When the same logic is tested with multiple inputs, suggest table-driven patterns over copy-pasted test blocks.

### Style

- The project formatter is source of truth for formatting. Do not suggest formatting changes — suggest adding or fixing formatter configuration instead.
- Lint rules are authoritative. Do not suggest disabling them.
- If you spot a recurring code quality issue that could be caught by a lint rule or tooling configuration, suggest the rule rather than fixing individual instances.
- Flag PR titles that don't follow conventional commit format (`feat:`, `fix:`, `chore:`, `docs:`, etc.).
