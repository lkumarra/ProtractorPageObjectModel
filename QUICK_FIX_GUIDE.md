# Quick Start Guide: Implementing Coding Standard Fixes

This guide provides the fastest way to implement all coding standard fixes for this project.

## 🚀 Quick Fix Process (30 minutes)

### Step 1: Backup Your Work (2 minutes)

```bash
cd /Users/lkumarrajput/Developer/Code/ProtractorPageObjectModel

# Create a backup branch
git checkout -b backup-before-fixes
git push origin backup-before-fixes

# Return to master
git checkout master

# Create a new branch for fixes
git checkout -b fix/coding-standards
```

### Step 2: Automated File Renaming (5 minutes)

Create and run this script:

```bash
#!/bin/bash
# Save as: fix_file_names.sh

cd /Users/lkumarrajput/Developer/Code/ProtractorPageObjectModel/Projects/Guru99BankTestAutomation

# Rename Interface files
mv Interface/IEditCostumerPage.ts Interface/IEditCustomerPage.ts
mv Interface/INewCostumerPage.ts Interface/INewCustomerPage.ts

# Rename Page Action files
mv Pages/Actions/EditCostumerPage.ts Pages/Actions/EditCustomerPage.ts
mv Pages/Actions/NewCostumerPage.ts Pages/Actions/NewCustomerPage.ts

# Rename Locator files
mv Pages/Locators/EditCostumerPageLocators.ts Pages/Locators/EditCustomerPageLocators.ts
mv Pages/Locators/NewCostumerPageLocators.ts Pages/Locators/NewCustomerPageLocators.ts

# Rename Test files
mv TestCases/EditCostumerPageTest.ts TestCases/EditCustomerPageTest.ts
mv TestCases/NewCostumerPageTest.ts TestCases/NewCustomerPageTest.ts

echo "✅ Files renamed successfully!"
```

**Run it:**
```bash
chmod +x fix_file_names.sh
./fix_file_names.sh
```

### Step 3: Find and Replace in Code (10 minutes)

**Using VS Code:**

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
2. Type: "Replace in Files"
3. Apply these replacements IN ORDER:

#### Replacement Set 1: Class and Interface Names

| Find (Case Sensitive) | Replace | Files to Include |
|----------------------|---------|------------------|
| `IEditCostumerPage` | `IEditCustomerPage` | `Projects/**/*.ts` |
| `INewCostumerPage` | `INewCustomerPage` | `Projects/**/*.ts` |
| `EditCostumerPage` | `EditCustomerPage` | `Projects/**/*.ts` |
| `NewCostumerPage` | `NewCustomerPage` | `Projects/**/*.ts` |
| `EditCostumerPageLocators` | `EditCustomerPageLocators` | `Projects/**/*.ts` |
| `NewCostumerPageLocators` | `NewCustomerPageLocators` | `Projects/**/*.ts` |
| `NewCostumerData` | `NewCustomerData` | `Projects/**/*.ts` |

#### Replacement Set 2: Variable and Method Names

| Find (Case Sensitive) | Replace | Files to Include |
|----------------------|---------|------------------|
| `newCostumerPage` | `newCustomerPage` | `Projects/**/*.ts` |
| `editCostumerPage` | `editCustomerPage` | `Projects/**/*.ts` |
| `clickOnNewCostumerLink` | `clickOnNewCustomerLink` | `Projects/**/*.ts` |
| `clickOnEditCostumerLink` | `clickOnEditCustomerLink` | `Projects/**/*.ts` |
| `costumerNameField` | `customerNameField` | `Projects/**/*.ts` |
| `costumerNameInvalidCharacterVerify` | `customerNameInvalidCharacterVerify` | `Projects/**/*.ts` |

#### Replacement Set 3: Test Descriptions and Comments

| Find | Replace | Files to Include |
|------|---------|------------------|
| `costumer` | `customer` | `Projects/**/*.ts` |
| `Costumer` | `Customer` | `Projects/**/*.ts` |

**Using Terminal (grep + sed):**

```bash
cd /Users/lkumarrajput/Developer/Code/ProtractorPageObjectModel

# Find and replace in all .ts files
find Projects -name "*.ts" -type f -exec sed -i '' 's/IEditCostumerPage/IEditCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/INewCostumerPage/INewCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/EditCostumerPage/EditCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/NewCostumerPage/NewCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/EditCostumerPageLocators/EditCustomerPageLocators/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/NewCostumerPageLocators/NewCustomerPageLocators/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/newCostumerPage/newCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/editCostumerPage/editCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/clickOnNewCostumerLink/clickOnNewCustomerLink/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/clickOnEditCostumerLink/clickOnEditCustomerLink/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/NewCostumerData/NewCustomerData/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/costumerNameField/customerNameField/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/costumerNameInvalidCharacterVerify/customerNameInvalidCharacterVerify/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/costumer/customer/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/Costumer/Customer/g' {} +

echo "✅ Code replacements complete!"
```

### Step 4: Clean Up Compiled Files (2 minutes)

```bash
cd /Users/lkumarrajput/Developer/Code/ProtractorPageObjectModel

# Remove compiled files from git
git rm -r --cached e2e_tests/ 2>/dev/null || true
git rm -r --cached allure-results/ 2>/dev/null || true
git rm --cached Guru99Bank.log* 2>/dev/null || true

# Remove local compiled files
rm -rf e2e_tests/
rm -rf allure-results/
rm -f Guru99Bank.log*

# Remove old reports
rm -rf Projects/Guru99BankTestAutomation/OldTestReports/

echo "✅ Cleanup complete!"
```

### Step 5: Recompile and Test (5 minutes)

```bash
# Compile TypeScript
npm run tsc

# Check for compilation errors
if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
else
    echo "❌ Compilation failed. Check errors above."
    exit 1
fi

# Verify file structure
ls -la e2e_tests/Interface/ | grep -i customer
ls -la e2e_tests/Pages/Actions/ | grep -i customer
ls -la e2e_tests/TestCases/ | grep -i customer

echo "✅ Verification complete!"
```

### Step 6: Commit Changes (3 minutes)

```bash
# Stage all changes
git add .

# Commit with proper message
git commit -m "fix: correct 'Costumer' typo to 'Customer' throughout project

- Renamed all files from Costumer to Customer
- Updated all imports and references
- Updated variable and method names
- Updated test descriptions and comments
- Cleaned up compiled files and old reports
- Updated .gitignore configuration

Fixes #XXX" # Replace XXX with issue number if applicable

# Push to remote
git push origin fix/coding-standards

echo "✅ Changes committed and pushed!"
```

### Step 7: Verify Changes (3 minutes)

```bash
# Run a quick test compilation
npm run tsc

# Check if tests compile without errors
if [ $? -eq 0 ]; then
    echo "✅ All files compile successfully!"
    
    # Optional: Run a quick test
    # npm test
else
    echo "❌ Compilation errors found. Review the output above."
fi

# Check renamed files exist
echo "Checking renamed files..."
ls Projects/Guru99BankTestAutomation/Interface/IEditCustomerPage.ts
ls Projects/Guru99BankTestAutomation/Interface/INewCustomerPage.ts
echo "✅ Verification complete!"
```

## 🔍 Verification Checklist

After running the quick fix, verify these items:

### Files Renamed ✓
- [ ] `IEditCostumerPage.ts` → `IEditCustomerPage.ts`
- [ ] `INewCostumerPage.ts` → `INewCustomerPage.ts`
- [ ] `EditCostumerPage.ts` → `EditCustomerPage.ts`
- [ ] `NewCostumerPage.ts` → `NewCustomerPage.ts`
- [ ] `EditCostumerPageLocators.ts` → `EditCustomerPageLocators.ts`
- [ ] `NewCostumerPageLocators.ts` → `NewCustomerPageLocators.ts`
- [ ] `EditCostumerPageTest.ts` → `EditCustomerPageTest.ts`
- [ ] `NewCostumerPageTest.ts` → `NewCustomerPageTest.ts`

### Code Updated ✓
- [ ] All imports updated
- [ ] All class references updated
- [ ] All variable names updated
- [ ] All method names updated
- [ ] All comments updated
- [ ] Test descriptions updated

### Repository Cleaned ✓
- [ ] `e2e_tests/` removed from git tracking
- [ ] `allure-results/` removed from git tracking
- [ ] Log files removed
- [ ] `.gitignore` updated

### Compilation ✓
- [ ] TypeScript compiles without errors
- [ ] All files in `e2e_tests/` generated correctly
- [ ] No undefined references

## 🆘 Common Issues and Solutions

### Issue 1: "No such file or directory" during rename

**Cause:** File might already be renamed or doesn't exist

**Solution:**
```bash
# Check if files exist
find Projects -name "*Costumer*"

# If no results, files are already renamed
# Skip to Step 3
```

### Issue 2: sed command not working on macOS

**Cause:** macOS uses BSD sed, not GNU sed

**Solution:** Use the `-i ''` flag as shown in the script above, or:
```bash
# Install GNU sed
brew install gnu-sed

# Use gsed instead
gsed -i 's/Costumer/Customer/g' file.ts
```

### Issue 3: Compilation errors after replacement

**Cause:** Some references might have been missed

**Solution:**
```bash
# Search for remaining "Costumer" references
grep -r "Costumer" Projects/

# Manually fix any remaining instances
```

### Issue 4: Git says files are already tracked

**Cause:** Git cache issue

**Solution:**
```bash
# Remove entire cache and re-add
git rm -r --cached .
git add .
git commit -m "fix: update git tracking"
```

## 📊 Expected Results

After completing all steps:

1. **Files:** All 16 files with "Costumer" renamed to "Customer"
2. **Code:** All references updated (approx. 50+ occurrences)
3. **Compilation:** Clean compilation with no errors
4. **Repository:** Cleaner with unnecessary files removed
5. **Documentation:** All guidelines in place

## ⏱️ Time Breakdown

| Step | Time | Difficulty |
|------|------|-----------|
| Backup | 2 min | Easy |
| Rename Files | 5 min | Easy |
| Replace Code | 10 min | Medium |
| Clean Up | 2 min | Easy |
| Recompile | 5 min | Easy |
| Commit | 3 min | Easy |
| Verify | 3 min | Easy |
| **Total** | **30 min** | **Easy-Medium** |

## ✅ All-in-One Script

Want to do everything at once? Use this master script:

```bash
#!/bin/bash
# Save as: fix_all_coding_standards.sh

set -e  # Exit on error

echo "🚀 Starting Coding Standards Fix..."

# Step 1: Backup
echo "📦 Creating backup..."
git checkout -b backup-before-fixes-$(date +%Y%m%d)
git push origin backup-before-fixes-$(date +%Y%m%d)
git checkout master
git checkout -b fix/coding-standards

# Step 2: Rename files
echo "📝 Renaming files..."
cd Projects/Guru99BankTestAutomation
mv Interface/IEditCostumerPage.ts Interface/IEditCustomerPage.ts
mv Interface/INewCostumerPage.ts Interface/INewCustomerPage.ts
mv Pages/Actions/EditCostumerPage.ts Pages/Actions/EditCustomerPage.ts
mv Pages/Actions/NewCostumerPage.ts Pages/Actions/NewCustomerPage.ts
mv Pages/Locators/EditCostumerPageLocators.ts Pages/Locators/EditCustomerPageLocators.ts
mv Pages/Locators/NewCostumerPageLocators.ts Pages/Locators/NewCustomerPageLocators.ts
mv TestCases/EditCostumerPageTest.ts TestCases/EditCustomerPageTest.ts
mv TestCases/NewCostumerPageTest.ts TestCases/NewCustomerPageTest.ts
cd ../..

# Step 3: Replace in code
echo "🔄 Replacing code references..."
find Projects -name "*.ts" -type f -exec sed -i '' 's/IEditCostumerPage/IEditCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/INewCostumerPage/INewCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/EditCostumerPage/EditCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/NewCostumerPage/NewCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/EditCostumerPageLocators/EditCustomerPageLocators/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/NewCostumerPageLocators/NewCustomerPageLocators/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/newCostumerPage/newCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/editCostumerPage/editCustomerPage/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/clickOnNewCostumerLink/clickOnNewCustomerLink/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/clickOnEditCostumerLink/clickOnEditCustomerLink/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/NewCostumerData/NewCustomerData/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/costumerNameField/customerNameField/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/costumerNameInvalidCharacterVerify/customerNameInvalidCharacterVerify/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/costumer/customer/g' {} +
find Projects -name "*.ts" -type f -exec sed -i '' 's/Costumer/Customer/g' {} +

# Step 4: Clean up
echo "🧹 Cleaning up..."
git rm -r --cached e2e_tests/ 2>/dev/null || true
git rm -r --cached allure-results/ 2>/dev/null || true
git rm --cached Guru99Bank.log* 2>/dev/null || true
rm -rf e2e_tests/
rm -rf allure-results/
rm -f Guru99Bank.log*
rm -rf Projects/Guru99BankTestAutomation/OldTestReports/

# Step 5: Recompile
echo "🔨 Recompiling TypeScript..."
npm run tsc

# Step 6: Commit
echo "💾 Committing changes..."
git add .
git commit -m "fix: correct 'Costumer' typo to 'Customer' throughout project

- Renamed all files from Costumer to Customer
- Updated all imports and references
- Updated variable and method names
- Updated test descriptions and comments
- Cleaned up compiled files and old reports
- Updated .gitignore configuration"

echo "✅ All fixes complete!"
echo "👉 Next step: git push origin fix/coding-standards"
```

**Usage:**
```bash
chmod +x fix_all_coding_standards.sh
./fix_all_coding_standards.sh
```

## 🎉 Success Criteria

You'll know the fix is successful when:

1. ✅ No files named "*Costumer*" exist
2. ✅ `grep -r "Costumer" Projects/` returns no results
3. ✅ `npm run tsc` completes without errors
4. ✅ All tests run successfully
5. ✅ Repository is cleaner (no compiled files in git)

---

**Happy Fixing! 🚀**

If you run into any issues, refer to the CODING_STANDARDS_FIXES.md for detailed troubleshooting.
