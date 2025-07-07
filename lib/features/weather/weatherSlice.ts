import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Mock weather data for different cities
const mockWeatherData: Record<string, any> = {
  london: {
    coord: { lon: -0.1257, lat: 51.5085 },
    weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
    main: {
      temp: 22,
      feels_like: 24,
      temp_min: 18,
      temp_max: 26,
      pressure: 1013,
      humidity: 65,
    },
    visibility: 10000,
    wind: { speed: 3.5, deg: 230 },
    sys: { country: "GB" },
    name: "London",
  },
  "new york": {
    coord: { lon: -74.006, lat: 40.7143 },
    weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }],
    main: {
      temp: 18,
      feels_like: 20,
      temp_min: 15,
      temp_max: 22,
      pressure: 1015,
      humidity: 72,
    },
    visibility: 8000,
    wind: { speed: 4.2, deg: 180 },
    sys: { country: "US" },
    name: "New York",
  },
  tokyo: {
    coord: { lon: 139.6917, lat: 35.6895 },
    weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
    main: {
      temp: 25,
      feels_like: 28,
      temp_min: 22,
      temp_max: 28,
      pressure: 1008,
      humidity: 85,
    },
    visibility: 6000,
    wind: { speed: 2.8, deg: 90 },
    sys: { country: "JP" },
    name: "Tokyo",
  },
  paris: {
    coord: { lon: 2.3488, lat: 48.8534 },
    weather: [{ id: 803, main: "Clouds", description: "broken clouds", icon: "04d" }],
    main: {
      temp: 19,
      feels_like: 21,
      temp_min: 16,
      temp_max: 23,
      pressure: 1012,
      humidity: 68,
    },
    visibility: 9000,
    wind: { speed: 3.1, deg: 270 },
    sys: { country: "FR" },
    name: "Paris",
  },
  sydney: {
    coord: { lon: 151.2073, lat: -33.8678 },
    weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
    main: {
      temp: 24,
      feels_like: 26,
      temp_min: 20,
      temp_max: 28,
      pressure: 1018,
      humidity: 60,
    },
    visibility: 10000,
    wind: { speed: 4.5, deg: 120 },
    sys: { country: "AU" },
    name: "Sydney",
  },
}

interface WeatherData {
  coord: { lon: number; lat: number }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  visibility: number
  wind: { speed: number; deg: number }
  sys: { country: string }
  name: string
}

interface CachedWeatherData {
  data: WeatherData
  timestamp: number
}

interface WeatherState {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  unit: "celsius" | "fahrenheit"
  cache: Record<string, CachedWeatherData>
}

const initialState: WeatherState = {
  weather: null,
  loading: false,
  error: null,
  unit: "celsius",
  cache: {},
}

// Mock API call with delay to simulate real API
export const fetchWeather = createAsyncThunk("weather/fetchWeather", async (city: string, { rejectWithValue }) => {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const cityKey = city.toLowerCase()
    const weatherData = mockWeatherData[cityKey]

    if (!weatherData) {
      throw new Error(`Weather data not found for "${city}". Try: London, New York, Tokyo, Paris, or Sydney`)
    }

    return { city: cityKey, data: weatherData }
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch weather data")
  }
})

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    toggleUnit: (state) => {
      state.unit = state.unit === "celsius" ? "fahrenheit" : "celsius"
    },
    clearWeather: (state) => {
      state.weather = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false
        state.weather = action.payload.data
        state.error = null
        // Cache the data
        state.cache[action.payload.city] = {
          data: action.payload.data,
          timestamp: Date.now(),
        }
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.weather = null
      })
  },
})

export const { clearError, toggleUnit, clearWeather } = weatherSlice.actions
export default weatherSlice.reducer
