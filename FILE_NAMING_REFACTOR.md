# TypeScript File Naming Convention Refactor

## Overview

This document outlines the TypeScript file naming convention updates to align with industry standards.

## Naming Convention Rules

### When to use PascalCase (UpperCamelCase)
✅ **Classes, Interfaces, Types, Enums**
- `LoginPage.ts` - Page Object class
- `ILoginPage.ts` - Interface definition
- `LoginPageLocators.ts` - Locators class
- `TestUtil.ts` - Utility class
- `InvalidElementFinder.ts` - Exception class
- `PageFactory.ts` - Factory class

### When to use camelCase (lowerCamelCase)
✅ **Configuration files, Data files, Module exports**
- `config.ts` - Configuration object/settings
- `suites.ts` - Suite configuration/data
- `data.ts` - Test data definitions
- `index.ts` - Barrel export files

## Files Requiring Rename

### Priority 1: Configuration & Data Files

| Current Name | New Name | Reason | Location |
|-------------|----------|--------|----------|
| `Config.ts` | `config.ts` | Configuration file, not a class | `config/` |
| `ConfigLog4j.ts` | `log4jConfig.ts` | Configuration file for log4j | `log-manager/` |
| `Suites.ts` | `suites.ts` | Suite configuration data | `suites/` |
| `Data.ts` | `testData.ts` | Test data definitions | `test-data/` |

### Priority 2: Barrel Export Files (Optional but Recommended)

| Current Name | New Name | Reason | Location |
|-------------|----------|--------|----------|
| `ExportInterface.ts` | `index.ts` | Standard barrel export pattern | `interfaces/` |
| `ExportLocators.ts` | `index.ts` | Standard barrel export pattern | `pages/locators/` |
| `ExportPages.ts` | `index.ts` | Standard barrel export pattern | `pages/actions/` |
| `ExportUtils.ts` | `index.ts` | Standard barrel export pattern | `utils/` & `log-manager/` |

**Note:** Barrel exports using `index.ts` allow cleaner imports:
```typescript
// Instead of:
import { LoginPage } from '../exports/ExportPages';

// You can use:
import { LoginPage } from '../pages/actions';
```

## Files That Are Correctly Named ✅

All of these follow PascalCase correctly because they export classes:

### Interfaces (correctly use PascalCase with 'I' prefix)
- `IDeleteCustomerPage.ts`
- `IEditCustomerPage.ts`
- `IHomePage.ts`
- `ILoginPage.ts`
- `INewCustomerPage.ts`
- `ITestUtil.ts`

### Classes (correctly use PascalCase)
- `Page.ts` - Base page class
- `DeleteCustomerPage.ts` - Page class
- `EditCustomerPage.ts` - Page class
- `HomePage.ts` - Page class
- `LoginPage.ts` - Page class
- `NewCustomerPage.ts` - Page class
- `DeleteCustomerPageLocators.ts` - Locators class
- `EditCustomerPageLocators.ts` - Locators class
- `HomePageLocators.ts` - Locators class
- `LoginPageLocators.ts` - Locators class
- `NewCustomerPageLocators.ts` - Locators class
- `TestUtil.ts` - Utility class
- `PageFactory.ts` - Factory class
- `LogUtils.ts` - Utility class
- `InvalidElementFinder.ts` - Exception class

### Test Files (correctly use PascalCase with 'Test' suffix)
- `DeleteCustomerPageTest.ts`
- `EditCustomerPageTest.ts`
- `HomePageTest.ts`
- `LoginPageTest.ts`
- `NewCustomerPageTest.ts`

## Implementation Plan

### Phase 1: Configuration & Data Files (Recommended)

1. **Rename files:**
   ```bash
   cd Projects/Guru99BankTestAutomation
   
   # Config file
   mv config/Config.ts config/config.ts
   
   # Log4j config
   mv log-manager/ConfigLog4j.ts log-manager/log4jConfig.ts
   
   # Suites
   mv suites/Suites.ts suites/suites.ts
   
   # Test data
   mv test-data/Data.ts test-data/testData.ts
   ```

2. **Update all imports** (use find & replace in IDE):
   - `from './Config'` → `from './config'`
   - `from '../config/Config'` → `from '../config/config'`
   - `from './ConfigLog4j'` → `from './log4jConfig'`
   - `from '../log-manager/ConfigLog4j'` → `from '../log-manager/log4jConfig'`
   - `from './Suites'` → `from './suites'`
   - `from '../suites/Suites'` → `from '../suites/suites'`
   - `from './Data'` → `from './testData'`
   - `from '../test-data/Data'` → `from '../test-data/testData'`

3. **Recompile:**
   ```bash
   npx tsc
   ```

4. **Commit:**
   ```bash
   git add .
   git commit -m "refactor: rename config and data files to camelCase

   - Config.ts → config.ts
   - ConfigLog4j.ts → log4jConfig.ts
   - Suites.ts → suites.ts
   - Data.ts → testData.ts
   - Updated all import references
   
   Follows TypeScript naming conventions where non-class files use camelCase"
   ```

### Phase 2: Barrel Exports (Optional)

This is optional but follows modern TypeScript patterns.

**Option A: Keep current Export* naming** (simpler, less changes)
- No changes needed
- Current structure is functional

**Option B: Convert to index.ts pattern** (modern, cleaner imports)
- More refactoring required
- Better aligns with modern TypeScript projects
- Enables cleaner import paths

## Benefits

1. **Industry Standard**: Matches TypeScript/JavaScript conventions (Angular, React, Node.js)
2. **Clear Distinction**: Visual difference between classes and configuration/data files
3. **Better Tooling**: IDEs can better understand file purposes
4. **Consistency**: Aligns with npm ecosystem and popular frameworks
5. **Self-Documenting**: File naming immediately indicates its purpose

## References

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Angular Coding Style Guide](https://angular.io/guide/styleguide)
