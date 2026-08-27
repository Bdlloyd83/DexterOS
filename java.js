function updateTime(){
    var time = new Date().toLocaleString();

    var txt = document.querySelector('.currentTime');

    txt.innerHTML = time;
}
setInterval(updateTime, 1000);

document.addEventListener("DOMContentLoaded", function () {
    var element = document.querySelector(".app");
    var appIcon = document.querySelector(".appIcon");
    var appName = document.querySelector(".appName");
    var closeButton = document.querySelector("#closeNotepad");
    var pointerOffsetX = 0;
    var pointerOffsetY = 0;

    appName.onmousedown = function (event) {
        event.preventDefault();
        var bounds = element.getBoundingClientRect();
        pointerOffsetX = event.clientX - bounds.left;
        pointerOffsetY = event.clientY - bounds.top;
        document.onmouseup = stopDragging;
        document.onmousemove = drag;
    };

    function drag(event) {
        element.style.left = (event.clientX - pointerOffsetX) + "px";
        element.style.top = (event.clientY - pointerOffsetY) + "px";
    }

    function stopDragging() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    closeButton.onclick = function () {
        element.style.display = "none";
    };

    appIcon.onclick = function () {
        element.style.display = "block";
    };
});
