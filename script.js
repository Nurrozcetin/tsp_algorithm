const map = L.map('map').setView([38.4237, 27.1428], 11); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let startPoint = null; 
let endPoint = null;   
const selectedPoints = [];
let numPoints = 0;
let stage = 'start'; 


const pointForm = document.getElementById('pointForm');
pointForm.addEventListener('submit', (e) => {
    e.preventDefault();
    numPoints = parseInt(document.getElementById('numPoints').value, 10);
});

map.on('click', (e) => {
    const { lat, lng } = e.latlng;

    if (stage === 'start') {
        startPoint = [lat, lng];
        L.marker(startPoint).addTo(map).bindPopup("Kaynak Noktası").openPopup();
        stage = 'end';
    } else if (stage === 'end') {
        endPoint = [lat, lng];
        L.marker(endPoint).addTo(map).bindPopup("Hedef Noktası").openPopup();
        stage = 'waypoints';
    } else if (stage === 'waypoints' && selectedPoints.length < numPoints) {
        selectedPoints.push([lat, lng]);
        L.marker([lat, lng]).addTo(map).bindPopup(`Ara Nokta ${selectedPoints.length}`).openPopup();
        if (selectedPoints.length === numPoints) {
            calculateRoute();
        }
    } else if (stage === 'waypoints') {
    }
});

function calculateDistance(coord1, coord2) {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(coord2[0] - coord1[0]);
    const dLon = toRad(coord2[1] - coord1[1]);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1[0])) *
        Math.cos(toRad(coord2[0])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function calculateRoute() {
    const points = [startPoint, ...selectedPoints, endPoint];
    const route = [startPoint];
    let totalDistance = 0;
    let currentPoint = startPoint;
    const remainingPoints = [...selectedPoints, endPoint];

    while (remainingPoints.length) {
        let nearestPoint = null;
        let shortestDistance = Infinity;

        remainingPoints.forEach((point) => {
        const distance = calculateDistance(currentPoint, point);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestPoint = point;
        }
        });

        totalDistance += shortestDistance;
        currentPoint = nearestPoint;
        route.push(nearestPoint);
        remainingPoints.splice(remainingPoints.indexOf(nearestPoint), 1);
    }

    displayRoute(route, totalDistance);
}

function displayRoute(route, totalDistance) {
    const routeList = document.getElementById('routeList');
    routeList.innerHTML = '';
    route.forEach((point, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. Nokta: [${point[0].toFixed(4)}, ${point[1].toFixed(4)}]`;
        routeList.appendChild(li);
    });

    document.getElementById('totalDistance').textContent = `Toplam Mesafe: ${totalDistance.toFixed(2)} km`;

    L.polyline(route, { color: 'blue' }).addTo(map);
}
