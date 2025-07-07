import { Cloud, CloudRain, Sun, CloudSnow, Zap } from "lucide-react"

interface WeatherIconProps {
  condition: string
  size?: number
}

export function WeatherIcon({ condition, size = 64 }: WeatherIconProps) {
  const iconProps = {
    size,
    className: "text-white drop-shadow-lg",
  }

  switch (condition.toLowerCase()) {
    case "clear":
      return <Sun {...iconProps} />
    case "clouds":
      return <Cloud {...iconProps} />
    case "rain":
    case "drizzle":
      return <CloudRain {...iconProps} />
    case "snow":
      return <CloudSnow {...iconProps} />
    case "thunderstorm":
      return <Zap {...iconProps} />
    default:
      return <Cloud {...iconProps} />
  }
}
