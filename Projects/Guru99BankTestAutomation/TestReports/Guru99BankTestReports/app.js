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
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378272297,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378272877,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378272878,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378276168,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378276168,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378276170,
                "type": ""
            }
        ],
        "timestamp": 1610378276424,
        "duration": 176
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378276677,
                "type": ""
            }
        ],
        "timestamp": 1610378276654,
        "duration": 185
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378277366,
                "type": ""
            }
        ],
        "timestamp": 1610378276866,
        "duration": 519
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378277931,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378278610,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378278610,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378278610,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378278865,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378278865,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378279301,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378279494,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378280862,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378281144,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378281428,
                "type": ""
            }
        ],
        "timestamp": 1610378277411,
        "duration": 4174
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378282657,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378282664,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378283511,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378283798,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378284087,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378322844,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378322844,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378322844,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378323266,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378323579,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378323799,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378324075,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378324540,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378325103,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378325108,
                "type": ""
            }
        ],
        "timestamp": 1610378324534,
        "duration": 882
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378326229,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378326238,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378326500,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378326556,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378326877,
                "type": ""
            }
        ],
        "timestamp": 1610378325435,
        "duration": 109
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378327079,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378327235,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378327824,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378329425,
                "type": ""
            }
        ],
        "timestamp": 1610378330254,
        "duration": 652
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378330924,
        "duration": 256
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378331203,
        "duration": 258
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378331483,
        "duration": 265
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378333054,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378333326,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378333329,
                "type": ""
            }
        ],
        "timestamp": 1610378331762,
        "duration": 350
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378333623,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378333624,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378334157,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378337726,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378338292,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378339214,
                "type": ""
            }
        ],
        "timestamp": 1610378338930,
        "duration": 628
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: no such alert\n  (Session info: chrome=87.0.4280.88)\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.0.108', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown"
        ],
        "trace": [
            "NoSuchAlertError: no such alert\n  (Session info: chrome=87.0.4280.88)\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.0.108', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n    at TestUtil.getAlertText (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\Utils\\TestUtil.js:131:25)\n    at EditCostumerPage.verifyCostumerIDAlertMessage (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\Pages\\Actions\\EditCostumerPage.js:60:20)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:27:20)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:26:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1610378339875,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610378339895,
                "type": ""
            }
        ],
        "screenShotFile": "screenshots\\0094004a-002e-0019-0003-00a800210081.png",
        "timestamp": 1610378339591,
        "duration": 342
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378346831,
        "duration": 277
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378347133,
        "duration": 237
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378348238,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378348238,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378348262,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378349498,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378349939,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378350063,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378350999,
                "type": ""
            }
        ],
        "timestamp": 1610378350692,
        "duration": 616
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "8619649cd7d8fe51d1360a8853f4f0b8",
        "instanceId": 3160,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378351333,
        "duration": 345
    },
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378796494,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378817272,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/JavaScript/test.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378817273,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378817274,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/JavaScript/home-bar.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378820094,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/logo.png - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378820094,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378824841,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378826310,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378832848,
                "type": ""
            }
        ],
        "timestamp": 1610378832923,
        "duration": 159
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378833138,
        "duration": 97
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378833604,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378834110,
                "type": ""
            }
        ],
        "timestamp": 1610378833269,
        "duration": 869
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378834366,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378834378,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378834980,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378835231,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378835598,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378836276,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378837428,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378837726,
                "type": ""
            }
        ],
        "timestamp": 1610378834160,
        "duration": 2989
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378837753,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378838554,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378839246,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378840222,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610378840378,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378840950,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378840953,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378841226,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378841456,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378841730,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378841730,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378842012,
                "type": ""
            }
        ],
        "timestamp": 1610378841142,
        "duration": 1279
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378843382,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378843382,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378843392,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378843664,
                "type": ""
            }
        ],
        "timestamp": 1610378842461,
        "duration": 257
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378843861,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378843932,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378844205,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378844783,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378845057,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378845423,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378845423,
                "type": ""
            }
        ],
        "timestamp": 1610378845989,
        "duration": 493
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378846508,
        "duration": 279
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378846812,
        "duration": 272
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378847116,
        "duration": 283
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378847423,
        "duration": 382
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378848495,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378848780,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378849146,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378849436,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378849475,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378849823,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378850179,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378850753,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378850763,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378852567,
                "type": ""
            }
        ],
        "timestamp": 1610378851703,
        "duration": 1180
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610378853275,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1610378853301,
                "type": ""
            }
        ],
        "timestamp": 1610378852906,
        "duration": 440
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378853386,
        "duration": 352
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610378853758,
        "duration": 279
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378855025,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378855318,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378855319,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378855601,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378855601,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378855968,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610378856462,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378856966,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378857299,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610378859212,
                "type": ""
            }
        ],
        "timestamp": 1610378858534,
        "duration": 1247
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e40162fb7a76a96e870474ae95b01abe",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610378859877,
                "type": ""
            }
        ],
        "timestamp": 1610378859814,
        "duration": 265
    },
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379650016,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379650016,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379650016,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/css/slider-cars.css - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610379671291,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/css/home-bar.css - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610379671292,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/JavaScript/test.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610379671293,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379673768,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379674484,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379675125,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379675718,
                "type": ""
            }
        ],
        "timestamp": 1610379676664,
        "duration": 192
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379676993,
        "duration": 123
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: no such alert\n  (Session info: chrome=87.0.4280.88)\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.0.108', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown"
        ],
        "trace": [
            "NoSuchAlertError: no such alert\n  (Session info: chrome=87.0.4280.88)\nBuild info: version: '3.141.59', revision: 'e82be7d358', time: '2018-11-14T08:25:53'\nSystem info: host: 'LAPTOP-ORI8JR52', ip: '192.168.0.108', os.name: 'Windows 10', os.arch: 'amd64', os.version: '10.0', java.version: '1.8.0_241'\nDriver info: driver.version: unknown\n    at Object.checkLegacyResponse (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\n    at TestUtil.getAlertText (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\Utils\\TestUtil.js:131:25)\n    at LoginPage.getAlertTextWithoutEnteringUserIdAndPassword (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\Pages\\Actions\\LoginPage.js:76:25)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\LoginPageTest.js:23:16)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\LoginPageTest.js:22:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\LoginPageTest.js:12:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379683043,
                "type": ""
            }
        ],
        "timestamp": 1610379677158,
        "duration": 5859
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379683545,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379684586,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379685163,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379686954,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379687768,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379687825,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379688193,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379688540,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379688989,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379689289,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379689290,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379689639,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379689914,
                "type": ""
            }
        ],
        "timestamp": 1610379683122,
        "duration": 5182
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379690046,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379690200,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379690568,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379691121,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379691428,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379691839,
                "type": ""
            }
        ],
        "timestamp": 1610379692300,
        "duration": 135
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379692468,
        "duration": 288
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: No element found using locator: By(link text, New Customer)",
            "Failed: Cannot read property 'costumerNameInvalidCharacterVerify' of undefined"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(link text, New Customer)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\built\\element.js:814:27\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'costumerNameInvalidCharacterVerify' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:23:45)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:22:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379693723,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379694062,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379694282,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610379694311,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379694384,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379694662,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379694964,
                "type": ""
            }
        ],
        "screenShotFile": "screenshots\\004c00c8-00e3-00fd-00d2-002a00ae0007.png",
        "timestamp": 1610379707559,
        "duration": 26
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: No element found using locator: By(link text, New Customer)",
            "Failed: Cannot read property 'costumerNameInvalidCharacterVerify' of undefined"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(link text, New Customer)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\built\\element.js:814:27\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'costumerNameInvalidCharacterVerify' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:27:45)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:26:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\0089001f-0053-0014-00b3-009800f000ae.png",
        "timestamp": 1610379709597,
        "duration": 6
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: No element found using locator: By(link text, New Customer)",
            "Failed: Cannot read property 'costumerNameInvalidCharacterVerify' of undefined"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(link text, New Customer)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\built\\element.js:814:27\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'costumerNameInvalidCharacterVerify' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:31:45)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:30:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\00c300f6-00d6-0033-0083-00b1009c0060.png",
        "timestamp": 1610379709957,
        "duration": 16
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: No element found using locator: By(link text, New Customer)",
            "Failed: Cannot read property 'costumerNameFieldMaxCharacterLength' of undefined"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(link text, New Customer)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\built\\element.js:814:27\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'costumerNameFieldMaxCharacterLength' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:35:44)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:34:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\0016005f-00a9-00e2-0018-00c500cd004d.png",
        "timestamp": 1610379710315,
        "duration": 2
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: No element found using locator: By(link text, New Customer)",
            "Failed: Cannot read property 'constumerNameBlankVerify' of undefined"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(link text, New Customer)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\built\\element.js:814:27\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'constumerNameBlankVerify' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:39:45)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:38:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\NewCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379712371,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379712373,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379712403,
                "type": ""
            }
        ],
        "screenShotFile": "screenshots\\0007002b-0094-0097-00ea-00f500590045.png",
        "timestamp": 1610379710678,
        "duration": 18
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379713402,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379713402,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379713403,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379714558,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379715153,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379716059,
                "type": ""
            }
        ],
        "timestamp": 1610379715748,
        "duration": 685
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1610379716843,
                "type": ""
            }
        ],
        "timestamp": 1610379716489,
        "duration": 448
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610379717335,
                "type": ""
            }
        ],
        "timestamp": 1610379716983,
        "duration": 320
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379717353,
        "duration": 249
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: Element is not present on page limit was 30 second\nWait timed out after 10075ms",
            "Failed: Cannot read property 'getCustomerIdMessage' of undefined"
        ],
        "trace": [
            "TimeoutError: Element is not present on page limit was 30 second\nWait timed out after 10075ms\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2201:17\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getCustomerIdMessage' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:23:41)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:22:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379754922,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610379756105,
                "type": ""
            }
        ],
        "screenShotFile": "screenshots\\005000eb-00ab-00f9-003f-00440044009c.png",
        "timestamp": 1610379763920,
        "duration": 6
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "97dcf5091dae05f259ca766a1481faf5",
        "instanceId": 7372,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: Element is not present on page limit was 30 second\nWait timed out after 10075ms",
            "Failed: Cannot read property 'getCustomerIdMessage' of undefined"
        ],
        "trace": [
            "TimeoutError: Element is not present on page limit was 30 second\nWait timed out after 10075ms\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2201:17\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:17:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)",
            "TypeError: Cannot read property 'getCustomerIdMessage' of undefined\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:26:41)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at schedulerExecute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2232:22\n    at new Promise (<anonymous>)\n    at SimpleScheduler.promise (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2242:12)\n    at SimpleScheduler.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2227:17)\n    at UserContext.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at callWhenIdle (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasminewd2\\index.js:62:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:25:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\DeleteCustomerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\00cb00b7-0029-00e3-0040-00c800a7009e.png",
        "timestamp": 1610379764271,
        "duration": 3
    },
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379825878,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379826457,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379826493,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379829673,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379829674,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379829674,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379829674,
                "type": ""
            }
        ],
        "timestamp": 1610379829725,
        "duration": 185
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379829975,
        "duration": 92
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379831032,
                "type": ""
            }
        ],
        "timestamp": 1610379830109,
        "duration": 954
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379831647,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379832312,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379832313,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379832387,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379832593,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379833486,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379833882,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379834374,
                "type": ""
            }
        ],
        "timestamp": 1610379831171,
        "duration": 2675
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379835999,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379836282,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379836282,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379836593,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379836597,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379836898,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379836898,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379838365,
                "type": ""
            }
        ],
        "timestamp": 1610379839305,
        "duration": 239
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379843579,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379843600,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379843864,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379843919,
                "type": ""
            }
        ],
        "timestamp": 1610379839577,
        "duration": 429
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379844197,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379844645,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379845326,
                "type": ""
            }
        ],
        "timestamp": 1610379850752,
        "duration": 1042
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379851837,
        "duration": 319
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379852185,
        "duration": 237
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379852468,
        "duration": 275
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379857352,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379857362,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379857368,
                "type": ""
            }
        ],
        "timestamp": 1610379852791,
        "duration": 348
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: Element is not present on page limit was 30 second\nWait timed out after 10070ms"
        ],
        "trace": [
            "TimeoutError: Element is not present on page limit was 30 second\nWait timed out after 10070ms\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2201:17\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:22:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379858186,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379858190,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379858207,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379859044,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610379859412,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: net::ERR_CONNECTION_TIMED_OUT",
                "timestamp": 1610379859413,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379859639,
                "type": ""
            }
        ],
        "screenShotFile": "screenshots\\004d00ff-0064-00fe-00e8-000d0003001e.png",
        "timestamp": 1610379901614,
        "duration": 10078
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": false,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": [
            "Failed: Element is not present on page limit was 30 second\nWait timed out after 10068ms"
        ],
        "trace": [
            "TimeoutError: Element is not present on page limit was 30 second\nWait timed out after 10068ms\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2201:17\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:26:5)\n    at addSpecsToSuite (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (E:\\NodeJsTestingProjects\\Protractor\\e2e_tests\\TestCases\\EditCostumerPageTest.js:16:1)\n    at Module._compile (internal/modules/cjs/loader.js:956:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:973:10)\n    at Module.load (internal/modules/cjs/loader.js:812:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:724:14)\n    at Module.require (internal/modules/cjs/loader.js:849:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)\n    at Jasmine.loadSpecs (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:92:18)\n    at Jasmine.execute (E:\\NodeJsTestingProjects\\Protractor\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:197:8)"
        ],
        "browserLogs": [],
        "screenShotFile": "screenshots\\00a900eb-00b9-009f-00c0-008e00450078.png",
        "timestamp": 1610379912198,
        "duration": 10075
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379924544,
                "type": ""
            }
        ],
        "timestamp": 1610379922770,
        "duration": 2089
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610379925226,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379926790,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379926864,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379927192,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379927203,
                "type": ""
            }
        ],
        "timestamp": 1610379924882,
        "duration": 317
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379927507,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1610379947252,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379947582,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1610379951160,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://www.demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read property 'select' of undefined",
                "timestamp": 1610379951616,
                "type": ""
            }
        ],
        "timestamp": 1610379950955,
        "duration": 836
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "efdefb6502a7c8e09631ceef0788aa8a",
        "instanceId": 15672,
        "browser": {
            "name": "chrome",
            "version": "87.0.4280.88"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1610379951820,
        "duration": 254
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
