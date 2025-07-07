import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface WeatherData {
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

export interface WeatherState {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  unit: "celsius" | "fahrenheit"
  cache: Record<string, CachedWeatherData>
  cacheOrder: string[]
}

// ────────────────────────────────────────────────────────────────────────────
// Cache helpers
// ────────────────────────────────────────────────────────────────────────────

const MAX_CACHE_SIZE = 10
const CACHE_DURATION = 10 * 60 * 1000 // 10 min

const isCacheValid = (cached: CachedWeatherData) =>
  Date.now() - cached.timestamp < CACHE_DURATION

const manageCacheSize = (state: WeatherState, newCityKey: string) => {
  // remove if already present
  state.cacheOrder = state.cacheOrder.filter((c) => c !== newCityKey)
  // add to front
  state.cacheOrder.unshift(newCityKey)
  // drop overflow
  if (state.cacheOrder.length > MAX_CACHE_SIZE) {
    const toRemove = state.cacheOrder.slice(MAX_CACHE_SIZE)
    toRemove.forEach((c) => delete state.cache[c])
    state.cacheOrder.length = MAX_CACHE_SIZE
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Async thunk
// ────────────────────────────────────────────────────────────────────────────

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
if (!API_KEY)
  throw new Error(
    "NEXT_PUBLIC_OPENWEATHER_API_KEY is missing ‑ add it to .env.local",
  )

export const fetchWeather = createAsyncThunk<
  { city: string; data: WeatherData },
  string,
  { state: { weather: WeatherState }; rejectValue: string }
>("weather/fetchWeather", async (city, { getState, rejectWithValue }) => {
  const { unit, cache } = getState().weather
  const cityKey = city.toLowerCase()

  if (process.env.NODE_ENV !== "production") {
    console.log(`[Weather] Requested city: "${city}" (${unit})`)
  }

  const cached = cache[cityKey]
  if (cached && isCacheValid(cached)) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Weather] Serving from cache: "${cityKey}"`)
    }
    return { city: cityKey, data: cached.data }
  }

  try {
    const units = unit === "celsius" ? "metric" : "imperial"
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=${units}`

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Weather] Fetching from API: ${url}`)
    }

    const res = await fetch(url)

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}))
      const message =
        errJson.message ??
        `Request failed with status ${res.status} (${res.statusText})`

      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Weather] API error: ${message}`)
      }

      return rejectWithValue(message)
    }

    const data: WeatherData = await res.json()

    if (process.env.NODE_ENV !== "production") {
      console.log(`[Weather] API data received:`, data)
    }

    return { city: cityKey, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error"
    if (process.env.NODE_ENV !== "production") {
      console.error(`[Weather] Network error: ${message}`)
    }
    return rejectWithValue(message)
  }
})


// ────────────────────────────────────────────────────────────────────────────
// Slice
// ────────────────────────────────────────────────────────────────────────────

const initialState: WeatherState = {
  weather: null,
  loading: false,
  error: null,
  unit: "celsius",
  cache: {},
  cacheOrder: [],
}

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    clearError: (s) => void (s.error = null),
    toggleUnit: (s) => void (s.unit = s.unit === "celsius" ? "fahrenheit" : "celsius"),
    clearWeather: (s) => {
      s.weather = null
      s.error = null
    },
    clearCache: (s) => {
      s.cache = {}
      s.cacheOrder = []
    },
    removeFromCache: (s, a: PayloadAction<string>) => {
      const key = a.payload.toLowerCase()
      delete s.cache[key]
      s.cacheOrder = s.cacheOrder.filter((c) => c !== key)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (s) => {
        s.loading = true
        s.error = null
      })
      .addCase(fetchWeather.fulfilled, (s, a) => {
        s.loading = false
        s.weather = a.payload.data
        s.error = null

        // cache & maintain MRU list
        s.cache[a.payload.city] = { data: a.payload.data, timestamp: Date.now() }
        manageCacheSize(s, a.payload.city)
      })
      .addCase(fetchWeather.rejected, (s, a) => {
        s.loading = false
        s.error = a.payload ?? "Unknown error"
      })
  },
})

export const {
  clearError,
  toggleUnit,
  clearWeather,
  clearCache,
  removeFromCache,
} = weatherSlice.actions
export default weatherSlice.reducer
