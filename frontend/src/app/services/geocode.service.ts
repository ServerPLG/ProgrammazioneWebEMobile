import { Injectable } from '@angular/core';

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  city: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodeService {
  private readonly headers = { 'User-Agent': 'DevCards/1.0' };

  async search(query: string): Promise<GeoResult | null> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    try {
      const res = await fetch(url, { headers: this.headers });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          displayName: data[0].display_name,
          city: '',
        };
      }
    } catch (err) {
      console.error('Errore geocoding:', err);
    }
    return null;
  }

  async reverse(lat: number, lon: number): Promise<GeoResult | null> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const res = await fetch(url, { headers: this.headers });
      const data = await res.json();
      const address = data?.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        '';
      return {
        lat,
        lon,
        displayName: data?.display_name || 'Posizione selezionata',
        city,
      };
    } catch (err) {
      console.error('Errore reverse geocode:', err);
    }
    return null;
  }
}
