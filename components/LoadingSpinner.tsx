import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <p className="text-white text-lg">Fetching weather data...</p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
