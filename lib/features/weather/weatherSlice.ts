import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

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

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (city: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch weather data")
      }

      const data = await response.json()
      return { city: city.toLowerCase(), data }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch weather data")
    }
  }
)


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
