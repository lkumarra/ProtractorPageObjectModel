[![Codacy Badge](https://app.codacy.com/project/badge/Grade/3bc1a267efad4e1eaa614b4dd8404c35)](https://www.codacy.com/manual/lkumarra/ProtractorPageObjectModel?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=lkumarra/ProtractorPageObjectModel&amp;utm_campaign=Badge_Grade)

![Protractor](./Projects/Guru99BankTestAutomation/SampleReport/protractor.jpg)

# Pre-requisite to Start Execution:
1. *Java (JDK)*
2. *Nodejs*
3. *Any IDE Such as visual studio code*

# Commands to Execute the TestCases:
1. *npm install*

	To install all dependencies

2. *npm run webdrivermanager:update*

	To update or install all executable binaries

3. *npm run test*

	To Start the Execution

# Reports will Gererated in:
1. *allure-results*

	Allure reports will generated"

2. *TestReports Folder*

	Junit , Pdf and Html Reports


# TestExecution started by Running Script_Running.exe:
[![PDF](./Projects/Guru99BankTestAutomation/SampleReport/Script_Runner_New.JPG)](https://github.com/lkumarra/ProtractorPageObjectModel/tree/master/Projects/Guru99BankTestAutomation/SampleReport/Script_Runner_New.JPG "ScripRuner")

1. Run Script_Runner.exe
2. Click on Install Library Button
3. Click on Webdriver Update Button
4. Click on Start Button

# During run time spec report will look like that:
![Spec Reporter](./Projects/Guru99BankTestAutomation/SampleReport/SpecReportSample.JPG)

# TestReport will be generated as
[![PDF](./Projects/Guru99BankTestAutomation/SampleReport/SamplePdf.JPG)](https://github.com/lkumarra/ProtractorPageObjectModel/tree/master/Projects/Guru99BankTestAutomation/SampleReport/Guru99Bank.pdf "TestReport")

[![PDF](./Projects/Guru99BankTestAutomation/SampleReport/SampleHtml.JPG)](https://github.com/lkumarra/ProtractorPageObjectModel/tree/master/Projects/Guru99BankTestAutomation/SampleReport/SampleHtml.JPG "TestReport")]

# Project Structure:

![Project Structure](./Projects/Guru99BankTestAutomation/SampleReport/ProjectStructure.JPG)
1. *Project*

	Main Project Folder 

2. *Guru99BankTestAutomation*

	Name of the Project"

3. *Config*

	This folder contains config.ts configuration file for Protractor

4. *Interface*

	This folder contains all Interfaces these interfaces are basically guidelines to design fuctions

5. *LogManager*

	This Folder contains all Logs Related File such as Log configuration and Log Utils

6. *OldTestReports*

	This Folder contains all old reports all the reports are moved to this folder for every fresh execution

7. *Pages*
	1. **Actions**

		All the Actions are Kept in this Folder

	2. **Locators**

		All the Locators are Kept in this Folder

	3. **BasePage**

		This Folder Contains the Base Page Class.

8. *Suites*

	This Folder Contains all Spec file path"

9. *TestBase*

	This Folder Contains the Base File for execution

10. *TestCases*

	This Folder Contains all the Test Cases

11. *TestData*

	This Folder Contains all test data

12. *TestReports*

	This Folder Contains the Fresh Test Reports

13. *Utils*

	This Folder Contains all Utility Functions
	

# To Send TestReports on Email Please set email and password as env varaible .
**For More detail refer the link https://github.com/lkumarra/ProtractorPageObjectModel/blob/master/Projects/Guru99BankTestAutomation/Config/Config.ts**