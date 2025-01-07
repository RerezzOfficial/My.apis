function toggleNav() {
    var sidebar = document.getElementById("mySidebar");
    var menuIcon = document.getElementById("menuIcon");
    var overlay = document.getElementById("overlay");
    if (sidebar.style.width === "300px") {
        sidebar.style.width = "0";
        overlay.style.display = "none";
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
        menuIcon.style.transform = "rotate(360deg)";
        setTimeout(function() {
            menuIcon.style.transform = "rotate(0deg)";
        }, 500);
    } else {
        sidebar.style.width = "300px";
        overlay.style.display = "block";
        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-times");
        menuIcon.style.transform = "rotate(360deg)";
        setTimeout(function() {
            menuIcon.style.transform = "rotate(0deg)";
        }, 500);
    }
}

function toggleProfilePopup() {
    var profilePopup = document.getElementById("profilePopup");
    var profileIcon = document.getElementById("profileIcon");
    var overlay = document.getElementById("overlay");
    if (profilePopup.style.display === "block") {
        profilePopup.classList.remove("show");
        setTimeout(function() {
            profilePopup.style.display = "none";
            overlay.style.display = "none";
        }, 500);
        profileIcon.style.transform = "rotate(360deg)";
        setTimeout(function() {
            profileIcon.style.transform = "rotate(0deg)";
        }, 500);
    } else {
        profilePopup.style.display = "block";
        overlay.style.display = "block";
        setTimeout(function() {
            profilePopup.classList.add("show");
        }, 10);
        profileIcon.style.transform = "rotate(360deg)";
        setTimeout(function() {
            profileIcon.style.transform = "rotate(0deg)";
        }, 500);
    }
}

function closeAll() {
    var sidebar = document.getElementById("mySidebar");
    var menuIcon = document.getElementById("menuIcon");
    var overlay = document.getElementById("overlay");
    var profilePopup = document.getElementById("profilePopup");
    var profileIcon = document.getElementById("profileIcon");
    sidebar.style.width = "0";
    profilePopup.classList.remove("show");
    setTimeout(function() {
        profilePopup.style.display = "none";
        overlay.style.display = "none";
    }, 500);
    menuIcon.classList.remove("fa-times");
    menuIcon.classList.add("fa-bars");
    menuIcon.style.transform = "rotate(360deg)";
    setTimeout(function() {
        menuIcon.style.transform = "rotate(0deg)";
    }, 500);
    profileIcon.style.transform = "rotate(360deg)";
    setTimeout(function() {
        profileIcon.style.transform = "rotate(0deg)";
    }, 500);
}

function closeNotification() {
    var notification = document.getElementById("notification");
    notification.style.display = "none";
}

window.addEventListener("load", function() {
    var container = document.querySelector(".container");
    container.style.opacity = "1";
});

function openLink(button) {
    var url = button.getAttribute("data-url"); // Ambil URL dari atribut data-url
    window.open(url, "_blank"); // Buka URL di tab baru
}
