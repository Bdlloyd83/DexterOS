function initAppSystem() {
    function updateTime(){
        var time = new Date().toLocaleString();
        var txt = document.querySelector('.currentTime');
        if (txt) {
            txt.innerHTML = time;
        }
    }
    
    // Start the timer
    updateTime(); // Call once immediately
    setInterval(updateTime, 1000);
    var draggedApp = null;
    var pointerOffsetX = 0;
    var pointerOffsetY = 0;
    var highestZ = 25;

    function bringToFront(app) {
        if (!app) {
            return;
        }

        highestZ += 1;
        app.style.zIndex = String(highestZ);
    }

    document.querySelectorAll('.app').forEach(function (app) {
        app.style.zIndex = '25';
    });

    document.addEventListener("pointerdown", function (event) {
        var titleBar = event.target.closest(".appName");
        if (!titleBar || event.target.closest("button")) {
            return;
        }

        draggedApp = titleBar.closest(".app");
        if (!draggedApp) {
            return;
        }

        bringToFront(draggedApp);

        var bounds = draggedApp.getBoundingClientRect();
        pointerOffsetX = event.clientX - bounds.left;
        pointerOffsetY = event.clientY - bounds.top;
        event.preventDefault();
    });

    document.addEventListener("pointermove", function (event) {
        if (!draggedApp) {
            return;
        }

        var appTray = document.querySelector('.apps');
        var minLeft = 12;
        var minTop = 12;
        var trayWidth = appTray ? appTray.offsetWidth + 20 : 120;
        var appWidth = draggedApp.offsetWidth || 200;
        var appHeight = draggedApp.offsetHeight || 120;
        var maxLeft = window.innerWidth - appWidth - 12;
        var maxTop = window.innerHeight - appHeight - 12;

        if (appBarPosition === 'left') {
            minLeft = appTray ? appTray.offsetWidth + 20 : 120;
            maxLeft = window.innerWidth - appWidth - 12;
        } else if (appBarPosition === 'right') {
            minLeft = 12;
            maxLeft = Math.max(minLeft, window.innerWidth - trayWidth - appWidth);
        } else {
            minLeft = 12;
            maxLeft = window.innerWidth - appWidth - 12;
        }

        var newLeft = event.clientX - pointerOffsetX;
        var newTop = event.clientY - pointerOffsetY;

        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        newTop = Math.max(minTop, Math.min(newTop, maxTop));

        draggedApp.style.left = newLeft + "px";
        draggedApp.style.top = newTop + "px";
    });

    document.addEventListener("pointerup", function () {
        draggedApp = null;
    });

    function resetEvidenceLockerState() {
        var evidenceApp = document.getElementById('evidenceApp');
        var lockedBox = document.getElementById('locked');
        var unlockedBox = document.getElementById('unlocked');
        var pinInput = document.getElementById('pinInput');
        var pinMessage = document.getElementById('pinMessage');

        if (!evidenceApp || !lockedBox || !unlockedBox) {
            return;
        }

        lockedBox.hidden = false;
        unlockedBox.hidden = true;
        if (pinInput) {
            pinInput.value = '';
        }
        if (pinMessage) {
            pinMessage.textContent = '';
        }
    }

    document.querySelectorAll(".appIcon[data-app]").forEach(function (appIcon) {
        function openApp() {
            var appToOpen = document.getElementById(appIcon.dataset.app);
            if (appToOpen) {
                if (appToOpen.id === 'evidenceApp') {
                    resetEvidenceLockerState();
                }
                appToOpen.style.display = "block";
                bringToFront(appToOpen);
                if (appToOpen.id === 'weatherApp') {
                    getLocation();
                }
            }
        }

        appIcon.addEventListener("click", function () {
            openApp();
        });
        appIcon.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openApp();
            }
        });
    });

    document.querySelectorAll(".closeButton").forEach(function (closeButton) {
        closeButton.addEventListener("click", function () {
            var app = closeButton.closest(".app");
            if (app) {
                app.style.display = "none";
                if (app.id === 'welcomeScreen') {
                    try {
                        localStorage.setItem('welcomeScreenSeen', 'true');
                    } catch (error) {
                        // The welcome screen can still be closed if storage is unavailable.
                    }
                }
            }
        });
    });

    var welcomeApp = document.getElementById('welcomeScreen');
    var shouldShowWelcome = false;
    try {
        shouldShowWelcome = !localStorage.getItem('welcomeScreenSeen');
    } catch (error) {
        shouldShowWelcome = true;
    }

    if (welcomeApp && shouldShowWelcome) {
        welcomeApp.style.display = 'block';
        bringToFront(welcomeApp);
    }

    var items = ["Dont get caught", "Never kill an innocent", "No traces", "Prove guilt", "Blend in", "Control the Dark Passenger"];
    var codeApp = document.querySelector(".codeApp");
    var codeList = document.querySelector("#codeList");
    var closeCode = document.querySelector("#closeCode");
    var previousCode = document.querySelector("#previousCode");
    var nextCode = document.querySelector("#nextCode");
    var selectedIndex = 0;

    if (codeApp && codeList && closeCode && previousCode && nextCode) {
        items.forEach(function (item, index) {
            var listItem = document.createElement("li");
            listItem.textContent = item;
            listItem.tabIndex = -1;
            listItem.dataset.index = index;
            codeList.appendChild(listItem);
        });

        function selectItem(index) {
            selectedIndex = (index + items.length) % items.length;
            Array.from(codeList.children).forEach(function (listItem, itemIndex) {
                var isSelected = itemIndex === selectedIndex;
                listItem.classList.toggle("selected", isSelected);
                listItem.hidden = !isSelected;
                listItem.setAttribute("aria-selected", isSelected);
            });
        }

        codeList.addEventListener("keydown", function (event) {
            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                selectItem(selectedIndex + 1);
            }
            if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                selectItem(selectedIndex - 1);
            }
        });

        codeList.addEventListener("click", function (event) {
            if (event.target.matches("li")) {
                selectItem(Number(event.target.dataset.index));
                codeList.focus();
            }
        });

        previousCode.addEventListener("click", function () {
            selectItem(selectedIndex - 1);
            codeList.focus();
        });

        nextCode.addEventListener("click", function () {
            selectItem(selectedIndex + 1);
            codeList.focus();
        });

        closeCode.onclick = function () {
            codeApp.style.display = "none";
        };

        selectItem(0);
    }
    function setWeatherMessage(message) {
        var locationEl = document.getElementById('location');
        var tempEl = document.getElementById('temp');
        var humidityEl = document.getElementById('humidity');
        var visibilityEl = document.getElementById('visibility');

        if (locationEl) locationEl.innerText = message;
        if (tempEl) tempEl.innerText = 'Temp: --';
        if (humidityEl) humidityEl.innerText = 'Humidity: --';
        if (visibilityEl) visibilityEl.innerText = 'Visibility: --';
    }

    function getLocation() {
        if (!navigator.geolocation) {
            setWeatherMessage('Location: Geolocation is not supported by your browser.');
            return;
        }

        setWeatherMessage('Location: Requesting permission...');
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        });
    }

    function successCallback(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var locationEl = document.getElementById('location');

        if (locationEl) {
            locationEl.innerText = 'Location: ' + latitude.toFixed(4) + ', ' + longitude.toFixed(4);
        }

        getTemperature(latitude, longitude);
    }

    function errorCallback(error) {
        var message = 'Location: Unable to determine your location.';

        if (error.code === error.PERMISSION_DENIED) {
            message = 'Location: Permission was denied.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'Location: Information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
            message = 'Location: Request timed out.';
        }

        setWeatherMessage(message);
    }

    async function getTemperature(latitude, longitude) {
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude +
            '&longitude=' + longitude +
            '&current=temperature_2m,relative_humidity_2m,visibility' +
            '&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto';

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Weather request failed');
            }

            const data = await response.json();
            const current = data.current;
            const units = data.current_units;

            var tempEl = document.getElementById('temp');
            var humidityEl = document.getElementById('humidity');
            var visibilityEl = document.getElementById('visibility');

            if (tempEl) tempEl.innerText = `Temp: ${current.temperature_2m} ${units.temperature_2m}`;
            if (humidityEl) humidityEl.innerText = `Humidity: ${current.relative_humidity_2m} ${units.relative_humidity_2m}`;
            if (visibilityEl) visibilityEl.innerText = `Visibility: ${current.visibility} ${units.visibility}`;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            var tempEl = document.getElementById('temp');
            var humidityEl = document.getElementById('humidity');
            var visibilityEl = document.getElementById('visibility');

            if (tempEl) tempEl.innerText = 'Temp: Error loading data';
            if (humidityEl) humidityEl.innerText = 'Humidity: Error loading data';
            if (visibilityEl) visibilityEl.innerText = 'Visibility: Error loading data';
        }
    }

    var contentList = [
        {
            name: "Arthur Mitchell",
            photo: "trinity.jpg",
            paragraph: "Known locally as Trinity. Police linked him to a string of killings and a carefully hidden family life."
        },
        {
            name: "Isaak Sirko",
            photo: "isaakSirko.png",
            paragraph: "Russian gang associate tied to trafficking, intimidation, and violent enforcement."
        },
        {
            name: "Travis Marshall",
            photo: "travisMarshall.png",
            paragraph: "Self-styled prophet connected to cult activity and multiple homicide investigations."
        },
        {
            name: "Jordan Chase",
            photo: "jordanChase.png",
            paragraph: "Former public figure under scrutiny for abuse, manipulation, and suspected murder links."
        },
        {
            name: "Miguel Prado",
            photo: "migelPrado.png",
            paragraph: "Businessman and suspected crime figure with repeated ties to organized violence."
        },
        {
            name: "Brain Surgeon",
            photo: "brainSurgeon.png",
            paragraph: "Unidentified killer known for precise, surgical attacks and calculated victim selection."
        },
        {
            name: "James Doakes",
            photo: "bayHarborButcher.png",
            paragraph: "Police identified James Doakes as the Bay Harbor Butcher in a series of brutal killings."
        },
        {
            name: "Ice Truck Killer",
            photo: "iceTruck.png",
            paragraph: "Unidentified suspect linked to refrigerated-victim murders and a pattern of highly organized attacks."
        }
    ];

    var currentIndex = 0;
    var nameEl = document.getElementById('name');
    var photoEl = document.getElementById('photo');
    var paragraphEl = document.getElementById('paragraph');
    var prevButton = document.getElementById('prevButton');
    var nextButton = document.getElementById('nextButton');

    function updateCard() {
        if (!nameEl || !photoEl || !paragraphEl) {
            return;
        }

        var currentItem = contentList[currentIndex];
        nameEl.textContent = currentItem.name;
        photoEl.src = currentItem.photo;
        photoEl.alt = currentItem.name;
        paragraphEl.textContent = currentItem.paragraph;
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            currentIndex = (currentIndex - 1 + contentList.length) % contentList.length;
            updateCard();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            currentIndex = (currentIndex + 1) % contentList.length;
            updateCard();
        });
    }

    function updateOperationsStats() {
        var cpuEl = document.getElementById('cpuUsage');
        var diskEl = document.getElementById('diskUsage');
        var memoryEl = document.getElementById('memoryUsage');

        if (!cpuEl || !diskEl || !memoryEl) {
            return;
        }

        var cpu = Math.floor(35 + Math.random() * 60);
        var disk = Math.floor(50 + Math.random() * 40);
        var memory = Math.floor(45 + Math.random() * 50);

        cpuEl.textContent = 'CPU: ' + cpu + '%';
        diskEl.textContent = 'Disk: ' + disk + '%';
        memoryEl.textContent = 'Memory: ' + memory + '%';
    }

    var pinInput = document.getElementById('pinInput');
    var pinSubmit = document.getElementById('pinSubmit');
    var pinMessage = document.getElementById('pinMessage');
    var lockedBox = document.getElementById('locked');
    var unlockedBox = document.getElementById('unlocked');

    if (pinInput && pinSubmit && pinMessage && lockedBox && unlockedBox) {
        var storageAvailable = true;
        var memoryPin = null;

        function getSavedPin() {
            try {
                return localStorage.getItem('evidencePin');
            } catch (error) {
                storageAvailable = false;
                return memoryPin;
            }
        }

        function savePin(pin) {
            if (storageAvailable) {
                try {
                    localStorage.setItem('evidencePin', pin);
                    return;
                } catch (error) {
                    storageAvailable = false;
                }
            }
            memoryPin = pin;
        }

        function unlockEvidence() {
            var enteredPin = pinInput.value.trim();
            var existingPin = getSavedPin();

            if (!enteredPin) {
                pinMessage.textContent = 'Please enter a pin.';
                return;
            }

            if (!existingPin) {
                savePin(enteredPin);
                lockedBox.hidden = true;
                unlockedBox.hidden = false;
                pinMessage.textContent = '';
                return;
            }

            if (enteredPin === existingPin) {
                lockedBox.hidden = true;
                unlockedBox.hidden = false;
                pinMessage.textContent = '';
                return;
            }

            pinMessage.textContent = 'Incorrect pin.';
        }

        pinSubmit.addEventListener('click', unlockEvidence);
        pinInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                unlockEvidence();
            }
        });
    }

    updateOperationsStats();
    setInterval(updateOperationsStats, 3000);


    updateCard();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppSystem);
} else {
    initAppSystem();
}

// ===== CLOCK APP: TAB SWITCHING =====
function switchTab(tabName) {
    var allTabs = document.querySelectorAll('.tabContent');
    var allButtons = document.querySelectorAll('.tabButton');
    
    allTabs.forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    allButtons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    var activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    var activeButton = document.querySelector('[data-tab="' + tabName + '"]');
    if (activeButton) {
        activeButton.classList.add('active');
    }
}


var stopwatchInterval = null;
var stopwatchSeconds = 0;

function formatTime(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;
    
    return String(hours).padStart(2, '0') + ':' + 
           String(minutes).padStart(2, '0') + ':' + 
           String(secs).padStart(2, '0');
}

function startStopwatch() {
    if (stopwatchInterval) {
        return;
    }
    
    stopwatchInterval = setInterval(function() {
        stopwatchSeconds++;
        var display = document.getElementById('stopwatchDisplay');
        if (display) {
            display.textContent = formatTime(stopwatchSeconds);
        }
    }, 1000);
}

function stopStopwatch() {
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
}

function resetStopwatch() {
    stopStopwatch();
    stopwatchSeconds = 0;
    var display = document.getElementById('stopwatchDisplay');
    if (display) {
        display.textContent = formatTime(0);
    }
}

// ===== TIMER FUNCTIONALITY =====
var timerInterval = null;
var timerTotalSeconds = 0;

function startTimer() {
    if (timerInterval) {
        return;
    }
    
    var hours = parseInt(document.getElementById('timerHours').value) || 0;
    var minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    var seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    
    timerTotalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (timerTotalSeconds <= 0) {
        alert('Please set a valid time');
        return;
    }
    
    timerInterval = setInterval(function() {
        timerTotalSeconds--;
        var display = document.getElementById('timerDisplay');
        if (display) {
            display.textContent = formatTime(timerTotalSeconds);
        }
        
        if (timerTotalSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert('Timer finished!');
        }
    }, 1000);
    
    document.getElementById('timerHours').disabled = true;
    document.getElementById('timerMinutes').disabled = true;
    document.getElementById('timerSeconds').disabled = true;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.getElementById('timerHours').disabled = false;
    document.getElementById('timerMinutes').disabled = false;
    document.getElementById('timerSeconds').disabled = false;
}

function resetTimer() {
    stopTimer();
    timerTotalSeconds = 0;
    var display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent = formatTime(0);
    }
    document.getElementById('timerHours').value = '';
    document.getElementById('timerMinutes').value = '';
    document.getElementById('timerSeconds').value = '';
}

// ===== ALARM FUNCTIONALITY =====
var alarmInterval = null;
var alarmSet = false;
var alarmTime = null;

function setAlarm() {
    var alarmInput = document.getElementById('alarmInput');
    if (!alarmInput.value) {
        alert('Please set an alarm time');
        return;
    }
    
    alarmTime = alarmInput.value;
    alarmSet = true;
    document.getElementById('alarmDisplay').textContent = 'Alarm set for ' + alarmTime;
    
    if (alarmInterval) {
        clearInterval(alarmInterval);
    }
    
    alarmInterval = setInterval(function() {
        var now = new Date();
        var currentTime = String(now.getHours()).padStart(2, '0') + ':' + 
                         String(now.getMinutes()).padStart(2, '0');
        
        if (currentTime === alarmTime && alarmSet) {
            triggerAlarm();
        }
    }, 1000);
}

function triggerAlarm() {
    alarmSet = false;
    clearInterval(alarmInterval);
    alarmInterval = null;
    
    alert('Alarm ringing!');
    document.getElementById('alarmDisplay').textContent = 'Alarm finished!';
}

function stopAlarm() {
    alarmSet = false;
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
    document.getElementById('alarmDisplay').textContent = 'No alarm set';
    document.getElementById('alarmInput').value = '';
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    var display = document.getElementById('stopwatDisplay');
    if (display) {
        display.textContent = formatTime(0);
    }
}

var spoilersOn = false;

function toggleSpoilers() {
    spoilersOn = !spoilersOn;
    var spoilerButton = document.getElementById('spoilerWarning');
    if (spoilerButton) {
        spoilerButton.textContent = spoilersOn ? 'Spoilers On' : 'Spoilers Off';
    }
    updateSpoilersVisibility();
}

function updateSpoilersVisibility() {
    var spoilersOffDiv = document.getElementById('spoilersOff');
    var spoilersOnDiv = document.getElementById('spoilersOn');
    
    if (spoilersOffDiv && spoilersOnDiv) {
        if (spoilersOn) {
            spoilersOffDiv.hidden = true;
            spoilersOnDiv.hidden = false;
        } else {
            spoilersOffDiv.hidden = false;
            spoilersOnDiv.hidden = true;
        }
    }
}

// Initialize spoilers state on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateSpoilersVisibility);
} else {
    updateSpoilersVisibility();
}

var previewNames = true;

function syncPreviewNamesState() {
    document.body.classList.toggle('previewNamesOn', previewNames);

    document.querySelectorAll('.appIcon').forEach(function (appIcon) {
        var appEl = document.getElementById(appIcon.dataset.app);
        var isOpen = !!(appEl && window.getComputedStyle(appEl).display !== 'none');
        appIcon.classList.toggle('app-open', isOpen);
    });

    var previewButton = document.getElementById('previewAppNames');
    if (previewButton) {
        previewButton.textContent = previewNames ? 'Preview Names On' : 'Preview Names Off';
    }
}

function togglePreviewNames() {
    previewNames = !previewNames;
    syncPreviewNamesState();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncPreviewNamesState);
} else {
    syncPreviewNamesState();
}

var appBarPosition = 'bottom';

function setAppBarPosition(position) {
    appBarPosition = position || 'bottom';
    syncAppBarPosition();
}

window.setAppBarPosition = setAppBarPosition;

function syncAppBarPosition() {
    document.body.classList.remove('app-bar-bottom', 'app-bar-top');
    document.body.classList.add('app-bar-' + appBarPosition);

    document.querySelectorAll('.appBarButtons button').forEach(function (button) {
        var isActive = button.id === 'appBar' + appBarPosition.charAt(0).toUpperCase() + appBarPosition.slice(1);
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

window.syncAppBarPosition = syncAppBarPosition;

function initAppBarControls() {
    syncAppBarPosition();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppBarControls);
} else {
    initAppBarControls();
}
var appBarPosition = 'bottom'
function switchTitleBarPosition(titleBarPosition) {
    document.body.id.remove('top', 'bottom');
    document.body.id.add(titleBarPosition);
}

var themeColor = 'blue';
var themeColors = ['blue', 'green', 'red', 'black', 'white'];

function normalizeColor(color) {
    if (!color) {
        return { r: 0, g: 0, b: 0 };
    }

    if (color.startsWith('#')) {
        var sanitized = color.replace('#', '');
        if (sanitized.length === 3) {
            sanitized = sanitized.split('').map(function (ch) {
                return ch + ch;
            }).join('');
        }

        var value = parseInt(sanitized, 16);
        return {
            r: (value >> 16) & 255,
            g: (value >> 8) & 255,
            b: value & 255
        };
    }

    var rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
        var channels = rgbMatch[1].split(',').map(function (part) {
            return parseFloat(part.trim());
        });
        return {
            r: channels[0],
            g: channels[1],
            b: channels[2]
        };
    }

    return { r: 0, g: 0, b: 0 };
}

function mixColors(colorA, colorB, ratio) {
    var a = normalizeColor(colorA);
    var b = normalizeColor(colorB);
    var mixed = {
        r: Math.round(a.r + (b.r - a.r) * ratio),
        g: Math.round(a.g + (b.g - a.g) * ratio),
        b: Math.round(a.b + (b.b - a.b) * ratio)
    };

    return 'rgb(' + mixed.r + ', ' + mixed.g + ', ' + mixed.b + ')';
}

var themePalette = {
    blue: {
        themeBg: '#06213a',
        themeText: '#c6fffa',
        contentBg: '#003192',
        contentText: '#c6fffa'
    },
    green: {
        themeBg: '#103a06',
        themeText: '#95ff75',
        contentBg: '#198a00',
        contentText: '#b2fdb2'
    },
    red: {
        themeBg: '#3a0606',
        themeText: '#ff7575',
        contentBg: '#8a0808',
        contentText: '#ffc5c5'
    },
    black: {
        themeBg: '#0a0a0a',
        themeText: '#ffffff',
        contentBg: '#464545',
        contentText: '#dfdfdf'
    },
    white: {
        themeBg: '#ffffff',
        themeText: '#000000',
        contentBg: '#f0f0f0',
        contentText: '#0a0a0a'
    }
};

function applyThemeColor(color) {
    if (!themePalette[color]) {
        color = 'blue';
    }

    themeColor = color;

    var palette = themePalette[color];
    var bodyMidTone = mixColors(palette.themeBg, palette.contentBg, 0.5);
    var buttonTone = mixColors(bodyMidTone, palette.themeBg, 0.6);

    document.body.style.setProperty('--currentTheme', palette.themeBg);
    document.body.style.setProperty('--currentThemeText', palette.themeText);
    document.body.style.setProperty('--currentText', palette.contentBg);
    document.body.style.setProperty('--currentTextColor', palette.contentText);
    document.body.style.setProperty('--appButtonBg', buttonTone);
    document.body.style.backgroundColor = bodyMidTone;
    document.body.style.color = palette.contentText;

    document.querySelectorAll('.appName, .titleBar, .titleBar #title, .titleBar #currentTime').forEach(function (element) {
        if (element) {
            element.style.backgroundColor = palette.themeBg;
            element.style.color = palette.themeText;
        }
    });

    document.querySelectorAll('.appContent').forEach(function (element) {
        if (element) {
            element.style.backgroundColor = palette.contentBg;
            element.style.color = palette.contentText;
        }
    });

    document.querySelectorAll('.appContent button, .appBarButtons button, .themeArrows button, .backgroundButtons button, .tabButton, .codeArrow').forEach(function (button) {
        if (button) {
            button.style.backgroundColor = buttonTone;
            button.style.color = palette.themeText;
            button.style.borderColor = palette.themeBg;
        }
    });

    document.querySelectorAll('.themeButtons > div').forEach(function (themePanel) {
        if (themePanel) {
            themePanel.hidden = themePanel.id !== color;
        }
    });
}

function nextTheme() {
    var currentIndex = themeColors.indexOf(themeColor);
    var nextIndex = (currentIndex + 1) % themeColors.length;
    applyThemeColor(themeColors[nextIndex]);
}

function previousTheme() {
    var currentIndex = themeColors.indexOf(themeColor);
    var previousIndex = (currentIndex - 1 + themeColors.length) % themeColors.length;
    applyThemeColor(themeColors[previousIndex]);
}

function initCustomizationTheme() {
    var switchButton = document.getElementById('switchTheme');
    if (switchButton) {
        switchButton.addEventListener('click', nextTheme);
    }

    applyThemeColor(themeColor);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomizationTheme);
} else {
    initCustomizationTheme();
}
var backgroundImages = [
    "dexter.png",
    "dexterColor.png",
    "hannah.png",
    "hannahColor.png",
    "deb.png",
    "debColor.png",
    "harrison.png",
    "harrisonColor.png",
    "rita.png",
    "ritaColor.png"
];
var currentBackgroundIndex = 0; 
function setBackgroundImage(index) {
    if (index < 0 || index >= backgroundImages.length) {
        index = 0;
    }
    currentBackgroundIndex = index;
    document.body.style.backgroundImage = "url('" + backgroundImages[index] + "')";
}
var photos = [
    "nature1.jpg",
    "nature2.jpg",
    "nature3.jpg"
];

var currentPhotoIndex = 0;
function initPhotos() {
    var photoInput = document.getElementById('photoInput');

    if (photoInput) {
        photoInput.addEventListener('change', function (event) {
            var files = Array.from(event.target.files || []).filter(function (file) {
                return file.type.indexOf('image/') === 0;
            });

            files.forEach(function (file) {
                photos.push(URL.createObjectURL(file));
            });

            if (files.length > 0) {
                currentPhotoIndex = photos.length - files.length;
                updatePhoto();
            }
        });
    }

    updatePhoto();
}

function updatePhoto() {
    var photoDisplay = document.getElementById('photoDisplay');
    if (!photoDisplay || photos.length === 0) {
        return;
    }

    photoDisplay.src = photos[currentPhotoIndex];
    photoDisplay.alt = 'Nature photo ' + (currentPhotoIndex + 1);
}

function nextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
    updatePhoto();
}

function previousPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
    updatePhoto();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhotos);
} else {
    initPhotos();
}
function getCalculatorDisplay() {
    return document.getElementById('calc');
}

function appendNumber(input){
    var display = getCalculatorDisplay();
    if (display) {
        display.value += input;
    }
}
function appendOperator(operator){
    var display = getCalculatorDisplay();
    if (!display) {
        return;
    }

    const lastChar = display.value.slice(-1);
    if (display.value === '' && operator !== '-') return;
    if(['+', '-', '*', '/'].includes(lastChar)) {
        display.value = display.value.slice(0, -1) + operator;
    
    } else {
        display.value += operator;
    }
}
function clearDisplay(){ 
    var display = getCalculatorDisplay();
    if (display) {
        display.value = '';
    }
}
function calculate() {
    var display = getCalculatorDisplay();
    if (!display) {
        return;
    }

    try {
        if (display.value){
            display.value = eval(display.value);
        } 
    } catch (error) {
        display.value = 'Error'
    }
}
var currentDate = new Date();
var selectedDateKey = null;
var eventsData = {};
var monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function initCalendar() {
    var monthYearDisplay = document.getElementById('monthYearDisplay');
    var calendarDaysContainer = document.getElementById('calendarDays');
    var prevMonthBtn = document.getElementById('prevMonth');
    var nextMonthBtn = document.getElementById('nextMonth');
    var eventModal = document.getElementById('eventModal');
    var closeModalBtn = document.getElementById('closeModal');
    var saveEventBtn = document.getElementById('saveEvent');
    var eventInput = document.getElementById('eventInput');
    var modalDateTitle = document.getElementById('modalContent');

    if (!monthYearDisplay || !calendarDaysContainer || !eventModal || !eventInput) {
        return;
    }

    try {
        eventsData = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    } catch (error) {
        eventsData = {};
    }

    function renderCalendar() {
        var year = currentDate.getFullYear();
        var month = currentDate.getMonth();
        var firstDayIndex = new Date(year, month, 1).getDay();
        var totalDays = new Date(year, month + 1, 0).getDate();

        monthYearDisplay.textContent = monthNames[month] + ' ' + year;
        calendarDaysContainer.innerHTML = '';

        for (var emptyIndex = 0; emptyIndex < firstDayIndex; emptyIndex += 1) {
            var emptyCell = document.createElement('div');
            emptyCell.className = 'dayCell empty';
            emptyCell.setAttribute('aria-hidden', 'true');
            calendarDaysContainer.appendChild(emptyCell);
        }

        for (var day = 1; day <= totalDays; day += 1) {
            var dayCell = document.createElement('button');
            var dateKey = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
            dayCell.type = 'button';
            dayCell.className = 'dayCell';
            dayCell.innerHTML = '<span class="dayNumber">' + day + '</span>';

            if (dateKey === new Date().toISOString().slice(0, 10)) {
                dayCell.classList.add('today');
            }

            (eventsData[dateKey] || []).forEach(function (eventText) {
                var badge = document.createElement('span');
                badge.className = 'eventBadge';
                badge.textContent = eventText;
                dayCell.appendChild(badge);
            });

            dayCell.addEventListener('click', function () {
                openModal(this.dataset.date);
            });
            dayCell.dataset.date = dateKey;
            calendarDaysContainer.appendChild(dayCell);
        }
    }

    function openModal(dateKey) {
        selectedDateKey = dateKey;
        modalDateTitle.textContent = 'Add Event for ' + dateKey;
        eventInput.value = '';
        eventModal.style.display = 'flex';
        eventInput.focus();
    }

    function closeModal() {
        eventModal.style.display = 'none';
        selectedDateKey = null;
    }

    function saveEvent() {
        var textValue = eventInput.value.trim();
        if (!textValue || !selectedDateKey) {
            return;
        }

        if (!eventsData[selectedDateKey]) {
            eventsData[selectedDateKey] = [];
        }
        eventsData[selectedDateKey].push(textValue);
        localStorage.setItem('calendarEvents', JSON.stringify(eventsData));
        closeModal();
        renderCalendar();
    }

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function () {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function () {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    if (saveEventBtn) saveEventBtn.addEventListener('click', saveEvent);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    eventModal.addEventListener('click', function (event) {
        if (event.target === eventModal) closeModal();
    });
    eventInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') saveEvent();
        if (event.key === 'Escape') closeModal();
    });

    renderCalendar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
} else {
    initCalendar();
}
var glassModeOn = false;

function toggleGlassMode() {
    glassModeOn = !glassModeOn;
    var glassButton = document.getElementById('glassMode');
    if (glassButton) {
        glassButton.textContent = glassModeOn ? 'Glass Mode On' : 'Glass Mode Off';
        glassButton.classList.toggle('glassBtn', glassModeOn);
        glassButton.setAttribute('aria-pressed', glassModeOn ? 'true' : 'false');
    }
    document.body.classList.toggle('glassMode', glassModeOn);
}
