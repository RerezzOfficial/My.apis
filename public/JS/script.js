// script.js
document.getElementById('changeColorBtn').addEventListener('click', function() {
    document.body.style.backgroundColor = document.body.style.backgroundColor === 'lightgray' ? '#f4f4f4' : 'lightgray';
});

        // Get battery status
        navigator.getBattery().then(function(battery) {
            const batteryStatus = document.getElementById('battery-status');
            batteryStatus.textContent = `Baterai: ${Math.round(battery.level * 100)}%`;
        });

        // Get IP address
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                document.getElementById('ip-address').textContent = `IP Address: ${data.ip}`;
            });
                        
