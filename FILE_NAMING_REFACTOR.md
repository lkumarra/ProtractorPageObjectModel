# TypeScript File Naming Convention Refactor

## Overview

This document outlines the TypeScript file naming convention updates that have been **COMPLETED** to align with industry standards.

## ✅ COMPLETED - All Files Renamed

All TypeScript files have been successfully renamed according to coding standards.

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

## ✅ FILES RENAMED - Summary

### Priority 1: Configuration & Data Files ✅ COMPLETED

| Old Name | New Name | Reason | Location |
|-------------|----------|--------|----------|
| ~~`Config.ts`~~ | ✅ `config.ts` | Configuration file, not a class | `config/` |
| ~~`ConfigLog4j.ts`~~ | ✅ `log4jConfig.ts` | Configuration file for log4j | `log-manager/` |
| ~~`Suites.ts`~~ | ✅ `suites.ts` | Suite configuration data | `suites/` |
| ~~`Data.ts`~~ | ✅ `testData.ts` | Test data definitions | `test-data/` |

### Priority 2: Barrel Export Files ✅ COMPLETED

| Old Name | New Name | Reason | Location |
|-------------|----------|--------|----------|
| ~~`ExportInterface.ts`~~ | ✅ `interfaces.ts` | Descriptive barrel export | `exports/` |
| ~~`ExportLocators.ts`~~ | ✅ `locators.ts` | Descriptive barrel export | `exports/` |
| ~~`ExportPages.ts`~~ | ✅ `pages.ts` | Descriptive barrel export | `exports/` |
| ~~`ExportUtils.ts`~~ | ✅ `utils.ts` | Descriptive barrel export | `exports/` |

### Priority 3: Test Files ✅ COMPLETED (Jasmine/Protractor Standard)

| Old Name | New Name | Reason | Location |
|-------------|----------|--------|----------|
| ~~`LoginPageTest.ts`~~ | ✅ `loginPage.spec.ts` | Jasmine/Protractor .spec.ts convention | `test-cases/` |
| ~~`HomePageTest.ts`~~ | ✅ `homePage.spec.ts` | Jasmine/Protractor .spec.ts convention | `test-cases/` |
| ~~`NewCustomerPageTest.ts`~~ | ✅ `newCustomerPage.spec.ts` | Jasmine/Protractor .spec.ts convention | `test-cases/` |
| ~~`EditCustomerPageTest.ts`~~ | ✅ `editCustomerPage.spec.ts` | Jasmine/Protractor .spec.ts convention | `test-cases/` |
| ~~`DeleteCustomerPageTest.ts`~~ | ✅ `deleteCustomerPage.spec.ts` | Jasmine/Protractor .spec.ts convention | `test-cases/` |

**Note:** Modern imports now use descriptive names:
```typescript
// Updated imports:
import { LoginPage } from '../exports/pages';
import { ILoginPage } from '../exports/interfaces';
import { LoginPageElements } from '../exports/locators';
import { TestUtil } from '../exports/utils';
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
- ~~`HomePageTest.ts`~~ → ✅ `homePage.spec.ts`
- ~~`LoginPageTest.ts`~~ → ✅ `loginPage.spec.ts`
- ~~`NewCustomerPageTest.ts`~~ → ✅ `newCustomerPage.spec.ts`

## ✅ Implementation Completed

All phases have been successfully completed:

### ✅ Phase 1: Configuration & Data Files
- All config and data files renamed to camelCase
- All imports updated
- TypeScript compilation successful

### ✅ Phase 2: Export Barrel Files
- Renamed to descriptive camelCase names (interfaces.ts, locators.ts, pages.ts, utils.ts)
- All imports updated throughout the codebase
- Modern, clear naming that indicates purpose

### ✅ Phase 3: Test Files
- Renamed all test files to .spec.ts (Jasmine/Protractor standard)
- Updated suite configuration
- All imports updated

## Benefits Achieved

1. ✅ **Industry Standard**: Now matches TypeScript/JavaScript conventions (Angular, React, Node.js)
2. ✅ **Clear Distinction**: Visual difference between classes and configuration/data files
3. ✅ **Better Tooling**: IDEs can better understand file purposes
4. **Consistency**: Aligns with npm ecosystem and popular frameworks
5. **Self-Documenting**: File naming immediately indicates its purpose

## References

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Angular Coding Style Guide](https://angular.io/guide/styleguide)
