const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');

  // Change icon and rotation
  if (menuToggle.classList.contains('active')) {
    menuToggle.classList.remove('active');
    menuToggle.classList.replace('fa-times', 'fa-bars');
  } else {
    menuToggle.classList.add('active');
    menuToggle.classList.replace('fa-bars', 'fa-times');
  }
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
  menuToggle.classList.remove('active');
  menuToggle.classList.replace('fa-times', 'fa-bars');
});

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

document.querySelectorAll('.toggle-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const allContents = document.querySelectorAll('.toggle-content');
    const currentContent = button.closest('.apis').querySelector('.toggle-content');

    allContents.forEach((content) => {
      if (content !== currentContent && content.classList.contains('open')) {
        content.classList.remove('open');
      }
    });
    currentContent.classList.toggle('open');

    if (currentContent.classList.contains('open')) {
      button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
      button.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll('.animated');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  });

  elements.forEach((el) => observer.observe(el));
});

particlesJS("particles-js", {
  particles: {
    number: {
      value: 350,
      density: {
        enable: true,
        value_area: 1500,
      },
    },
    color: {
      value: "#ADD8E6",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000",
      },
    },
    opacity: {
      value: 0.6,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 10,
      random: true,
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.6,
      width: 1,
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: true,
      straight: false,
      out_mode: "out",
      bounce: false,
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "grab",
      },
      onclick: {
        enable: true,
        mode: "push",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 150,
        line_linked: {
          opacity: 1,
        },
      },
      push: {
        particles_nb: 5,
      },
    },
  },
  retina_detect: true,
});

function copyToClipboard(button) {
  // Cari elemen textarea yang berada di atas tombol yang diklik
  const textarea = button.previousElementSibling;

  if (textarea) {
    const textToCopy = textarea.value;

    // Gunakan Clipboard API jika tersedia
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert('Teks berhasil disalin: ' + textToCopy);
        })
        .catch(err => {
          console.error('Gagal menyalin teks:', err);
          alert('Gagal menyalin teks.');
        });
    } else {
      // Fallback untuk browser lama
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      document.execCommand('copy');
      alert('Teks berhasil disalin: ' + textToCopy);
    }
  } else {
    alert('Tidak dapat menemukan teks untuk disalin.');
  }
}



  
