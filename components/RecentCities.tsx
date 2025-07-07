"use client"

import type React from "react"

import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { Clock, X } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import { removeFromCache } from "@/lib/features/weather/weatherSlice"

export function RecentCities() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { cache, cacheOrder } = useSelector((state: RootState) => state.weather)

  if (cacheOrder.length === 0) {
    return null
  }

  const handleCityClick = (cityName: string) => {
    router.push(`/weather/${encodeURIComponent(cityName)}`)
  }

  const handleRemoveCity = (e: React.MouseEvent, cityKey: string) => {
    e.stopPropagation()
    dispatch(removeFromCache(cityKey))
  }

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / (1000 * 60))
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-white/70" />
        <h3 className="text-white/80 font-medium">Recently Searched</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cacheOrder.slice(0, 6).map((cityKey) => {
          const cachedData = cache[cityKey]
          if (!cachedData) return null

          return (
            <button
              key={cityKey}
              onClick={() => handleCityClick(cachedData.data.name)}
              className="group relative bg-white/10 hover:bg-white/20 rounded-lg p-3 text-left transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{cachedData.data.name}</p>
                  <p className="text-white/60 text-sm">{Math.round(cachedData.data.main.temp)}°C</p>
                  <p className="text-white/50 text-xs">{formatTimeAgo(cachedData.timestamp)}</p>
                </div>

                <button
                  onClick={(e) => handleRemoveCity(e, cityKey)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-all duration-200"
                >
                  <X className="w-4 h-4 text-white/70 hover:text-white" />
                </button>
              </div>
            </button>
          )
        })}
      </div>

      {cacheOrder.length > 6 && (
        <p className="text-white/50 text-sm mt-2 text-center">+{cacheOrder.length - 6} more cities cached</p>
      )}
    </div>
  )
}
