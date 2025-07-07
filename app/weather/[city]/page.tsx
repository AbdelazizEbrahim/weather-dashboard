"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  fetchWeather,
  toggleUnit,
  clearError,
} from "@/lib/features/weather/weatherSlice";
import type { RootState, AppDispatch } from "@/lib/store";
import { WeatherIcon } from "@/components/WeatherIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function CityWeatherPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { weather, loading, error, unit, cache, cacheOrder } = useSelector(
    (state: RootState) => state.weather
  );

  const city = params.city as string;
  const decodedCity = decodeURIComponent(city);

  useEffect(() => {
    if (decodedCity) {
      // Check if data is already cached and still valid
      const cityKey = decodedCity.toLowerCase();
      const cachedData = cache[cityKey];

      if (cachedData && Date.now() - cachedData.timestamp < 10 * 60 * 1000) {
        // Use cached data if it's less than 10 minutes old
        // Set the weather data from cache if it's not already set
        if (!weather || weather.name.toLowerCase() !== cityKey) {
          // We need to dispatch an action to set the weather from cache
          // For now, we'll still fetch to ensure consistency
          dispatch(fetchWeather(decodedCity));
        }
      } else {
        // Fetch new data if not cached or cache is expired
        dispatch(fetchWeather(decodedCity));
      }
    }
  }, [decodedCity, dispatch, cache, weather]);

  const handleBack = () => {
    dispatch(clearError());
    router.push("/");
  };

  const handleToggleUnit = () => {
    dispatch(toggleUnit());
  };

  const convertTemperature = (temp: number) => {
    if (unit === "fahrenheit") {
      return Math.round((temp * 9) / 5 + 32);
    }
    return Math.round(temp);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          error={error}
          onRetry={() => dispatch(fetchWeather(decodedCity))}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <p>No weather data available</p>
          <button
            onClick={handleBack}
            className="mt-4 text-white/80 hover:text-white">
            ← Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to search</span>
          </button>

          <button
            onClick={handleToggleUnit}
            className="flex items-center justify-between bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors space-x-4">
            {/* Celsius on the left */}
            <span
              className={`text-white font-semibold transition-opacity ${
                unit === "celsius" ? "opacity-100" : "opacity-50"
              }`}>
              °C
            </span>

            {/* Toggle Icon */}
            {unit === "celsius" ? (
              <ToggleLeft className="w-5 h-5 text-white" />
            ) : (
              <ToggleRight className="w-5 h-5 text-white" />
            )}

            {/* Fahrenheit on the right */}
            <span
              className={`text-white font-semibold transition-opacity ${
                unit === "fahrenheit" ? "opacity-100" : "opacity-50"
              }`}>
              °F
            </span>
          </button>
        </div>

        {/* Main Weather Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {weather.name}
            </h1>
            <p className="text-white/80 text-lg">{weather.sys.country}</p>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="text-center">
              <WeatherIcon condition={weather.weather[0].main} size={120} />
              <div className="text-6xl font-bold text-white mb-2">
                {convertTemperature(weather.main.temp)}°
                {unit === "celsius" ? "C" : "F"}
              </div>
              <p className="text-white/80 text-xl capitalize">
                {weather.weather[0].description}
              </p>
              <p className="text-white/60 text-sm mt-2">
                Feels like {convertTemperature(weather.main.feels_like)}°
                {unit === "celsius" ? "C" : "F"}
              </p>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Thermometer className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white/80 text-sm">Min/Max</p>
              <p className="text-white font-semibold">
                {convertTemperature(weather.main.temp_min)}° /{" "}
                {convertTemperature(weather.main.temp_max)}°
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Droplets className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white/80 text-sm">Humidity</p>
              <p className="text-white font-semibold">
                {weather.main.humidity}%
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Wind className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white/80 text-sm">Wind Speed</p>
              <p className="text-white font-semibold">
                {weather.wind.speed} m/s
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4 text-center">
              <Eye className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white/80 text-sm">Visibility</p>
              <p className="text-white font-semibold">
                {(weather.visibility / 1000).toFixed(1)} km
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">
                Atmospheric Pressure
              </h3>
              <p className="text-white/80">{weather.main.pressure} hPa</p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">Coordinates</h3>
              <p className="text-white/80">
                {weather.coord.lat.toFixed(2)}°, {weather.coord.lon.toFixed(2)}°
              </p>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-white/60 text-sm">
          Last updated: {new Date().toLocaleString()}
        </div>

        {/* Cache Status */}
        <div className="text-center text-white/50 text-xs mt-2">
          {cache[decodedCity.toLowerCase()] && (
            <span>Cached • {cacheOrder.length} cities stored</span>
          )}
        </div>
      </div>
    </div>
  );
}
