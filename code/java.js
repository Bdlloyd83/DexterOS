function updateTime(){
    var time = new Date().toLocaleString();
    var txt = document.querySelector('.currentTime');
    if (txt) {
        txt.innerHTML = time;
    }
}
setInterval(updateTime, 1000);

function initAppSystem() {
    var draggedApp = null;
    var pointerOffsetX = 0;
    var pointerOffsetY = 0;
    var highestZ = 15;

    function bringToFront(app) {
        if (!app) {
            return;
        }

        highestZ += 1;
        app.style.zIndex = String(highestZ);
    }

    document.querySelectorAll('.app').forEach(function (app) {
        app.style.zIndex = '15';
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

        var topBar = document.querySelector('.topBar');
        var appTray = document.querySelector('.apps');
        var minLeft = 12;
        var minTop = topBar ? topBar.offsetHeight + 12 : 48;
        var trayWidth = appTray ? appTray.offsetWidth + 20 : 120;
        var appWidth = draggedApp.offsetWidth || 200;
        var appHeight = draggedApp.offsetHeight || 120;
        var maxLeft = Math.max(minLeft, window.innerWidth - trayWidth - appWidth);
        var maxTop = window.innerHeight - appHeight - 12;
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
            }
        }

        appIcon.addEventListener("click", openApp);
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
            }
        });
    });

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

    const latitude = 45.364;
    const longitude = -85.082;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,visibility&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;

    async function getTemperature() {
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
            name: "Trinity",
            photo: "trinity.jpg",
            paragraph: "Also known as Arthur Mitchell, Trinity lives a double life. He balances a family life while hiding a darker side that is tied to murder and manipulation."
        },
        {
            name: "Dexter Morgan",
            photo: "dexter.png",
            paragraph: "A blood spatter analyst by day and a vigilante by night, Dexter is driven by a code and a need to control the chaos in his world."
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

    var modeButton = document.getElementById('mode');

    function applyTheme(theme) {
        var isDark = theme === 'dark';
        document.body.classList.toggle('darkMode', isDark);

        if (modeButton) {
            modeButton.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }
    }

    try {
        var savedTheme = localStorage.getItem('theme');
        applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
    } catch (error) {
        applyTheme('light');
    }

    if (modeButton) {
        modeButton.onclick = function () {
            var nextTheme = document.body.classList.contains('darkMode') ? 'light' : 'dark';
            applyTheme(nextTheme);

            try {
                localStorage.setItem('theme', nextTheme);
            } catch (error) {
                // localStorage may be blocked on local file pages; ignore the error and keep the UI state
            }
        };
    }

    getTemperature();
    updateCard();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppSystem);
} else {
    initAppSystem();
}
