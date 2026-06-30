// Utilità geografiche: geocoding (città -> coordinate) e distanza.

// Geocoding con OpenStreetMap Nominatim.
async function geocodeCity(cityName) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
    const data = await (await fetch(url, { headers: { 'User-Agent': 'DevCards/1.0 (university-project)' } })).json();
    if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {
    console.error('Errore geocoding:', err);
  }
  return { lat: null, lon: null };
}

// Distanza Haversine in km (arrotondata).
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

module.exports = { geocodeCity, haversineDistance };
