"use client"

import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"

interface ErrorMessageProps {
  error: string
  onRetry: () => void
  onBack: () => void
}

export function ErrorMessage({ error, onRetry, onBack }: ErrorMessageProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
        <p className="text-white/80 mb-6">{error}</p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={onBack}
            className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-white/10 text-white/80 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
        </div>
      </div>
    </div>
  )
}
