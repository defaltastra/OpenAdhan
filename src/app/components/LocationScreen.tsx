import { useState, useEffect } from "react";
import { Search, MapPin, Star, ChevronRight, Trash2, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useLocations } from "../../backend/hooks";

interface SavedLocation {
  city: string;
  country: string;
  isFavorite: boolean;
}

export function LocationScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [manualCity, setManualCity] = useState("");
  
  // Backend hooks
  const { locations, activeLocation, saveLocation, setActive, deleteLocation: removeLocation } = useLocations();

  const savedLocations: SavedLocation[] = [
    { city: "New York", country: "United States", isFavorite: true },
    { city: "London", country: "United Kingdom", isFavorite: false },
    { city: "Dubai", country: "United Arab Emirates", isFavorite: false },
  ];

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "United Arab Emirates",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Oman",
    "Bahrain",
    "Egypt",
    "Morocco",
    "Algeria",
    "Tunisia",
    "Jordan",
    "Lebanon",
    "Syria",
    "Iraq",
    "Yemen",
    "Turkey",
    "Iran",
    "Afghanistan",
    "Indonesia",
    "Malaysia",
    "Singapore",
    "Brunei",
    "Pakistan",
    "Bangladesh",
    "India",
    "Sri Lanka",
    "Nigeria",
    "South Africa",
    "Kenya",
    "Somalia",
  ];

  const cities: Record<string, { name: string; lat: number; lon: number }[]> = {
    "United States": [
      { name: "New York", lat: 40.7128, lon: -74.0060 },
      { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
      { name: "Chicago", lat: 41.8781, lon: -87.6298 },
      { name: "Houston", lat: 29.7604, lon: -95.3698 },
      { name: "Phoenix", lat: 33.4484, lon: -112.0740 },
      { name: "Philadelphia", lat: 39.9526, lon: -75.1652 },
      { name: "Detroit", lat: 42.3314, lon: -83.0458 },
    ],
    "United Kingdom": [
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "Birmingham", lat: 52.4862, lon: -1.8904 },
      { name: "Manchester", lat: 53.4808, lon: -2.2426 },
      { name: "Leeds", lat: 53.8008, lon: -1.5491 },
      { name: "Glasgow", lat: 55.8642, lon: -4.2518 },
      { name: "Bradford", lat: 53.7960, lon: -1.7594 },
    ],
    "Canada": [
      { name: "Toronto", lat: 43.6532, lon: -79.3832 },
      { name: "Montreal", lat: 45.5017, lon: -73.5673 },
      { name: "Vancouver", lat: 49.2827, lon: -123.1207 },
      { name: "Calgary", lat: 51.0447, lon: -114.0719 },
      { name: "Ottawa", lat: 45.4215, lon: -75.6972 },
    ],
    "Australia": [
      { name: "Sydney", lat: -33.8688, lon: 151.2093 },
      { name: "Melbourne", lat: -37.8136, lon: 144.9631 },
      { name: "Brisbane", lat: -27.4698, lon: 153.0251 },
      { name: "Perth", lat: -31.9505, lon: 115.8605 },
    ],
    "Germany": [
      { name: "Berlin", lat: 52.5200, lon: 13.4050 },
      { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
      { name: "Munich", lat: 48.1351, lon: 11.5820 },
      { name: "Cologne", lat: 50.9375, lon: 6.9603 },
    ],
    "France": [
      { name: "Paris", lat: 48.8566, lon: 2.3522 },
      { name: "Marseille", lat: 43.2965, lon: 5.3698 },
      { name: "Lyon", lat: 45.7640, lon: 4.8357 },
      { name: "Nice", lat: 43.7102, lon: 7.2620 },
    ],
    "Netherlands": [
      { name: "Amsterdam", lat: 52.3676, lon: 4.9041 },
      { name: "Rotterdam", lat: 51.9225, lon: 4.4792 },
      { name: "The Hague", lat: 52.0705, lon: 4.3007 },
    ],
    "Belgium": [
      { name: "Brussels", lat: 50.8503, lon: 4.3517 },
      { name: "Antwerp", lat: 51.2194, lon: 4.4025 },
    ],
    "Sweden": [
      { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
      { name: "Gothenburg", lat: 57.7089, lon: 11.9746 },
      { name: "Malmö", lat: 55.6050, lon: 13.0038 },
    ],
    "Norway": [
      { name: "Oslo", lat: 59.9139, lon: 10.7522 },
      { name: "Bergen", lat: 60.3913, lon: 5.3221 },
    ],
    "United Arab Emirates": [
      { name: "Dubai", lat: 25.2048, lon: 55.2708 },
      { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773 },
      { name: "Sharjah", lat: 25.3463, lon: 55.4209 },
      { name: "Ajman", lat: 25.4052, lon: 55.5137 },
    ],
    "Saudi Arabia": [
      { name: "Mecca", lat: 21.4225, lon: 39.8262 },
      { name: "Medina", lat: 24.5247, lon: 39.5692 },
      { name: "Riyadh", lat: 24.7136, lon: 46.6753 },
      { name: "Jeddah", lat: 21.5433, lon: 39.1728 },
      { name: "Dammam", lat: 26.4207, lon: 50.0888 },
    ],
    "Qatar": [
      { name: "Doha", lat: 25.2854, lon: 51.5310 },
    ],
    "Kuwait": [
      { name: "Kuwait City", lat: 29.3759, lon: 47.9774 },
    ],
    "Oman": [
      { name: "Muscat", lat: 23.5880, lon: 58.3829 },
    ],
    "Bahrain": [
      { name: "Manama", lat: 26.2285, lon: 50.5860 },
    ],
    "Egypt": [
      { name: "Cairo", lat: 30.0444, lon: 31.2357 },
      { name: "Alexandria", lat: 31.2001, lon: 29.9187 },
      { name: "Giza", lat: 30.0131, lon: 31.2089 },
      { name: "Luxor", lat: 25.6872, lon: 32.6396 },
    ],
    "Morocco": [
      { name: "Casablanca", lat: 33.5731, lon: -7.5898 },
      { name: "Rabat", lat: 34.0209, lon: -6.8416 },
      { name: "Marrakech", lat: 31.6295, lon: -7.9811 },
    ],
    "Algeria": [
      { name: "Algiers", lat: 36.7538, lon: 3.0588 },
      { name: "Oran", lat: 35.6969, lon: -0.6331 },
    ],
    "Tunisia": [
      { name: "Tunis", lat: 36.8065, lon: 10.1815 },
    ],
    "Jordan": [
      { name: "Amman", lat: 31.9454, lon: 35.9284 },
    ],
    "Lebanon": [
      { name: "Beirut", lat: 33.8886, lon: 35.4955 },
    ],
    "Syria": [
      { name: "Damascus", lat: 33.5138, lon: 36.2765 },
      { name: "Aleppo", lat: 36.2021, lon: 37.1343 },
    ],
    "Iraq": [
      { name: "Baghdad", lat: 33.3152, lon: 44.3661 },
      { name: "Basra", lat: 30.5085, lon: 47.7835 },
    ],
    "Yemen": [
      { name: "Sanaa", lat: 15.3694, lon: 44.1910 },
      { name: "Aden", lat: 12.7855, lon: 45.0187 },
    ],
    "Turkey": [
      { name: "Istanbul", lat: 41.0082, lon: 28.9784 },
      { name: "Ankara", lat: 39.9334, lon: 32.8597 },
      { name: "Izmir", lat: 38.4192, lon: 27.1287 },
      { name: "Bursa", lat: 40.1826, lon: 29.0665 },
    ],
    "Iran": [
      { name: "Tehran", lat: 35.6892, lon: 51.3890 },
      { name: "Mashhad", lat: 36.2974, lon: 59.6067 },
      { name: "Isfahan", lat: 32.6546, lon: 51.6680 },
    ],
    "Afghanistan": [
      { name: "Kabul", lat: 34.5553, lon: 69.2075 },
    ],
    "Indonesia": [
      { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
      { name: "Surabaya", lat: -7.2575, lon: 112.7521 },
      { name: "Bandung", lat: -6.9175, lon: 107.6191 },
      { name: "Medan", lat: 3.5952, lon: 98.6722 },
    ],
    "Malaysia": [
      { name: "Kuala Lumpur", lat: 3.1390, lon: 101.6869 },
      { name: "George Town", lat: 5.4141, lon: 100.3288 },
      { name: "Johor Bahru", lat: 1.4927, lon: 103.7414 },
    ],
    "Singapore": [
      { name: "Singapore", lat: 1.3521, lon: 103.8198 },
    ],
    "Brunei": [
      { name: "Bandar Seri Begawan", lat: 4.9031, lon: 114.9398 },
    ],
    "Pakistan": [
      { name: "Karachi", lat: 24.8607, lon: 67.0011 },
      { name: "Lahore", lat: 31.5204, lon: 74.3587 },
      { name: "Islamabad", lat: 33.6844, lon: 73.0479 },
      { name: "Faisalabad", lat: 31.4504, lon: 73.1350 },
    ],
    "Bangladesh": [
      { name: "Dhaka", lat: 23.8103, lon: 90.4125 },
      { name: "Chittagong", lat: 22.3569, lon: 91.7832 },
      { name: "Khulna", lat: 22.8456, lon: 89.5403 },
    ],
    "India": [
      { name: "New Delhi", lat: 28.6139, lon: 77.2090 },
      { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
      { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
      { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
    ],
    "Sri Lanka": [
      { name: "Colombo", lat: 6.9271, lon: 79.8612 },
    ],
    "Nigeria": [
      { name: "Lagos", lat: 6.5244, lon: 3.3792 },
      { name: "Abuja", lat: 9.0765, lon: 7.3986 },
      { name: "Kano", lat: 12.0022, lon: 8.5920 },
    ],
    "South Africa": [
      { name: "Johannesburg", lat: -26.2041, lon: 28.0473 },
      { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
      { name: "Durban", lat: -29.8587, lon: 31.0218 },
    ],
    "Kenya": [
      { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
      { name: "Mombasa", lat: -4.0435, lon: 39.6682 },
    ],
    "Somalia": [
      { name: "Mogadishu", lat: 2.0469, lon: 45.3182 },
    ],
  };

  const handleCitySelect = async (cityData: { name: string; lat: number; lon: number }) => {
    try {
      await saveLocation({
        city: cityData.name,
        country: selectedCountry,
        latitude: cityData.lat,
        longitude: cityData.lon,
        isActive: true,
      });
      setShowCities(false);
      setSelectedCountry("");
      alert(`Location set to ${cityData.name}, ${selectedCountry}`);
    } catch (error) {
      console.error("Failed to save location:", error);
      alert("Failed to save location. Please try again.");
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await setActive(id);
    } catch (error) {
      console.error("Failed to set active location:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeLocation(id);
    } catch (error) {
      console.error("Failed to delete location:", error);
    }
  };

  // Filter countries and cities based on search
  const filteredCountries = countries.filter(country =>
    country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = selectedCountry && cities[selectedCountry as keyof typeof cities]
    ? cities[selectedCountry as keyof typeof cities].filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-full px-5 py-6 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Location</h1>
        <p className="text-muted-foreground text-sm">
          Choose your location for accurate prayer times
        </p>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-card rounded-2xl border-border"
          />
        </div>
      </div>

      {/* Country Selection */}
      {!showCities && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <h3 className="text-sm text-muted-foreground mb-3">Select Country</h3>
          <div className="space-y-2">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCities(true);
                  }}
                  className="w-full bg-card rounded-2xl p-4 flex items-center justify-between hover:bg-secondary transition-colors shadow-sm"
                >
                  <span className="font-medium">{country}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))
            ) : (
              <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
                <p className="text-muted-foreground">No countries found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* City Selection */}
      {showCities && selectedCountry && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-muted-foreground">
              Cities in {selectedCountry}
            </h3>
            <button
              onClick={() => setShowCities(false)}
              className="text-sm text-primary hover:underline"
            >
              Back
            </button>
          </div>
          <div className="space-y-2">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className="w-full bg-card rounded-2xl p-4 flex items-center justify-between hover:bg-secondary transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <span className="font-medium block">{city.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    Select
                  </Button>
                </button>
              ))
            ) : (
              <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No cities found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Saved Locations */}
      <div className="mb-6">
        <h3 className="text-sm text-muted-foreground mb-3">Saved Locations</h3>
        {locations.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No saved locations yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a location above to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {locations.map((location) => (
              <div
                key={location.id}
                className={`bg-card rounded-2xl p-4 flex items-center justify-between shadow-sm ${
                  location.isActive ? "ring-2 ring-primary" : ""
                }`}
              >
                <button
                  onClick={() => location.id && handleSetActive(location.id)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    location.isActive ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  }`}>
                    <MapPin className={`w-5 h-5 ${location.isActive ? "" : "text-primary"}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{location.city}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.country}
                      {location.isActive && " • Active"}
                    </p>
                  </div>
                </button>
                {!location.isActive && location.id && (
                  <button
                    onClick={() => handleDelete(location.id!)}
                    className="p-2 hover:bg-destructive/10 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPS Info */}
      <div className="mt-8 p-4 bg-card rounded-2xl border border-border">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-1" />
          <div>
            <p className="text-sm font-medium mb-1">GPS Location</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For privacy, GPS is optional. You can manually select your location
              for accurate prayer times without sharing your exact coordinates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
