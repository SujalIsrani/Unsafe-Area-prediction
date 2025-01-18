// Add this at the very top of your script.js
if ("Notification" in window) {
    Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            console.log("Notification permission granted");
        }
    });
}

// Initialize alert flag
window.alerted = false;

// Initialize the map centered on Mumbai.
const map = L.map('map').setView([19.0760, 72.8777], 13);

// Load map tiles from OpenStreetMap.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// Fetch and parse the CSV file for unsafe locations.
fetch('RandomLocations.csv')
    .then(response => response.text())
    .then(data => {
        const locations = parseCSV(data);
        plotUnsafeMarkers(locations);
    })
    .catch(error => console.error('Error loading CSV:', error));

    fetch('clustered_locations.csv')  // Update this line in your existing code
    .then(response => response.text())
    .then(data => {
        const locations = parseCSV(data);
        plotUnsafeMarkers(locations);
    })
    .catch(error => console.error('Error loading CSV:', error));

// Parse CSV data to extract valid latitude/longitude pairs and other parameters.
function parseCSV(data) {
    const rows = data.trim().split('\n').slice(1); // Skip header
    return rows.map(row => {
        const [latitude, longitude, region, lighting, openness, visibility, publicTransport, security, people, safetyScore] = row.split(',');
        return {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
            region,
            lighting,
            openness,
            visibility,
            publicTransport,
            security,
            people,
            safetyScore: parseFloat(safetyScore)
        };
    });
}

// Plot circle markers for unsafe locations with safety score and popup.
// ... (previous code remains the same) ...

// Plot circle markers for unsafe locations with safety score and popup.
function plotUnsafeMarkers(locations) {
    // Clear existing clusters control if it exists
    if (window.clustersControl) {
        map.removeControl(window.clustersControl);
    }

    // Store markers by cluster
    window.markersByCluster = {};
    
    // Clear existing markers
    map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Keep track of currently open popup
    let currentPopup = null;

    // Add map click handler to close popup when clicking outside
    map.on('click', function(e) {
        // Check if the click was on a marker
        const clickedOnMarker = e.originalEvent.target && 
            (e.originalEvent.target.classList.contains('leaflet-interactive') ||
             e.originalEvent.target.closest('.leaflet-popup'));
        
        // If click was not on a marker or popup, close current popup
        if (!clickedOnMarker && currentPopup) {
            map.closePopup(currentPopup);
            currentPopup = null;
        }
    });

    locations.forEach(loc => {
        // Create the circle marker with click handler
        const marker = L.circleMarker([loc.lat, loc.lng], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.8,
            radius: 12,
            weight: 2
        }).addTo(map);

        // Create popup content with detailed information
        const popupContent = `
            <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0; color: #333;">Area Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td><strong>Region:</strong></td>
                        <td>${loc.region || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Lighting:</strong></td>
                        <td>${loc.lighting}</td>
                    </tr>
                    <tr>
                        <td><strong>Openness:</strong></td>
                        <td>${loc.openness}</td>
                    </tr>
                    <tr>
                        <td><strong>Visibility:</strong></td>
                        <td>${loc.visibility}</td>
                    </tr>
                    <tr>
                        <td><strong>Public Transport:</strong></td>
                        <td>${loc.publicTransport}</td>
                    </tr>
                    <tr>
                        <td><strong>Security:</strong></td>
                        <td>${loc.security}</td>
                    </tr>
                    <tr>
                        <td><strong>People:</strong></td>
                        <td>${loc.people}</td>
                    </tr>
                    <tr>
                        <td><strong>Safety Score:</strong></td>
                        <td>${loc.safetyScore.toFixed(1)}</td>
                    </tr>
                </table>
            </div>
        `;

        // Create a popup
        const popup = L.popup({
            offset: [0, -10],
            closeButton: true,
            closeOnClick: false,
            className: 'custom-popup',
            maxWidth: 300,
            minWidth: 250,
            autoPan: true
        }).setContent(popupContent);

        // Bind click event to marker
        marker.on('click', function(e) {
            // If there's already an open popup, close it
            if (currentPopup && currentPopup !== popup) {
                map.closePopup(currentPopup);
            }

            // Open the new popup and store reference
            this.bindPopup(popup).openPopup();
            currentPopup = popup;
            
            // Stop event propagation to prevent map click handler
            L.DomEvent.stopPropagation(e);
            
            // Visual feedback
            this.setStyle({
                fillOpacity: 1,
                radius: 14
            });
            
            // Reset style after brief delay
            setTimeout(() => {
                this.setStyle({
                    fillOpacity: 0.8,
                    radius: 12
                });
            }, 200);
        });

        // Add popup close event handler
        popup.on('close', function() {
            if (currentPopup === popup) {
                currentPopup = null;
            }
        });

        // Add safety score label
        const safetyLabel = L.divIcon({
            className: 'safety-score',
            html: `<div style="text-align: center; line-height: 24px;">${loc.safetyScore.toFixed(1)}</div>`,
            iconSize: [24, 24]
        });
        
        L.marker([loc.lat, loc.lng], { 
            icon: safetyLabel,
            interactive: false // Prevent the label from interfering with clicks
        }).addTo(map);

        // Store marker by cluster if clustering is enabled
        if (loc.cluster !== undefined) {
            if (!window.markersByCluster[loc.cluster]) {
                window.markersByCluster[loc.cluster] = [];
            }
            window.markersByCluster[loc.cluster].push(marker);
        }
    });

    // Create clusters control
    createClustersControl();

    // Add CSS to head if not already added
    if (!document.getElementById('marker-styles')) {
        const style = document.createElement('style');
        style.id = 'marker-styles';
        style.textContent = `
            .custom-popup .leaflet-popup-content-wrapper {
                background: white;
                border-radius: 8px;
                box-shadow: 0 3px 14px rgba(0,0,0,0.4);
            }
            .custom-popup .leaflet-popup-content {
                margin: 0;
                padding: 0;
            }
            .custom-popup table td {
                padding: 4px 8px;
                border-bottom: 1px solid #eee;
            }
            .custom-popup table tr:last-child td {
                border-bottom: none;
            }
            .leaflet-popup-content-wrapper {
                transition: opacity 0.3s ease;
            }
            .leaflet-popup-close-button {
                padding: 8px !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// ... (rest of the code remains the same) ...

// Get user's current location and mark it on the map.
navigator.geolocation.getCurrentPosition(
    position => {
        const { latitude, longitude } = position.coords;

        // Mark the user's location on the map.
        const userMarker = L.marker([latitude, longitude]).addTo(map)
            .bindPopup('You are here').openPopup();

        // Check if the user is in an unsafe area.
        checkIfInUnsafeArea(latitude, longitude);

        // Find and display the nearest help services.
        findNearbyServices(latitude, longitude);

        // Start tracking user's location
        trackUserLocation(userMarker);
    },
    () => alert('Unable to access your location!')
);

// Check if the user is in an unsafe area.
// Check if the user is in an unsafe area and display notifications.
// Check if the user is in an unsafe area and display notifications.
function checkIfInUnsafeArea(userLat, userLng) {
    let inUnsafeArea = false;
    let nearUnsafeArea = false;

    map.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            const distance = map.distance(layer.getLatLng(), [userLat, userLng]);
            if (distance <= 100) { // 100 meters
                inUnsafeArea = true;
            } else if (distance <= 1000) { // 1 kilometers
                nearUnsafeArea = true;
            }
        }
    });

    // Update status text
    const statusElement = document.getElementById('status');
    if (inUnsafeArea) {
        statusElement.textContent = 'Warning: You are in an Unsafe Area!';
        statusElement.style.color = 'red';
        if (Notification.permission === "granted") {
            new Notification("Safety Alert", {
                body: "You are in an unsafe area!",
                icon: "/path/to/your/icon.png"
            });
        }
    } else if (nearUnsafeArea) {
        statusElement.textContent = 'Warning: You are near an Unsafe Area!';
        statusElement.style.color = 'orange';
        if (Notification.permission === "granted") {
            new Notification("Safety Alert", {
                body: "You are near an unsafe area!",
                icon: "/path/to/your/icon.png"
            });
        }
    } else {
        statusElement.textContent = 'You are in a Safe Area';
        statusElement.style.color = 'green';
    }
}



// Find and display the nearest services (hospital, police, public transport).
function findNearbyServices(lat, lng) {
    const query = `[out:json];
    (
      node["amenity"="police"](around:5000, ${lat}, ${lng});
      node["amenity"="hospital"](around:5000, ${lat}, ${lng});
      node["amenity"="taxi"](around:5000, ${lat}, ${lng});
      node["bus"="yes"](around:5000, ${lat}, ${lng});
      node["public_transport"="platform"](around:5000, ${lat}, ${lng});
    );
    out;`;

    fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            displayNearestServices(data.elements, lat, lng);
        })
        .catch(error => console.error('Error fetching nearby services:', error));
}

// Identify transport modes and display the nearest services in the panel.
function displayNearestServices(services, userLat, userLng) {
    const list = document.getElementById('services-list');
    list.innerHTML = ''; // Clear previous content

    const nearest = { police: null, hospital: null, taxi: null, transport: null };

    services.forEach(service => {
        const { lat, lon, tags } = service;
        const distance = map.distance([userLat, userLng], [lat, lon]);

        if (tags.amenity === 'police' && (!nearest.police || distance < nearest.police.distance)) {
            nearest.police = { name: tags.name || 'Police Station', distance, lat, lon };
        } else if (tags.amenity === 'hospital' && (!nearest.hospital || distance < nearest.hospital.distance)) {
            nearest.hospital = { name: tags.name || 'Unnamed Hospital', distance, lat, lon };
        } else if (tags.amenity === 'taxi' && (!nearest.taxi || distance < nearest.taxi.distance)) {
            nearest.taxi = { name: tags.name || 'Unnamed Taxi Stand', distance, lat, lon };
        } else if (tags.public_transport && (!nearest.transport || distance < nearest.transport.distance)) {
            nearest.transport = { name: 'Public Transport', distance, lat, lon };
        }
    });

    for (const [key, service] of Object.entries(nearest)) {
        if (service) {
            const li = document.createElement('li');
            li.innerHTML = `<span class="service-type">${service.name}</span> - 
                           <span class="service-distance">${(service.distance / 1000).toFixed(2)} km away</span>`;
            const link = document.createElement('a');
            link.href = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lon}`;
            link.target = '_blank';
            link.textContent = 'Get Directions';
            link.classList.add('get-directions');
            li.appendChild(link);
            list.appendChild(li);
        }
    }
}

// Function to track user's real-time location.
function trackUserLocation(userMarker) {
    navigator.geolocation.watchPosition(position => {
        const { latitude, longitude } = position.coords;
        userMarker.setLatLng([latitude, longitude]);
        map.setView([latitude, longitude]); // Center map on user's location
        checkIfInUnsafeArea(latitude, longitude); // Check unsafe areas continuously
    });
}

// Show add unsafe area form on button click.
document.getElementById('add-unsafe-area-btn').addEventListener('click', () => {
    const form = document.getElementById('add-unsafe-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

// Submit the unsafe area data and save to CSV
document.getElementById('submit-unsafe-area').addEventListener('click', (e) => {
    e.preventDefault();
    const regionName = document.getElementById('region-name').value;
    const latitude = parseFloat(document.getElementById('latitude').value);
    const longitude = parseFloat(document.getElementById('longitude').value);

    if (regionName && !isNaN(latitude) && !isNaN(longitude)) {
        saveUnsafeArea(regionName, latitude, longitude);
    } else {
        alert('Please fill in all required fields correctly.');
    }
});

// Save the unsafe area to the CSV file
function saveUnsafeArea(regionName, latitude, longitude) {
    const lighting = document.getElementById('lighting').value;
    const openness = document.getElementById('openness').value;
    const visibility = document.getElementById('visibility').value;
    const publicTransport = document.getElementById('public-transport').value;
    const security = document.getElementById('security').value;
    const people = document.getElementById('people').value;
    const safetyScore = document.getElementById('safety-score').value;

    const csvData = `${latitude},${longitude},${regionName},${lighting},${openness},${visibility},${publicTransport},${security},${people},${safetyScore}\n`;
    
    // Here you would typically send the data to your server to be saved to CSV
    // For demo purposes, we'll log it to console
    console.log('Saving to CSV:', csvData);

    // Add the new unsafe area to the map
    const newLocation = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        region: regionName,
        lighting,
        openness,
        visibility,
        publicTransport,
        security,
        people,
        safetyScore: parseFloat(safetyScore)
    };
    plotUnsafeMarkers([newLocation]);

    // Clear the form
    document.getElementById('add-unsafe-form').reset();
    
    // Hide the form after submission
    document.getElementById('add-unsafe-form').style.display = 'none';
}

// Function to load the CSV data
function loadCSV() {
    fetch('RandomLocations.csv')
        .then(response => response.text())
        .then(data => {
            const locations = parseCSV(data);
            plotUnsafeMarkers(locations);
        })
        .catch(error => console.error('Error loading CSV:', error));
}

// Call loadCSV when the page loads
loadCSV();

// You might want to add a function to reload the CSV data periodically or on user action
function reloadData() {
    // Clear existing markers (you'll need to keep track of them)
    // map.eachLayer((layer) => {
    //     if (layer instanceof L.CircleMarker) {
    //         map.removeLayer(layer);
    //     }
    // });

    // Reload the CSV data
    loadCSV();
}

// Example: Reload data every 5 minutes
// setInterval(reloadData, 300000);

// Or add a reload button
// document.getElementById('reload-btn').addEventListener('click', reloadData);

// Function to perform K-means clustering
function updateClusters() {
    // Clear previous markers
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    // Prepare data for K-means clustering
    const data = unsafeAreas.map(area => [area.latitude, area.longitude]);

    // Specify number of clusters
    const numClusters = 3; // Change this based on your needs

    // Perform K-means clustering
    const kmeans = ml5.kmeans(data, numClusters, modelReady);

    function modelReady() {
        // Once the model is ready, get the labels
        const labels = kmeans.getLabels();

        // Assign labels back to unsafeAreas for visualization
        unsafeAreas.forEach((area, index) => {
            area.cluster = labels[index];
        });

        // Display clusters on the map
        displayClusters();
    }
}

// Function to display clusters
function displayClusters() {
    const colors = ['#FF5733', '#33FF57', '#3357FF']; // Colors for clusters

    // Create markers for each unsafe area with cluster colors
    unsafeAreas.forEach(area => {
        const color = colors[area.cluster % colors.length]; // Ensure color index is valid
        L.circleMarker([area.latitude, area.longitude], {
            radius: 8,
            fillColor: color,
            color: color,
            fillOpacity: 0.6,
            stroke: false
        }).addTo(map).bindPopup(`Region: ${area.regionName}<br>Safety Score: ${area.safetyScore}<br>Lighting: ${area.lighting}<br>Visibility: ${area.visibility}`);
    });

    // Update clusters summary
    updateClustersSummary();
}

// Function to update clusters summary
function updateClustersSummary() {
    const clusterCounts = {};
    unsafeAreas.forEach(area => {
        if (!clusterCounts[area.cluster]) {
            clusterCounts[area.cluster] = 0;
        }
        clusterCounts[area.cluster]++;
    });

    const summaryDiv = document.getElementById('clusters-summary');
    summaryDiv.innerHTML = `<h4>Cluster Summary:</h4>`;
    for (const cluster in clusterCounts) {
        summaryDiv.innerHTML += `<p>Cluster ${cluster}: ${clusterCounts[cluster]} areas</p>`;
    }
}

// Initialize the map with existing unsafe areas
updateClusters();

