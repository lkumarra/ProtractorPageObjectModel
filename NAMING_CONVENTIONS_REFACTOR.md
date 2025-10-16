# Naming Convention Refactoring Plan

## Current Issues

The project currently uses **PascalCase** for folders, which is non-standard for TypeScript/JavaScript projects.

## Standard Naming Conventions for TypeScript/JavaScript

### Folders
- **kebab-case** (lowercase with hyphens): `test-cases/`, `page-objects/`, `test-data/`
- Reason: Platform-agnostic, URL-friendly, widely used in npm packages and modern frameworks

### Files
- **PascalCase**: For classes, components, interfaces
  - `LoginPage.ts`, `IHomePage.ts`, `UserService.ts`
- **camelCase**: For utilities, helpers, config files
  - `testUtil.ts`, `configLoader.ts`, `dataProvider.ts`
- **kebab-case**: For test files (alternative convention)
  - `login-page.spec.ts`, `home-page.test.ts`

## Proposed Changes

### Folder Renaming

| Current | Proposed | Reason |
|---------|----------|--------|
| `Config/` | `config/` | Standard lowercase for config folders |
| `Exception/` | `exceptions/` | Plural + lowercase |
| `Exports/` | `exports/` | Standard lowercase |
| `Interface/` | `interfaces/` | Plural + lowercase |
| `LogManager/` | `log-manager/` | kebab-case for multi-word |
| `Pages/` | `pages/` | Standard lowercase |
| `Pages/Actions/` | `pages/actions/` | Nested lowercase |
| `Pages/BasePage/` | `pages/base/` | Simplified + lowercase |
| `Pages/Locators/` | `pages/locators/` | Nested lowercase |
| `Suites/` | `suites/` | Standard lowercase |
| `TestCases/` | `test-cases/` | kebab-case for multi-word |
| `TestData/` | `test-data/` | kebab-case for multi-word |
| `TestReports/` | `test-reports/` | kebab-case for multi-word |
| `Utils/` | `utils/` | Standard lowercase |
| `OldTestReports/` | DELETE | Should not be in repository |
| `SampleReport/` | DELETE | Should not be in repository |

### File Renaming (Where Applicable)

#### Config Files
- `Config.ts` → `config.ts` (configuration file, not a class)
- `Suites.ts` → `suites.ts` (configuration file)
- `Data.ts` → `data.ts` or `testData.ts` (data file)

#### Utility Files
- `TestUtil.ts` → Keep (it's a class)
- `PageFactory.ts` → Keep (it's a class/factory)
- `LogUtils.ts` → Keep (it's a class)
- `ConfigLog4j.ts` → `configLog4j.ts` or `log4jConfig.ts` (config file)

#### Test Files (Optional - common convention)
- `LoginPageTest.ts` → `loginPage.spec.ts` or keep as is
- `HomePageTest.ts` → `homePage.spec.ts` or keep as is

## Implementation Strategy

### Phase 1: Non-Breaking Changes (Folders Only)
1. Rename all folders to lowercase/kebab-case
2. Update all import paths in TypeScript files
3. Update tsconfig.json if needed
4. Test compilation

### Phase 2: File Renaming (Optional)
1. Rename configuration files to camelCase
2. Update imports
3. Test compilation

### Phase 3: Test Files (Optional)
1. Rename to .spec.ts or .test.ts convention
2. Update suite configuration
3. Test execution

## Benefits

1. **Consistency**: Aligns with industry standards
2. **Cross-platform**: Works on case-sensitive file systems
3. **Tool Compatibility**: Better support in build tools and IDEs
4. **Community Standards**: Matches conventions in popular frameworks (Angular, React, Vue)
5. **npm Package Conventions**: Follows common npm package structures

## References

- TypeScript Official Documentation
- Angular Style Guide
- React Best Practices
- ESLint/Prettier Conventions
- npm Package Guidelines

---

**Recommendation**: Start with Phase 1 (folders only) as it provides the most impact with manageable complexity.
