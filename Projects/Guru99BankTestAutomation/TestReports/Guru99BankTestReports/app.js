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
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140103696,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140103698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140103699,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140104424,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140105191,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140105409,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140105415,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140105891,
                "type": ""
            }
        ],
        "timestamp": 1639140105694,
        "duration": 479
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140106353,
        "duration": 215
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140107458,
                "type": ""
            }
        ],
        "timestamp": 1639140106629,
        "duration": 861
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140107812,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140108211,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140108214,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140108622,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140108622,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140109031,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140109031,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140109357,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140109379,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140111086,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140111395,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140111800,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140111800,
                "type": ""
            }
        ],
        "timestamp": 1639140107544,
        "duration": 4949
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140113375,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140113378,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140113390,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140113692,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140113709,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140113713,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140116438,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140116814,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140116814,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140117230,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140117230,
                "type": ""
            }
        ],
        "timestamp": 1639140117383,
        "duration": 294
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140117759,
        "duration": 287
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140118896,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140119272,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140119273,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140119681,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140119693,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140119694,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140120000,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140121948,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140122240,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140122655,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140122656,
                "type": ""
            }
        ],
        "timestamp": 1639140123718,
        "duration": 656
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140124419,
        "duration": 478
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140124965,
        "duration": 674
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140125696,
        "duration": 507
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140126241,
        "duration": 808
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140127871,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140127871,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140128280,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140128298,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140128689,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140128690,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140129933,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140130328,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140130650,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140131766,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140131809,
                "type": ""
            }
        ],
        "timestamp": 1639140131847,
        "duration": 599
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1639140133098,
                "type": ""
            }
        ],
        "timestamp": 1639140132496,
        "duration": 671
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140133257,
        "duration": 381
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140133677,
        "duration": 437
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140135044,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140135045,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140135364,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140135403,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140135682,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140135691,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140137110,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140137496,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140137497,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140137497,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140137907,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140137907,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140139033,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140139085,
                "type": ""
            }
        ],
        "timestamp": 1639140139111,
        "duration": 738
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d38381572ebeba5a122c7188cb1359f6",
        "instanceId": 17296,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140139912,
        "duration": 600
    },
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140410036,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140410047,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140410054,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140411378,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140411617,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140411625,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140412183,
                "type": ""
            }
        ],
        "timestamp": 1639140412152,
        "duration": 417
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140412754,
        "duration": 209
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140413756,
                "type": ""
            }
        ],
        "timestamp": 1639140413024,
        "duration": 788
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140414078,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140414422,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140414422,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140414791,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140414795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140415207,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140415209,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140415529,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140415576,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140416910,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140417250,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140417252,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140417255,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140417574,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140417578,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140421104,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140421110,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140421422,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140421466,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140421742,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140421747,
                "type": ""
            }
        ],
        "timestamp": 1639140413891,
        "duration": 5763
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140423245,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140423547,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140423559,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140423917,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140423917,
                "type": ""
            }
        ],
        "timestamp": 1639140424083,
        "duration": 366
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140424545,
        "duration": 284
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140425754,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140425755,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140425756,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140426073,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140426084,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140426386,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140426402,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140428148,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140428481,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140428823,
                "type": ""
            }
        ],
        "timestamp": 1639140429846,
        "duration": 761
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140430677,
        "duration": 554
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140431288,
        "duration": 422
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140431757,
        "duration": 473
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140432299,
        "duration": 700
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434149,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434150,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434152,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434559,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434580,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434873,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140434881,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140436023,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140436379,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140436379,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140436715,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140436718,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140437647,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140437671,
                "type": ""
            }
        ],
        "timestamp": 1639140437693,
        "duration": 454
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1639140438537,
                "type": ""
            }
        ],
        "timestamp": 1639140438195,
        "duration": 390
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140438664,
        "duration": 442
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140439157,
        "duration": 377
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140440805,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140441219,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140441220,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140441541,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140441563,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140441931,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140441931,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140443092,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140443398,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140443399,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140443724,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140443730,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140444728,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140444767,
                "type": ""
            }
        ],
        "timestamp": 1639140444790,
        "duration": 415
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "e7b12bff070604b50ed005b3c5a8422a",
        "instanceId": 7696,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140445253,
        "duration": 347
    },
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140592982,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140592995,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140592999,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140594409,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140594535,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140594540,
                "type": ""
            }
        ],
        "timestamp": 1639140594992,
        "duration": 331
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140595503,
                "type": ""
            }
        ],
        "timestamp": 1639140595483,
        "duration": 205
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140597110,
                "type": ""
            }
        ],
        "timestamp": 1639140595750,
        "duration": 3433
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140599307,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140599307,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140599628,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140600136,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140600441,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140600453,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140600754,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140600776,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140600802,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140602235,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140602521,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140602524,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140602529,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140602841,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140602855,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604251,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604251,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604251,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604646,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604653,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604989,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140604989,
                "type": ""
            }
        ],
        "timestamp": 1639140599273,
        "duration": 4039
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140606667,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140607004,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140607416,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140607417,
                "type": ""
            }
        ],
        "timestamp": 1639140607579,
        "duration": 237
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140607877,
        "duration": 248
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140608981,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140608984,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140608994,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140609405,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140609405,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140609405,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140610692,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140613969,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140614374,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140614698,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140614704,
                "type": ""
            }
        ],
        "timestamp": 1639140615503,
        "duration": 582
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140616142,
        "duration": 404
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140616592,
        "duration": 441
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140617099,
        "duration": 465
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140617615,
        "duration": 618
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140619092,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140619092,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140619402,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140619419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140619727,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140620928,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140624609,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140624924,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140624925,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140625257,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140625271,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140626360,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140626400,
                "type": ""
            }
        ],
        "timestamp": 1639140626432,
        "duration": 473
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1639140627322,
                "type": ""
            }
        ],
        "timestamp": 1639140626958,
        "duration": 421
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140627429,
        "duration": 498
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140627977,
        "duration": 380
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140629454,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140629463,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140629768,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140629848,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140630081,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140630126,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140631448,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140631743,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140631754,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140631765,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140633144,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140633208,
                "type": ""
            }
        ],
        "timestamp": 1639140633249,
        "duration": 469
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "d29fe1690953cd1e34ab710da09bf7c9",
        "instanceId": 15644,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140633766,
        "duration": 391
    },
    {
        "description": "Verify userId label on login page is UserID|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140747599,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140747600,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140747603,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140748415,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140749084,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140749448,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140749449,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/favicon.ico - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140749951,
                "type": ""
            }
        ],
        "timestamp": 1639140749653,
        "duration": 425
    },
    {
        "description": "Verify password label on login page is Password|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140750296,
        "duration": 290
    },
    {
        "description": "Verify alert text without entering UserId and Password is User or Password is not valid|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140751332,
                "type": ""
            }
        ],
        "timestamp": 1639140750665,
        "duration": 694
    },
    {
        "description": "Login to Guru99Bank application|Guru99Bank LoginPage TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140751692,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140751692,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752009,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752030,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752416,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752428,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752428,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752921,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752921,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140752921,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140753251,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140754838,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140755140,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140755467,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140755476,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757072,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757073,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757076,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757398,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757399,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757445,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140757750,
                "type": ""
            }
        ],
        "timestamp": 1639140751430,
        "duration": 4764
    },
    {
        "description": "Verify user should able to seen welcome message after login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140759817,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140760193,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140760195,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140760198,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140760618,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140760618,
                "type": ""
            }
        ],
        "timestamp": 1639140760813,
        "duration": 227
    },
    {
        "description": "Verify user should able to see the manager id from which he login|Guru99Bank HomePage TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140762218,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140762219,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140762232,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140762544,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140762552,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140762552,
                "type": ""
            }
        ],
        "timestamp": 1639140761103,
        "duration": 343
    },
    {
        "description": "Verify costumer name field  with invalid name numbers |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140763993,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140764334,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140764335,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140764339,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140764673,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140764675,
                "type": ""
            }
        ],
        "timestamp": 1639140765733,
        "duration": 621
    },
    {
        "description": "Verify costumer name field with invalid name invallid chracters |Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140766471,
        "duration": 581
    },
    {
        "description": "Verify costumer name filed with invalid name space|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140767103,
        "duration": 365
    },
    {
        "description": "Verify the maximum characters limit in costumer name filed by enterig maximum characters|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140767513,
        "duration": 422
    },
    {
        "description": "verify costumer name message without entering any value|Guru99Bank NewCostumer Page Testcases workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140768013,
        "duration": 573
    },
    {
        "description": "verify edit costumer id by entering alphabets|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140769919,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140769921,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140770328,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140770349,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140770746,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140770747,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140771945,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140772276,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140772276,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140772691,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140772691,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140774838,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 38:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140774917,
                "type": ""
            }
        ],
        "timestamp": 1639140774968,
        "duration": 412
    },
    {
        "description": "Verify edit costumer id alert |Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/EditCustomer.php 203:113 Uncaught ReferenceError: validatebal is not defined",
                "timestamp": 1639140775889,
                "type": ""
            }
        ],
        "timestamp": 1639140775427,
        "duration": 498
    },
    {
        "description": "Verify costumer id field by entering special characters|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140775993,
        "duration": 355
    },
    {
        "description": "Verify costumer id field by entering space|Guru99Bank EditCostumer Page TestCases Workflow",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140778010,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140778419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140778419,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/3.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140778743,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140778747,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/2.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140779042,
                "type": ""
            }
        ],
        "timestamp": 1639140776403,
        "duration": 329
    },
    {
        "description": "Verify CustomerId Message By entering aphlabets|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/index.php 0:37 Uncaught SyntaxError: missing ) after argument list",
                "timestamp": 1639140780466,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/validate_login.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140780751,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/commonstyle.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140780762,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/scripts/basic_functions.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140781188,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/images/1.gif - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140781188,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/scripts/validatefuncs.js - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1639140782259,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://demo.guru99.com/V4/manager/DeleteCustomerInput.php 75:71 Uncaught TypeError: Cannot read properties of undefined (reading 'select')",
                "timestamp": 1639140782291,
                "type": ""
            }
        ],
        "timestamp": 1639140782309,
        "duration": 601
    },
    {
        "description": "Verify CustomerId Message By entering specialcharacters|Guru99Bank DeleteCustomer Page TestCases WorkFlow ",
        "passed": true,
        "pending": false,
        "os": "windows",
        "sessionId": "9b0a2d5d7c4e24e2bd473692e66c6d8a",
        "instanceId": 16492,
        "browser": {
            "name": "chrome",
            "version": "96.0.4664.93"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "timestamp": 1639140782995,
        "duration": 555
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
