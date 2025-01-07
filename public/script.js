function toggleNav() {
    var sidebar = document.getElementById("mySidebar");
    var menuIcon = document.getElementById("menuIcon");
    var overlay = document.getElementById("overlay");
    if (sidebar.style.width === "500px") {
        sidebar.style.width = "0";
        overlay.style.display = "none";
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
        menuIcon.style.transform = "rotate(360deg)";
        setTimeout(function() {
            menuIcon.style.transform = "rotate(0deg)";
        }, 500);
    } else {
        sidebar.style.width = "500px";
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
    var url = button.getAttribute("data-url");
    window.open(url, "_blank");
}


//=====[ FUNCTION JUMLAH PENGUNJUNG ]======//
        function getCurrentTime() {
            return new Date().getTime();
        }

        function getVisitorCount() {
            const count = localStorage.getItem('visitorCount');
            return count ? parseInt(count, 10) : 0;
        }

        function setVisitorCount(count) {
            localStorage.setItem('visitorCount', count);
        }

        function setResetTime() {
            localStorage.setItem('resetTime', getCurrentTime());
        }

        function getResetTime() {
            return localStorage.getItem('resetTime');
        }

        function isResetTimePassed() {
            const lastReset = getResetTime();
            const currentTime = getCurrentTime();
            return !lastReset || (currentTime - lastReset > 3600000); // 60 menit = 3600000 ms
        }

        function handleVisitorCount() {
            if (isResetTimePassed()) {
                setVisitorCount(0); 
                setResetTime();      
            } else {
                const currentCount = getVisitorCount();
                setVisitorCount(currentCount + 1);  
            }
            updateVisitorCountDisplay();
        }

        function updateVisitorCountDisplay() {
            const count = getVisitorCount();
            document.getElementById('visitorCount').innerText = count;
        }

        function getFormattedDate() {
            const now = new Date();
            const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
            const dayOfWeek = daysOfWeek[now.getDay()];
            const day = now.getDate();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const milliseconds = now.getMilliseconds();
            const formattedDate = `${dayOfWeek}, ${day}/${month}/${year} ${hours}:${minutes}:${seconds}.${milliseconds}`;
            return formattedDate;
        }
        function updateClock() {
            document.getElementById('dateTime').innerText = getFormattedDate();
        }
        setInterval(updateClock, 1);
        handleVisitorCount();
        
        //==== GET IP
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('visitorIP').innerText = data.ip;
            })
            .catch(error => {
                document.getElementById('visitorIP').innerText = 'Tidak dapat mendeteksi IP';
                console.error('Error:', error);
            });

        //==== KECEPATAN JARINGAN
        var startTime;
        var downloadSize = 500000;
        var downloadUrl = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png";
        var image = new Image();
        var speedDisplayElement = document.getElementById('networkSpeed');
        var currentSpeed = 0;
        function measureNetworkSpeed() {
            startTime = (new Date()).getTime();
            image.src = downloadUrl + "?cacheBuster=" + startTime; 
        }
        function calculateSpeed(duration) {
            var bitsLoaded = downloadSize * 8; 
            var speedBps = (bitsLoaded / duration) * 1000;
            var speedKbps = speedBps / 1024; 
            var speedMbps = speedKbps / 1024; 
            if (speedKbps < 1024) {
                currentSpeed = speedKbps.toFixed(2) + " KB/0.5s";
            } else {
                currentSpeed = speedMbps.toFixed(2) + " MB/0.5s";
            }
            speedDisplayElement.innerText = currentSpeed;
        }
        function updateNetworkSpeed() {
            measureNetworkSpeed();
            image.onload = function() {
                var endTime = (new Date()).getTime(); 
                var duration = endTime - startTime;
                calculateSpeed(duration);
            };
            image.onerror = function() {
                speedDisplayElement.innerText = "Gagal mengukur kecepatan.";
            };
        }
        setInterval(updateNetworkSpeed, 500);

        //==== GET STATUS BATRAI 
        function updateBatteryStatus(battery) {
            const batteryPercentage = battery.level * 100;
            const chargingStatus = battery.charging ? "Sedang mengisi daya" : "Tidak sedang mengisi daya";
            document.getElementById('batteryStatus').innerHTML = `${batteryPercentage}%<br>Status:${chargingStatus}`;
        }
        if ('getBattery' in navigator) {
            navigator.getBattery().then(function(battery) {
                battery.addEventListener('levelchange', function() {
                    updateBatteryStatus(battery);
                });
                battery.addEventListener('chargingchange', function() {
                    updateBatteryStatus(battery);
                });
                setInterval(function() {
                    updateBatteryStatus(battery);
                }, 10);
            });
        } else {
            document.getElementById('batteryStatus').innerHTML = "Battery Status API tidak didukung di browser ini.";
        }





        //===== js fitur 

        function toggleDropdown(button) {
            const row = button.closest("tr");
            const dropdownContent = row.nextElementSibling;
      
            if (dropdownContent.style.display === "table-row") {
              dropdownContent.style.display = "none";
              button.querySelector("i").className = "fas fa-chevron-down";
            } else {
              dropdownContent.style.display = "table-row";
              button.querySelector("i").className = "fas fa-chevron-up";
            }
          }
      
          function copyText() {
              var text = "text yang akan di salin"; 
              var tempInput = document.createElement("input");
              document.body.appendChild(tempInput);
              tempInput.value = text;
              tempInput.select();
              document.execCommand('copy');
              document.body.removeChild(tempInput);
              alert("Teks telah disalin ke clipboard!");
            }
