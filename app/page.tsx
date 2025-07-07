"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Cloud } from "lucide-react"

export default function HomePage() {
  const [city, setCity] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      router.push(`/weather/${encodeURIComponent(city.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Cloud className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Weather Dashboard</h1>
          <p className="text-white/80">Search for weather information in any city</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              className="w-full px-4 py-3 pl-12 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
          </div>

          <button
            type="submit"
            disabled={!city.trim()}
            className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50"
          >
            Search Weather
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">Try searching for cities like: London, New York, Tokyo, Paris</p>
        </div>
      </div>
    </div>
  )
}
