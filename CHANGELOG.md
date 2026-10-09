# Changelog

All notable changes to this project will be documented in this file.

## [unreleased]

### 🚀 Features

- [**breaking**] Round-trip NaN, Infinity, -Infinity & -0 exactly

### 🐛 Bug Fixes

- Return next(action) from Redux middleware
- Match only own keys of options.types

### ⚙️ Chores

- Add copilot review instructions
- Modernize toolchain from npm-package-template-ts
- [**breaking**] Convert to ESM-only output
- Tighten lint, coverage & changelog config
- Declare @reduxjs/toolkit as optional peer dependency

### 💼 Other

- Added google drive sync
- Support null-prototype objects
- Improve type guard definition
- Remove unused import
- Preserve custom object `__proto__` keys
- Reorder serify type detection for TypeScript check

A `TS2339` issue was raised with the previous ordering.
- Add object key handling tests
- Correctly get type of shadowed constructor object

### 🔨 Refactoring

- Extract shared container traversal from serify & deserify

### 📚 Documentation

- Sync README with implementation

### 🧪 Testing

- Make tests table-driven and assert behaviour, not implementation
## [v2.0.11] - 2024-08-27

### 💼 Other

- Updated readme
## [v2.0.10] - 2024-08-27

### 💼 Other

- Updated readme
- Create FUNDING.yml
- Reduced image
- Updated image
- Updated readme
- Updated readme
- Updated readme
- Updated readme
## [v2.0.9] - 2024-07-17

### 💼 Other

- Updated dependencies
## [v2.0.8] - 2024-07-03

### 💼 Other

- Updated dependencies
## [v2.0.7] - 2024-06-19

### 💼 Other

- Removed postinstall script
## [v2.0.6] - 2024-06-18

### 💼 Other

- GH-24 reverted deserify initial cloning
## [v2.0.5] - 2024-06-06

### 💼 Other

- [GH-24] added error handling
## [v2.0.4] - 2024-06-06

### 💼 Other

- [GH-24] clone value on deserify call
- [GH-24] updated docs
## [v2.0.3] - 2024-06-06

### 🐛 Bug Fixes

- Bugfix

### 💼 Other

- Updated readme
- Updated readme
- Updated readme
- Updated dependencies
- Lintfix
## [v2.0.2] - 2024-05-29

### 💼 Other

- Updated readme
## [v2.0.2-0] - 2024-05-29

### 💼 Other

- Corrected readme
- [GH-22] reordered exports
## [v2.0.1] - 2024-04-26

### 💼 Other

- Explained recursion in readme
## [v2.0.0] - 2024-04-25

### 💼 Other

- [GH-13] typescript refactor
- [GH-13] titivated
- [GH-13] added template utilities
- [GH-13] leveraged inferred types
- [GH-13] sorted build issues
- [GH-13] improved tests
- Updated readme
- Readme update
- Readme update
## [v1.4.0] - 2023-12-12

### 💼 Other

- Convert all test dates to UTC
- Support overriding object serify keys
- Add docblock for serifyKey constant
- Updated dependencies
- Release 1.4.0
## [v1.3.9] - 2023-02-22

### 💼 Other

- Updated docs & packages
- Release 1.3.9
## [v1.3.8] - 2023-02-20

### 💼 Other

- Updated packages
- Readability
- Release 1.3.8
## [v1.3.7] - 2023-02-20

### 💼 Other

- Eliminated pkg-dir dependency
- Release 1.3.7
## [v1.3.6] - 2023-01-29

### 💼 Other

- Added VSCode intelliense support
- Bump version to sync
- Release 1.3.6
## [v1.3.5] - 2023-01-29

### 💼 Other

- Added VSCode intelliense support
- Release 1.3.5
## [v1.3.4] - 2022-12-30

### 💼 Other

- Removed package_info
- Updated packages
- Release 1.3.4
## [v1.3.3] - 2022-12-26

### 💼 Other

- Cleaned up package
- Release 1.3.3
## [v1.3.2] - 2022-12-22

### 💼 Other

- Updated npm ignores
- Release 1.3.2
## [v1.3.1] - 2022-12-21

### 💼 Other

- Added test dir exclusions to babel
- Simplified redux example
- Eliminated logs from tests
- Release 1.3.1
## [v1.3.0] - 2022-12-21

### 💼 Other

- Release 1.3.0
## [v1.2.16] - 2022-12-21

### 💼 Other

- Doc update
- Release 1.2.16
## [v1.2.15] - 2022-12-21

### 💼 Other

- Applied template updates
- Release 1.2.15
## [v1.2.14] - 2022-12-20

### 💼 Other

- Added callback types
- Release 1.2.14
## [v1.2.13] - 2022-12-20

### 💼 Other

- Doc update
- Release 1.2.13
## [v1.2.12] - 2022-12-20

### 💼 Other

- Updated docs
- Updated docs
- Release 1.2.12
## [v1.2.10] - 2022-12-20

### 💼 Other

- Changed .gitignore handling of .local files
- Applied template changes
segregated & documented code
- Release 1.2.10
## [v1.2.9] - 2022-07-17

### 💼 Other

- Changed importModuleSpecifierEnding
- Added gitlens to workspace recommendations
- Added release-it support
- Release 1.2.9
## [v1.2.8] - 2022-06-15

### 💼 Other

- Deep copy
- 1.2.8
## [v1.2.7] - 2022-06-15

### 💼 Other

- Configurable properties
- 1.2.7
## [v1.2.6] - 2022-06-15

### 🐛 Bug Fixes

- Bugfix

### 💼 Other

- 1.2.6
## [v1.2.5] - 2022-06-15

### 💼 Other

- Better treatment of nested objects
- 1.2.5
## [v1.2.4] - 2022-06-14

### 💼 Other

- Updated .npmignore
- 1.2.4
## [v1.2.3] - 2022-06-14

### 💼 Other

- Updated readme
- 1.2.3
## [v1.2.2] - 2022-06-14

### 💼 Other

- Updated readme
- Readme update
- 1.2.2
## [v1.2.1] - 2022-06-13

### 💼 Other

- Frozen & unwritable properties
- 1.2.1
## [v1.2.0] - 2022-06-13

### 💼 Other

- 1.2.0
## [v1.1.4] - 2022-06-13

### 💼 Other

- Updated readme
- 1.1.4
## [v1.1.3] - 2022-06-13

### 💼 Other

- Updated readme
- 1.1.3
## [v1.1.2] - 2022-06-13

### 💼 Other

- Updated readme
- 1.1.2
## [v1.1.1] - 2022-06-13

### 💼 Other

- Converted tabs to spaces
- 1.1.1
## [v1.1.0] - 2022-06-13

### 💼 Other

- Added createReduxMiddleware
- 1.1.0

### 🔨 Refactoring

- Refactor
## [v1.0.3] - 2022-06-13

### 💼 Other

- Updated keywords
- 1.0.3
## [v1.0.2] - 2022-06-13

### 💼 Other

- Updated readme
- 1.0.2
## [v1.0.1] - 2022-06-13

### 🐛 Bug Fixes

- Bugfix

### 💼 Other

- Initial commit
- All tests pass
- Update README.md
- Added tests for undefined
- Uninstalled chai-match-pattern
- Interim commit
- Updated readme
- Updated readme
- Excluded tests
- Updated readme
- Updated readme
- 1.0.1

### 🧪 Testing

- Tests passing
