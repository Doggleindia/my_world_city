import {
  Activity,
  BatteryCharging,
  Building2,
  Check,
  CloudRain,
  Coffee,
  Droplet,
  Dumbbell,
  Heart,
  MapPin,
  Plane,
  Shield,
  ShoppingBag,
  Sprout,
  Sun,
  TrainFront,
  Trees,
  TrendingUp,
  Waves,
  Wifi,
  Zap,
} from 'lucide-react'

// Icon keys used by lib/propertyDefaults.js and stored on listings.
const ICONS = {
  activity: Activity,
  battery: BatteryCharging,
  check: Check,
  city: Building2,
  coffee: Coffee,
  droplet: Droplet,
  dumbbell: Dumbbell,
  heart: Heart,
  pin: MapPin,
  plane: Plane,
  rain: CloudRain,
  shield: Shield,
  shopping: ShoppingBag,
  sprout: Sprout,
  sun: Sun,
  train: TrainFront,
  trees: Trees,
  trending: TrendingUp,
  waves: Waves,
  wifi: Wifi,
  zap: Zap,
}

export function iconFor(key) {
  return ICONS[key] || Check
}
