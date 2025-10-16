# Protractor Page Object Model Framework

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e51c66d786fc4dd38120156b1997064a)](https://app.codacy.com/manual/lkumarra/ProtractorPageObjectModel?utm_source=github.com&utm_medium=referral&utm_content=lkumarra/ProtractorPageObjectModel&utm_campaign=Badge_Grade_Dashboard)

A comprehensive end-to-end testing framework for web applications using Protractor with TypeScript, implementing the Page Object Model (POM) design pattern. This framework provides a scalable and maintainable structure for automated testing of the Guru99 Bank demo application.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Execution](#execution)
- [Test Reports](#test-reports)
- [Logging](#logging)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## ✨ Features

- **Page Object Model (POM)**: Clean separation of test logic and page elements
- **TypeScript Support**: Strongly typed test code with better IDE support
- **Multiple Reporters**: 
  - Allure Reporter for detailed test reports
  - Jasmine Spec Reporter for console output
  - Protractor Beautiful Reporter for HTML reports
- **Logging**: Integrated Log4js for comprehensive test execution logging
- **Data-Driven Testing**: Supports parameterized test execution
- **Excel Integration**: ExcelJS for reading/writing test data
- **Visual Testing**: Protractor Image Comparison for screenshot validation
- **Email Notifications**: Nodemailer integration for test result notifications
- **Modular Architecture**: Well-organized code with clear separation of concerns

## 🔧 Prerequisites

Before running this framework, ensure you have the following installed:

- **Node.js**: Version 14.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 6.x or higher (comes with Node.js)
- **Java JDK**: Version 8 or higher (required for Selenium)
- **Google Chrome**: Latest stable version
- **Git**: For version control ([Download](https://git-scm.com/))

### Verify Prerequisites

```bash
node --version
npm --version
java -version
google-chrome --version  # On macOS: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
```

## 📁 Project Structure

```
ProtractorPageObjectModel/
├── Projects/
│   └── Guru99BankTestAutomation/
│       ├── config/              # Configuration files
│       │   └── Config.ts        # Protractor configuration
│       ├── exceptions/          # Custom exception handlers
│       ├── exports/             # Barrel exports for clean imports
│       ├── interfaces/          # TypeScript interfaces
│       ├── log-manager/         # Logging configuration and utilities
│       ├── pages/               # Page Object Model implementation
│       │   ├── actions/         # Page action implementations
│       │   ├── base/            # Base page class
│       │   └── locators/        # Element locators
│       ├── suites/              # Test suite definitions
│       ├── test-cases/          # Test specifications
│       ├── test-data/           # Test data files
│       ├── test-reports/        # Generated test reports
│       └── utils/               # Utility functions
├── e2e_tests/                   # Compiled JavaScript output (gitignored)
├── allure-results/              # Allure test results (gitignored)
├── package.json                 # Node dependencies
├── tsconfig.json                # TypeScript configuration
├── README.md                    # This file
└── CONTRIBUTING.md              # Contribution guidelines
```

**Note:** All folder names follow kebab-case convention (lowercase with hyphens) as per TypeScript/JavaScript industry standards.

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lkumarra/ProtractorPageObjectModel.git
cd ProtractorPageObjectModel
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Protractor
- TypeScript
- Jasmine
- Chromedriver
- All reporters and utilities

### 3. Update WebDriver Manager

```bash
npm run webdrivermanager:update
```

This downloads the necessary browser drivers (ChromeDriver, GeckoDriver, etc.).

### 4. Compile TypeScript

```bash
npm run tsc
```

This compiles TypeScript files from the `Projects/` directory to JavaScript in the `e2e_tests/` directory.

## ⚙️ Configuration

### Protractor Configuration

The main configuration file is located at:
```
Projects/Guru99BankTestAutomation/Config/Config.ts
```

Compiled version:
```
e2e_tests/Config/Config.js
```

### Key Configuration Options

- **Selenium Address**: Configured for standalone Selenium server
- **Framework**: Jasmine2
- **Capabilities**: Chrome browser with various options
- **Specs**: Test suite definitions
- **Reporters**: Allure, Beautiful Reporter, Jasmine Spec Reporter
- **Timeouts**: Configurable timeouts for script, page load, and implicit waits

### Test Data Configuration

Test data is managed in:
```
Projects/Guru99BankTestAutomation/TestData/Data.ts
```

### Log Configuration

Logging is configured in:
```
Projects/Guru99BankTestAutomation/LogManager/ConfigLog4j.ts
```

Logs are written to: `Guru99Bank.log`

## 🎯 Execution

### Run All Tests

```bash
npm test
```

This command:
1. Compiles TypeScript files (`npm run tsc`)
2. Executes all tests defined in the configuration (`npm run config`)

### Compile Only

```bash
npm run tsc
```

### Run Specific Test Suite

Modify the `suites` property in `Config.js` or use Protractor's suite feature:

```bash
npx protractor ./e2e_tests/Config/Config.js --suite login
```

### Run with Python Script (Windows)

For Windows users, a Python launcher is available:

```bash
python Start_Runner.py
```

Or use the executable:

```bash
Start_Runner.exe
```

### Debug Mode

To run tests in debug mode:

```bash
npx protractor ./e2e_tests/Config/Config.js --elementExplorer
```

## 📊 Test Reports

### Allure Reports

After test execution, Allure results are stored in `allure-results/`.

To generate and view Allure report:

```bash
# Install Allure command-line tool (if not already installed)
npm install -g allure-commandline

# Generate and open report
allure serve allure-results
```

### Beautiful Reporter

HTML reports are automatically generated in:
```
Projects/Guru99BankTestAutomation/TestReports/
```

Open the generated HTML file in a browser to view detailed test results with screenshots.

### Console Output

Jasmine Spec Reporter provides formatted console output during test execution with:
- Test suite hierarchy
- Pass/Fail status with colors
- Execution time
- Detailed error messages for failures

## 📝 Logging

The framework uses Log4js for comprehensive logging:

- **Log File**: `Guru99Bank.log`
- **Log Levels**: TRACE, DEBUG, INFO, WARN, ERROR, FATAL
- **Rotation**: Date-based log rotation configured
- **Format**: Includes timestamp, log level, category, and message

### Using Logger in Tests

```typescript
import { LogUtils } from '../LogManager/LogUtils';

const logger = LogUtils.getLogger();

// Log messages at different levels
logger.info('Test started');
logger.debug('Element found: ' + elementName);
logger.error('Test failed: ' + errorMessage);
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:

- Code of Conduct
- Coding standards
- Naming conventions
- How to submit changes
- Pull request process

## 🐛 Troubleshooting

### Common Issues

#### 1. WebDriver Manager Errors

**Problem**: `Error: Could not find chromedriver`

**Solution**:
```bash
npm run webdrivermanager:clean
npm run webdrivermanager:update
```

#### 2. TypeScript Compilation Errors

**Problem**: `tsc: command not found`

**Solution**:
```bash
npm install -g typescript
# Or use local version
npx tsc
```

#### 3. Chrome Version Mismatch

**Problem**: `SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version X`

**Solution**:
```bash
# Update chromedriver
npm install chromedriver@latest --save-dev
npm run webdrivermanager:update
```

#### 4. Port Already in Use

**Problem**: `Error: Port 4444 is already in use`

**Solution**:
```bash
# Kill process on port 4444
lsof -ti:4444 | xargs kill -9
```

#### 5. Protractor Deprecation Warning

**Note**: Protractor is deprecated. Consider migrating to:
- WebdriverIO
- Playwright
- Cypress
- Selenium with direct browser drivers

#### 6. Module Not Found Errors

**Problem**: `Cannot find module 'xxx'`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

If you encounter issues not covered here:

1. Check the [Issues](https://github.com/lkumarra/ProtractorPageObjectModel/issues) page
2. Search for similar problems in Protractor documentation
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, Chrome version)

## 📄 License

ISC License

Copyright (c) Lavendra Rajput

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

## 👤 Author

**Lavendra Rajput**

- GitHub: [@lkumarra](https://github.com/lkumarra)
- Repository: [ProtractorPageObjectModel](https://github.com/lkumarra/ProtractorPageObjectModel)

## 📚 Additional Resources

- [Protractor Documentation](https://www.protractortest.org/)
- [Jasmine Documentation](https://jasmine.github.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
- [Allure Report Documentation](https://docs.qameta.io/allure/)

## 🔄 Version History

- **1.0.0** - Initial release with complete POM framework

---

**Note**: This framework uses Protractor, which has been deprecated. For new projects, consider using modern alternatives like Playwright or Cypress. This framework is maintained for legacy projects and learning purposes.