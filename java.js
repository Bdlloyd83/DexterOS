function updateTime(){
    var time = new Date().toLocaleString();

    var txt = document.querySelector('.currentTime');

    txt.innerHTML = time;
}
setInterval(updateTime, 1000);

document.addEventListener("DOMContentLoaded", function () {
    var draggedApp = null;
    var pointerOffsetX = 0;
    var pointerOffsetY = 0;

    document.addEventListener("pointerdown", function (event) {
        var titleBar = event.target.closest(".appName");

        if (!titleBar || event.target.closest("button")) {
            return;
        }

        draggedApp = titleBar.closest(".app");
        var bounds = draggedApp.getBoundingClientRect();
        pointerOffsetX = event.clientX - bounds.left;
        pointerOffsetY = event.clientY - bounds.top;
        event.preventDefault();
    });

    document.addEventListener("pointermove", function (event) {
        if (!draggedApp) {
            return;
        }

        draggedApp.style.left = (event.clientX - pointerOffsetX) + "px";
        draggedApp.style.top = (event.clientY - pointerOffsetY) + "px";
    });

    document.addEventListener("pointerup", function () {
        draggedApp = null;
    });

    document.querySelectorAll(".appIcon[data-app]").forEach(function (appIcon) {
        function openApp() {
            document.getElementById(appIcon.dataset.app).style.display = "block";
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
            app.style.display = "none";
        });
    });
});
const items =["Dont get caught", "Never kill an innocent", "No traces", "Prove guilt", "Blend in", "Control the Dark Passenger",];

document.addEventListener("DOMContentLoaded", function () {
    var codeApp = document.querySelector(".codeApp");
    var codeList = document.querySelector("#codeList");
    var closeCode = document.querySelector("#closeCode");
    var previousCode = document.querySelector("#previousCode");
    var nextCode = document.querySelector("#nextCode");
    var selectedIndex = 0;

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
});
