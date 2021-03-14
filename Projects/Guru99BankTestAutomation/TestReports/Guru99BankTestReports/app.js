var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {
    "showTotalDurationIn": "header",
    "totalDurationFormat": "hms",
    "columnSettings": {
        "displayTime": true,
        "displayBrowser": false,
        "displaySessionId": false,
        "displayOS": false,
        "inlineScreenshots": false,
        "warningTime": 10000,
        "dangerTime": 20000
    }
};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710963852,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710963854,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710964966,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710965238,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710966688,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710966704,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710966706,
                "type": ""
            }
        ],
        "timestamp": 1615710966889,
        "duration": 213
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710967375,
                "type": ""
            }
        ],
        "timestamp": 1615710967191,
        "duration": 167
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1615710979204,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710979465,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710979465,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710979724,
                "type": ""
            }
        ],
        "timestamp": 1615710967386,
        "duration": 11837
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980026,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980077,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980285,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980354,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980544,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980560,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710980902,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1615710981693,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710981965,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710982212,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710982214,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710987138,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710987138,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710987139,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710987398,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710987754,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710987824,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710988014,
                "type": ""
            }
        ],
        "timestamp": 1615710979776,
        "duration": 6344
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1615710989093,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710989616,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710989618,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710989623,
                "type": ""
            }
        ],
        "timestamp": 1615710989690,
        "duration": 130
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": [
            "Expected 'Manger Id : mngr314196' to be 'Manger Id : mngr302250'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\HomePageTest.js:22:50)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710990584,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710990847,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710991266,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710991376,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710991536,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710992117,
                "type": ""
            }
        ],
        "screenShotFile": "screenshots\\0047001f-003e-004c-00bb-005200060016.png",
        "timestamp": 1615710989850,
        "duration": 140
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1615710993586,
                "type": ""
            }
        ],
        "timestamp": 1615710995037,
        "duration": 273
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615710995341,
        "duration": 258
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615710995620,
        "duration": 259
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615710995902,
        "duration": 294
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615710996211,
        "duration": 395
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710997196,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710997456,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710997717,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710997983,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710998245,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615710998509,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1615710999321,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711000091,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711002325,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1615711002338,
                "type": ""
            }
        ],
        "timestamp": 1615711002347,
        "duration": 275
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1615711002887,
                "type": ""
            }
        ],
        "timestamp": 1615711002643,
        "duration": 261
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615711002927,
        "duration": 315
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615711003260,
        "duration": 279
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711006589,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711006616,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711006854,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711007137,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711007329,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711007424,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1615711008207,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711008464,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711008726,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1615711009474,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1615711009527,
                "type": ""
            }
        ],
        "timestamp": 1615711009533,
        "duration": 278
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "6ff1854214a980f4d782f1b6474021ac",
        "instanceId": 16712,
        "browser": {
            "name": "chrome",
            "version": "89.0.4389.82"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1615711009829,
        "duration": 255
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
