# Folder and File Renaming - Interfaces & Locators

## ✅ COMPLETED - Option 1 Implemented Successfully!

All folders and files have been renamed following modern TypeScript conventions.

## Overview

Renamed `interfaces` and `locators` folders and their files to more meaningful, modern names following TypeScript best practices.

## Current Issues

1. **`interfaces/` folder** - Generic name, doesn't convey purpose
2. **"I" prefix on interfaces** - Outdated C# convention, not modern TypeScript practice
3. **`*Locators.ts` suffix** - Verbose, `*Elements.ts` or just the page name is clearer
4. **Redundant "Page" in locator classes** - `LoginPageLocators` → `LoginPageElements` (already done) but file name should match

## Recommended Changes

### Option 1: Descriptive Approach (Recommended)

#### Folder Renames:
```
interfaces/ → contracts/
pages/locators/ → pages/elements/
```

#### Interface File Renames (remove "I" prefix, add .contract.ts):
```
IDeleteCustomerPage.ts → deleteCustomer.contract.ts
IEditCustomerPage.ts   → editCustomer.contract.ts
IHomePage.ts           → home.contract.ts
ILoginPage.ts          → login.contract.ts
INewCustomerPage.ts    → newCustomer.contract.ts
ITestUtil.ts           → testUtil.contract.ts
```

**Benefits:**
- `.contract.ts` suffix clearly indicates these are interface contracts
- Removes outdated "I" prefix
- Follows modern TypeScript conventions
- More concise file names

#### Locator File Renames (simplify to .elements.ts):
```
DeleteCustomerPageLocators.ts → deleteCustomer.elements.ts
EditCustomerPageLocators.ts   → editCustomer.elements.ts
HomePageLocators.ts           → home.elements.ts
LoginPageLocators.ts          → login.elements.ts
NewCustomerPageLocators.ts    → newCustomer.elements.ts
```

**Benefits:**
- `.elements.ts` clearly indicates these are element definitions
- Consistent with page action files
- More concise

---

### Option 2: TypeScript Standard Approach

#### Folder Renames:
```
interfaces/ → types/
pages/locators/ → pages/selectors/
```

#### Interface File Renames (remove "I" prefix, keep as-is):
```
IDeleteCustomerPage.ts → DeleteCustomerPage.ts
IEditCustomerPage.ts   → EditCustomerPage.ts
IHomePage.ts           → HomePage.ts
ILoginPage.ts          → LoginPage.ts
INewCustomerPage.ts    → NewCustomerPage.ts
ITestUtil.ts           → TestUtil.ts
```

#### Locator File Renames:
```
DeleteCustomerPageLocators.ts → DeleteCustomerPageSelectors.ts
EditCustomerPageLocators.ts   → EditCustomerPageSelectors.ts
HomePageLocators.ts           → HomePageSelectors.ts
LoginPageLocators.ts          → LoginPageSelectors.ts
NewCustomerPageLocators.ts    → NewCustomerPageSelectors.ts
```

---

### Option 3: Minimal Change (Keep PascalCase)

If you prefer to keep PascalCase for interfaces:

#### Folder Renames:
```
interfaces/ → Contracts/
pages/locators/ → pages/Elements/
```

#### Interface File Renames:
```
IDeleteCustomerPage.ts → DeleteCustomerPageContract.ts
IEditCustomerPage.ts   → EditCustomerPageContract.ts
IHomePage.ts           → HomePageContract.ts
ILoginPage.ts          → LoginPageContract.ts
INewCustomerPage.ts    → NewCustomerPageContract.ts
ITestUtil.ts           → TestUtilContract.ts
```

#### Locator File Renames:
```
DeleteCustomerPageLocators.ts → DeleteCustomerPageElements.ts
EditCustomerPageLocators.ts   → EditCustomerPageElements.ts
HomePageLocators.ts           → HomePageElements.ts
LoginPageLocators.ts          → LoginPageElements.ts
NewCustomerPageLocators.ts    → NewCustomerPageElements.ts
```

---

## Recommendation: Option 1 (Descriptive Approach)

**Why?**
1. ✅ Modern TypeScript conventions (no "I" prefix)
2. ✅ Clear purpose with `.contract.ts` and `.elements.ts` suffixes
3. ✅ Consistent with kebab-case folder naming already applied
4. ✅ More concise and readable
5. ✅ Industry standard (Angular, React, Vue projects)

## Implementation Steps

### Step 1: Rename folders
```bash
cd Projects/Guru99BankTestAutomation

# Rename interfaces to contracts
mv interfaces contracts

# Rename locators to elements
mv pages/locators pages/elements
```

### Step 2: Rename interface files
```bash
cd contracts

mv IDeleteCustomerPage.ts deleteCustomer.contract.ts
mv IEditCustomerPage.ts editCustomer.contract.ts
mv IHomePage.ts home.contract.ts
mv ILoginPage.ts login.contract.ts
mv INewCustomerPage.ts newCustomer.contract.ts
mv ITestUtil.ts testUtil.contract.ts
```

### Step 3: Rename locator files
```bash
cd ../pages/elements

mv DeleteCustomerPageLocators.ts deleteCustomer.elements.ts
mv EditCustomerPageLocators.ts editCustomer.elements.ts
mv HomePageLocators.ts home.elements.ts
mv LoginPageLocators.ts login.elements.ts
mv NewCustomerPageLocators.ts newCustomer.elements.ts
```

### Step 4: Update all imports
Need to update imports in:
- All page action files
- All test spec files
- Export barrel files

### Step 5: Update export names to match
Keep interface/class names the same (ILoginPage, LoginPageElements) but update file paths.

### Step 6: Recompile and test
```bash
npx tsc
```

### Step 7: Commit
```bash
git add .
git commit -m "refactor: rename interfaces and locators for clarity

Folders:
- interfaces/ → contracts/
- pages/locators/ → pages/elements/

Interface files (modern TypeScript, no I prefix):
- ILoginPage.ts → login.contract.ts
- etc.

Locator files (clearer naming):
- LoginPageLocators.ts → login.elements.ts
- etc.

Benefits:
✅ Removes outdated 'I' prefix convention
✅ Clear .contract.ts and .elements.ts suffixes
✅ More concise and modern naming
✅ Follows TypeScript/Angular industry standards"
```

## Alternative Names to Consider

**For interfaces folder:**
- `contracts/` - My recommendation
- `types/` - Common in TypeScript projects
- `models/` - If they represent data models
- `protocols/` - Used in some projects

**For locators folder:**
- `elements/` - My recommendation (most descriptive)
- `selectors/` - Common in test automation
- `locators/` - Keep as-is (but not as clear)

**For suffixes:**
- `.contract.ts` - Clear for interfaces
- `.interface.ts` - Alternative
- `.type.ts` - For TypeScript types
- `.elements.ts` - Clear for element definitions
- `.selectors.ts` - Alternative for locators
