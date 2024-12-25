
    function toggleTheme() {
      const body = document.body;
      const currentTheme = body.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", newTheme);

      const themeIcon = document.getElementById("theme-icon");
      themeIcon.className = newTheme === "dark" ? "fas fa-moon theme-toggle" : "fas fa-sun theme-toggle";
    }

    function copyText() {
      const textarea = document.querySelector("textarea");
      textarea.select();
      document.execCommand("copy");
      alert("Teks telah disalin!");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".header, .proj, .proj2").forEach((element) => {
      observer.observe(element);
    });
  
    fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('ip-address').textContent = `IP Address: ${data.ip}`;
            });
    navigator.getBattery().then(function(battery) {
            const batteryStatus = document.getElementById('battery-status');
            batteryStatus.textContent = `Baterai: ${Math.round(battery.level * 100)}%`;
        });
  
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0'); 
  const seconds = String(now.getSeconds()).padStart(2, '0'); 
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); 

  document.getElementById('clock').textContent = `${hours} : ${minutes} : ${seconds} : ${milliseconds}`;
}

setInterval(updateClock, 100);

updateClock();

  
function updateDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0'); 
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  // Format tanggal: DD-MM-YYYY
  document.getElementById('date').textContent = `${day} - ${month} - ${year}`;
}

updateDate();
  
function detectDeviceDetails() {
  const userAgent = navigator.userAgent.toLowerCase();
  let deviceInfo = 'Perangkat tidak terdeteksi';

  if (/android/i.test(userAgent)) {
    deviceInfo = 'Perangkat Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    deviceInfo = 'Perangkat iOS (iPhone, iPad, iPod)';
  } else if (/windows nt/i.test(userAgent)) {
    deviceInfo = 'Perangkat Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    deviceInfo = 'Perangkat macOS';
  } else if (/linux/i.test(userAgent)) {
    deviceInfo = 'Perangkat Linux';
  }

  document.getElementById('device').textContent = `${deviceInfo}`;
}

detectDeviceDetails();

  
function detectConnection() {
  if (navigator.connection) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const type = connection.effectiveType; // Jenis koneksi seperti 4g, 3g, wifi
    document.getElementById('connection').textContent = `${type}`;
  } else {
    document.getElementById('connection').textContent = "Informasi koneksi tidak tersedia.";
  }
}

detectConnection();

  
  function detectScreen() {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const screenResolution = `${screenWidth}x${screenHeight}`;
  document.getElementById('screen').textContent = `${screenResolution}`;
}

detectScreen();
  
 
    fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    const ip = data.ip;

    fetch(`http://api.ipstack.com/${ip}?access_key=YOUR_ACCESS_KEY`)
      .then(response => response.json())
      .then(locationData => {
        const lat = locationData.latitude;
        const lon = locationData.longitude;

        const googleMapsLink = `https://www.google.com/maps?q=${lat},${lon}`;
        document.getElementById('location-link').href = googleMapsLink;
        document.getElementById('location-link').textContent = "Lihat di Google Maps";
      })
      .catch(error => {
        console.error('Error getting geolocation:', error);
      });
  })
  .catch(error => {
    console.error('Error getting IP:', error);
  });




  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");
  const content = document.querySelector('.content');
  
  toggleBtn.addEventListener("click", () => {
    if (sidebar.style.left === "-320px") {
      sidebar.style.left = "0";
    } else {
      sidebar.style.left = "-320px";
    }
  });
  
  // Menutup sidebar ketika mengklik di luar sidebar
  document.addEventListener("click", (event) => {
    if (!sidebar.contains(event.target) && event.target !== toggleBtn) {
      sidebar.style.left = "-320px";  // Menutup sidebar
    }
  });
  
