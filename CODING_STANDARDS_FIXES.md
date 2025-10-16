# Coding Standards Issues and Fixes

This document outlines all the coding standard issues found in the project and provides a guide for fixing them.

## 🔴 Critical Issues

### 1. Typo in File Names: "Costumer" → "Customer"

The word "Customer" is misspelled as "Costumer" throughout the project. This affects multiple files and all their references.

#### Files to Rename:

**Interface Files:**
- `Projects/Guru99BankTestAutomation/Interface/IEditCostumerPage.ts` → `IEditCustomerPage.ts`
- `Projects/Guru99BankTestAutomation/Interface/INewCostumerPage.ts` → `INewCustomerPage.ts`
- `e2e_tests/Interface/IEditCostumerPage.js` → `IEditCustomerPage.js`
- `e2e_tests/Interface/INewCostumerPage.js` → `INewCustomerPage.js`

**Page Action Files:**
- `Projects/Guru99BankTestAutomation/Pages/Actions/EditCostumerPage.ts` → `EditCustomerPage.ts`
- `Projects/Guru99BankTestAutomation/Pages/Actions/NewCostumerPage.ts` → `NewCustomerPage.ts`
- `e2e_tests/Pages/Actions/EditCostumerPage.js` → `EditCustomerPage.js`
- `e2e_tests/Pages/Actions/NewCostumerPage.js` → `NewCustomerPage.js`

**Locator Files:**
- `Projects/Guru99BankTestAutomation/Pages/Locators/EditCostumerPageLocators.ts` → `EditCustomerPageLocators.ts`
- `Projects/Guru99BankTestAutomation/Pages/Locators/NewCostumerPageLocators.ts` → `NewCustomerPageLocators.ts`
- `e2e_tests/Pages/Locators/EditCostumerPageLocators.js` → `EditCustomerPageLocators.js`
- `e2e_tests/Pages/Locators/NewCostumerPageLocators.js` → `NewCustomerPageLocators.js`

**Test Files:**
- `Projects/Guru99BankTestAutomation/TestCases/EditCostumerPageTest.ts` → `EditCustomerPageTest.ts`
- `Projects/Guru99BankTestAutomation/TestCases/NewCostumerPageTest.ts` → `NewCustomerPageTest.ts`
- `e2e_tests/TestCases/EditCostumerPageTest.js` → `EditCustomerPageTest.js`
- `e2e_tests/TestCases/NewCostumerPageTest.js` → `NewCustomerPageTest.js`

#### Code Changes Required:

After renaming files, update all import statements and references:

1. **Export Files:**
   - `ExportInterface.ts` / `ExportInterface.js`
   - `ExportLocators.ts` / `ExportLocators.js`
   - `ExportPages.ts` / `ExportPages.js`

2. **HomePage references:**
   - Update method: `clickOnNewCostumerLink()` → `clickOnNewCustomerLink()`
   - Update method: `clickOnEditCostumerLink()` → `clickOnEditCustomerLink()`

3. **Test Data:**
   - `NewCostumerData` → `NewCustomerData`
   - All properties: `costumer*` → `customer*`

4. **Config file:**
   - Update suite references

5. **All test cases:**
   - Update variable names
   - Update method calls
   - Update comments

## ⚠️ Naming Convention Issues

### Variable and Method Naming

#### Issues Found:

1. **Inconsistent variable naming in test files:**
   ```typescript
   // Current (inconsistent)
   let newCostumerPage: INewCostumerPage;
   
   // Should be
   let newCustomerPage: INewCustomerPage;
   ```

2. **Method names with typos:**
   ```typescript
   // Current
   costumerNameInvalidCharacterVerify()
   
   // Should be
   customerNameInvalidCharacterVerify()
   ```

3. **Test descriptions with typos:**
   ```typescript
   // Current
   it("Verify costumer name field with...")
   
   // Should be
   it("Verify customer name field with...")
   ```

### Interface Naming

All interfaces follow the correct pattern: `I` prefix + PascalCase ✅

Example:
- `ILoginPage`
- `IHomePage`
- `IDeleteCustomerPage`

### Class Naming

Classes follow PascalCase pattern ✅

Example:
- `LoginPage`
- `HomePage`
- `TestUtil`

## 📝 Documentation Issues

### Comments and Documentation

1. **Missing JSDoc comments** on public methods
2. **Inconsistent comment style** (some use //, some use /* */)
3. **Outdated or incorrect comments**

#### Recommendations:

```typescript
/**
 * Verifies customer name field with invalid characters
 * @param {string} input - The input to test
 * @returns {Promise<string>} The validation message
 */
public async customerNameInvalidCharacterVerify(input: string): Promise<string> {
    // Implementation
}
```

## 🗂️ File and Folder Organization

### Current Structure Issues:

1. **Mixed compiled and source files:**
   - Both `Projects/` and `e2e_tests/` directories exist
   - `e2e_tests/` contains compiled JavaScript
   - Need to ensure `.gitignore` excludes compiled files

2. **Test Reports in repository:**
   - `allure-results/` should be in `.gitignore`
   - `TestReports/` should be in `.gitignore`
   - `OldTestReports/` should be removed

3. **Log files in repository:**
   - `Guru99Bank.log` should be in `.gitignore`
   - `Guru99Bank.log.%d{...}` files should be removed

### Recommended `.gitignore` additions:

```gitignore
# Compiled output
e2e_tests/
*.js
*.js.map

# Test reports
allure-results/
TestReports/
OldTestReports/
SampleReport/

# Logs
*.log
*.log.*

# Python cache
__pycache__/
*.pyc

# OS files
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# Dependencies
node_modules/
package-lock.json
```

## 📋 Quick Fix Checklist

Use this checklist when implementing fixes:

### Phase 1: File Renaming
- [ ] Rename Interface files (IEditCostumerPage, INewCostumerPage)
- [ ] Rename Page Action files (EditCostumerPage, NewCostumerPage)
- [ ] Rename Locator files (*CostumerPageLocators)
- [ ] Rename Test files (*CostumerPageTest)

### Phase 2: Code Updates
- [ ] Update all import statements
- [ ] Update Export files (ExportInterface, ExportLocators, ExportPages)
- [ ] Update HomePage methods (clickOnNew/EditCostumer → clickOnNew/EditCustomer)
- [ ] Update test data class names and properties
- [ ] Update all variable names in tests
- [ ] Update all method names
- [ ] Update test descriptions and comments

### Phase 3: Compiled Files
- [ ] Delete e2e_tests/ directory
- [ ] Run `npm run tsc` to recompile
- [ ] Verify no compilation errors

### Phase 4: Documentation
- [ ] Add JSDoc comments to public methods
- [ ] Update README.md if needed
- [ ] Update CONTRIBUTING.md examples

### Phase 5: Cleanup
- [ ] Update .gitignore
- [ ] Remove compiled files from git
- [ ] Remove old test reports
- [ ] Remove log files
- [ ] Commit changes with proper message

## 🔧 Automated Fix Script

Here's a bash script to help automate some of the renaming:

```bash
#!/bin/bash

# Navigate to project root
cd /Users/lkumarrajput/Developer/Code/ProtractorPageObjectModel

# Rename Interface files
mv Projects/Guru99BankTestAutomation/Interface/IEditCostumerPage.ts \
   Projects/Guru99BankTestAutomation/Interface/IEditCustomerPage.ts

mv Projects/Guru99BankTestAutomation/Interface/INewCostumerPage.ts \
   Projects/Guru99BankTestAutomation/Interface/INewCustomerPage.ts

# Rename Page Action files
mv Projects/Guru99BankTestAutomation/Pages/Actions/EditCostumerPage.ts \
   Projects/Guru99BankTestAutomation/Pages/Actions/EditCustomerPage.ts

mv Projects/Guru99BankTestAutomation/Pages/Actions/NewCostumerPage.ts \
   Projects/Guru99BankTestAutomation/Pages/Actions/NewCustomerPage.ts

# Rename Locator files
mv Projects/Guru99BankTestAutomation/Pages/Locators/EditCostumerPageLocators.ts \
   Projects/Guru99BankTestAutomation/Pages/Locators/EditCustomerPageLocators.ts

mv Projects/Guru99BankTestAutomation/Pages/Locators/NewCostumerPageLocators.ts \
   Projects/Guru99BankTestAutomation/Pages/Locators/NewCustomerPageLocators.ts

# Rename Test files
mv Projects/Guru99BankTestAutomation/TestCases/EditCostumerPageTest.ts \
   Projects/Guru99BankTestAutomation/TestCases/EditCustomerPageTest.ts

mv Projects/Guru99BankTestAutomation/TestCases/NewCostumerPageTest.ts \
   Projects/Guru99BankTestAutomation/TestCases/NewCustomerPageTest.ts

echo "File renaming complete!"
echo "Next steps:"
echo "1. Update import statements in all files"
echo "2. Search and replace 'Costumer' with 'Customer' in code"
echo "3. Delete e2e_tests/ directory"
echo "4. Run 'npm run tsc' to recompile"
```

## 🔍 Search and Replace Patterns

Use these patterns in your IDE for bulk find-and-replace:

| Find | Replace | Scope |
|------|---------|-------|
| `Costumer` | `Customer` | All `.ts` files |
| `costumer` | `customer` | All `.ts` files |
| `IEditCostumer` | `IEditCustomer` | All files |
| `INewCostumer` | `INewCustomer` | All files |
| `EditCostumer` | `EditCustomer` | All files |
| `NewCostumer` | `NewCustomer` | All files |

**Note:** Be careful with search and replace. Review each change before applying.

## 📊 Severity Levels

- 🔴 **Critical**: Breaks functionality or causes confusion (typos in names)
- 🟡 **Important**: Violates coding standards but doesn't break functionality
- 🟢 **Nice to have**: Improvements for consistency and maintainability

## 🎯 Priority Order

1. **High Priority:**
   - Fix "Costumer" typo (Critical for professionalism)
   - Update .gitignore (Prevents repository bloat)
   - Remove compiled files from git

2. **Medium Priority:**
   - Add JSDoc comments
   - Standardize comment style
   - Update documentation

3. **Low Priority:**
   - Code formatting consistency
   - Variable name improvements
   - Additional helper methods

## 📞 Need Help?

If you encounter issues while fixing these problems:

1. Check the CONTRIBUTING.md for guidelines
2. Review the examples in this document
3. Create an issue on GitHub
4. Ask for code review before committing large changes

---

**Last Updated:** October 16, 2025
