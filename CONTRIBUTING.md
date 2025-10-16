# Contributing to Protractor Page Object Model Framework

First off, thank you for considering contributing to this project! It's people like you that make this framework better for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Coding Standards](#coding-standards)
- [Naming Conventions](#naming-conventions)
- [Project Structure Guidelines](#project-structure-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Style Guide](#style-guide)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information
- Any conduct which could reasonably be considered inappropriate in a professional setting

## 🚀 Getting Started

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ProtractorPageObjectModel.git
   cd ProtractorPageObjectModel
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/lkumarra/ProtractorPageObjectModel.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

6. **Keep your fork updated**:
   ```bash
   git fetch upstream
   git merge upstream/master
   ```

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**: OS, Node version, Chrome version
- **Error messages** and stack traces

**Bug Report Template:**

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 12.0, Windows 11]
- Node Version: [e.g., 16.14.0]
- Chrome Version: [e.g., 108.0.5359.124]
- Framework Version: [e.g., 1.0.0]

## Additional Context
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List alternatives you've considered**

### Pull Requests

Pull requests are the best way to propose changes to the codebase:

1. Follow all instructions in the PR template
2. Follow the [coding standards](#coding-standards)
3. Include appropriate test cases
4. Update documentation as needed
5. Ensure all tests pass

## 💻 Coding Standards

### TypeScript Guidelines

#### 1. Type Safety

Always use explicit types. Avoid `any` unless absolutely necessary.

```typescript
// ✅ Good
function calculateTotal(price: number, quantity: number): number {
    return price * quantity;
}

// ❌ Bad
function calculateTotal(price: any, quantity: any): any {
    return price * quantity;
}
```

#### 2. Interfaces

Use interfaces for defining object structures:

```typescript
// ✅ Good
export interface ICustomerData {
    customerId: string;
    customerName: string;
    customerEmail: string;
    dateOfBirth: Date;
}

// ❌ Bad - using 'any' or no type
let customer: any = { ... };
```

#### 3. Async/Await

Prefer async/await over promises:

```typescript
// ✅ Good
async function loginUser(username: string, password: string): Promise<void> {
    await usernameField.sendKeys(username);
    await passwordField.sendKeys(password);
    await loginButton.click();
}

// ❌ Bad
function loginUser(username: string, password: string) {
    return usernameField.sendKeys(username).then(() => {
        return passwordField.sendKeys(password);
    }).then(() => {
        return loginButton.click();
    });
}
```

#### 4. Error Handling

Always handle errors appropriately:

```typescript
// ✅ Good
async function performAction(): Promise<void> {
    try {
        await someAsyncOperation();
        logger.info('Operation completed successfully');
    } catch (error) {
        logger.error(`Operation failed: ${error.message}`);
        throw new CustomException('Failed to perform action', error);
    }
}
```

#### 5. Constants

Use UPPER_SNAKE_CASE for constants:

```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const BASE_URL = 'https://demo.guru99.com';

// ❌ Bad
const maxRetryAttempts = 3;
const defaulttimeout = 5000;
```

### Code Formatting

- **Indentation**: Use 4 spaces (no tabs)
- **Line Length**: Maximum 120 characters
- **Semicolons**: Always use semicolons
- **Quotes**: Use single quotes for strings
- **Braces**: Opening brace on same line

```typescript
// ✅ Good
export class LoginPage extends Page {
    constructor() {
        super();
        this.logger = LogUtils.getLogger();
    }

    public async login(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }
}
```

## 🏷️ Naming Conventions

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Page Objects | PascalCase + Page suffix | `LoginPage.ts` |
| Locators | PascalCase + Locators suffix | `LoginPageLocators.ts` |
| Interfaces | PascalCase with 'I' prefix | `ILoginPage.ts` |
| Test Cases | PascalCase + Test suffix | `LoginPageTest.ts` |
| Utilities | PascalCase + Util suffix | `TestUtil.ts` |
| Configuration | PascalCase | `Config.ts` |
| Data Files | PascalCase | `Data.ts` |

### Folder Naming

Use kebab-case (lowercase with hyphens) for folder names following TypeScript/JavaScript industry standards:

```
✅ Good:
- pages/
- test-cases/
- test-data/
- log-manager/

❌ Bad (old PascalCase convention):
- Pages/
- TestCases/
- TestData/
- LogManager/
```

**Note:** This project has been refactored to follow modern kebab-case convention for all folders.

### Variable Naming

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `userName`, `customerId` |
| Constants | UPPER_SNAKE_CASE | `MAX_TIMEOUT`, `BASE_URL` |
| Private Properties | camelCase with underscore | `_locator`, `_logger` |
| Interfaces | PascalCase with 'I' prefix | `ILoginPage`, `ICustomer` |
| Classes | PascalCase | `LoginPage`, `TestUtil` |
| Methods | camelCase | `clickLoginButton()`, `enterUsername()` |
| Boolean Variables | is/has/should prefix | `isVisible`, `hasError`, `shouldRetry` |

### Method Naming

Use descriptive, action-oriented names:

```typescript
// ✅ Good
async clickLoginButton(): Promise<void>
async enterUsername(username: string): Promise<void>
async verifyHomePageDisplayed(): Promise<boolean>
async waitForElementVisible(element: ElementFinder): Promise<void>

// ❌ Bad
async click(): Promise<void>
async enter(text: string): Promise<void>
async verify(): Promise<boolean>
async wait(el: any): Promise<void>
```

## 📂 Project Structure Guidelines

### Directory Organization

```
Projects/Guru99BankTestAutomation/
├── config/              # Configuration files
├── exceptions/          # Custom exception classes
├── exports/             # Barrel exports for modules
├── interfaces/          # TypeScript interfaces
├── log-manager/         # Logging configuration and utilities
├── pages/
│   ├── actions/         # Page action implementations
│   ├── base/            # Base page class
│   └── locators/        # Element locators (separate from actions)
├── suites/              # Test suite definitions
├── test-cases/          # Test specifications
├── test-data/           # Test data (JSON, Excel, etc.)
├── test-reports/        # Generated test reports
└── utils/               # Utility functions and helpers
```

### File Organization Rules

1. **One class per file**: Each file should contain only one class or interface
2. **Logical grouping**: Related files should be in the same directory
3. **Separation of concerns**: 
   - Locators in `pages/locators/` folder
   - Actions in `pages/actions/` folder
   - Test cases in `test-cases/` folder
4. **Barrel exports**: Use `exports/` for centralized exports

### Page Object Model Structure

Each page should have three components:

1. **Interface** (in `interfaces/`):
   ```typescript
   // ILoginPage.ts
   export interface ILoginPage {
       enterUsername(username: string): Promise<void>;
       enterPassword(password: string): Promise<void>;
       clickLoginButton(): Promise<void>;
       login(username: string, password: string): Promise<void>;
   }
   ```

2. **Locators** (in `pages/locators/`):
   ```typescript
   // LoginPageLocators.ts
   export class LoginPageLocators {
       public static readonly USERNAME_FIELD = by.name('uid');
       public static readonly PASSWORD_FIELD = by.name('password');
       public static readonly LOGIN_BUTTON = by.name('btnLogin');
   }
   ```

3. **Actions** (in `pages/actions/`):
   ```typescript
   // LoginPage.ts
   export class LoginPage extends Page implements ILoginPage {
       // Implementation
   }
   ```

## 📝 Commit Message Guidelines

### Commit Message Format

Use the following format for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```
feat(login): add remember me functionality

Implemented remember me checkbox on login page with
local storage support for saving user preferences.

Closes #123
```

```
fix(customer): correct typo in customer file names

Renamed files from "Costumer" to "Customer" to fix
spelling error throughout the project.

- Renamed IEditCostumerPage.ts to IEditCustomerPage.ts
- Renamed EditCostumerPage.ts to EditCustomerPage.ts
- Updated all imports and references

Fixes #456
```

```
docs(readme): update installation instructions

Added troubleshooting section and clarified prerequisites
for better onboarding experience.
```

### Rules

1. **Use imperative mood**: "add" not "added", "fix" not "fixed"
2. **Capitalize first letter**: "Add feature" not "add feature"
3. **No period at the end**: "Add feature" not "Add feature."
4. **Limit subject line to 50 characters**
5. **Wrap body at 72 characters**
6. **Reference issues**: Use "Fixes #123" or "Closes #123"

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with latest changes from master:
   ```bash
   git fetch upstream
   git rebase upstream/master
   ```

2. **Run tests** locally:
   ```bash
   npm test
   ```

3. **Compile TypeScript** without errors:
   ```bash
   npm run tsc
   ```

4. **Check code quality** (if linter is configured):
   ```bash
   npm run lint
   ```

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] I have tested this code locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] All new and existing tests pass

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have checked my code and corrected any misspellings

## Related Issues
Fixes #(issue number)

## Screenshots (if applicable)
```

### Review Process

1. At least one maintainer must review and approve
2. All CI checks must pass
3. No merge conflicts with master branch
4. All conversations must be resolved

## 🎨 Style Guide

### Comments

Use JSDoc style comments for classes and methods:

```typescript
/**
 * Represents the login page of the application.
 * Provides methods to interact with login functionality.
 * 
 * @extends Page
 * @implements ILoginPage
 */
export class LoginPage extends Page implements ILoginPage {
    
    /**
     * Enters username in the username field
     * @param {string} username - The username to enter
     * @returns {Promise<void>}
     */
    public async enterUsername(username: string): Promise<void> {
        await this.sendKeys(LoginPageLocators.USERNAME_FIELD, username);
    }
}
```

### Logging

Use appropriate log levels:

```typescript
// Information messages
logger.info('Starting login process');

// Debug information (detailed)
logger.debug(`Username entered: ${username}`);

// Warning messages
logger.warn('Login attempt failed, retrying...');

// Error messages
logger.error(`Login failed: ${error.message}`);

// Fatal errors
logger.fatal('Critical error: Application crashed');
```

### Imports

Organize imports in the following order:

1. Node.js built-in modules
2. External dependencies
3. Internal modules (grouped by type)

```typescript
// Node.js built-ins
import * as path from 'path';
import * as fs from 'fs';

// External dependencies
import { browser, element, by, ElementFinder } from 'protractor';

// Internal - Interfaces
import { ILoginPage } from '../interfaces/ILoginPage';

// Internal - Pages
import { Page } from '../pages/base/Page';

// Internal - Locators
import { LoginPageLocators } from '../pages/locators/LoginPageLocators';

// Internal - Utils
import { LogUtils } from '../log-manager/LogUtils';
```

## ✅ Testing Guidelines

### Test Structure

Follow the AAA (Arrange-Act-Assert) pattern:

```typescript
it('should login with valid credentials', async () => {
    // Arrange
    const username = testData.validUsername;
    const password = testData.validPassword;
    
    // Act
    await loginPage.login(username, password);
    
    // Assert
    expect(await homePage.isDisplayed()).toBe(true);
    expect(await homePage.getWelcomeMessage()).toContain(username);
});
```

### Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// ✅ Good
it('should display error message when username is empty', async () => { ... });
it('should redirect to home page after successful login', async () => { ... });
it('should disable submit button when form is invalid', async () => { ... });

// ❌ Bad
it('test login', async () => { ... });
it('should work', async () => { ... });
it('test 1', async () => { ... });
```

### Test Organization

- Group related tests using `describe` blocks
- Use `beforeEach` and `afterEach` for setup and cleanup
- Keep tests independent and isolated
- One assertion per test when possible

```typescript
describe('Login Page Tests', () => {
    let loginPage: LoginPage;
    let homePage: HomePage;

    beforeEach(async () => {
        loginPage = new LoginPage();
        homePage = new HomePage();
        await loginPage.navigateTo();
    });

    describe('Valid Login Scenarios', () => {
        it('should login with valid manager credentials', async () => { ... });
        it('should login with valid customer credentials', async () => { ... });
    });

    describe('Invalid Login Scenarios', () => {
        it('should show error with invalid username', async () => { ... });
        it('should show error with invalid password', async () => { ... });
        it('should show error with empty credentials', async () => { ... });
    });

    afterEach(async () => {
        await browser.restart();
    });
});
```

## 🆘 Getting Help

If you need help with your contribution:

1. Check the [README.md](README.md) documentation
2. Look through existing [issues](https://github.com/lkumarra/ProtractorPageObjectModel/issues)
3. Ask questions in your pull request or issue
4. Reach out to maintainers

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

---

**Happy Contributing! 🚀**
