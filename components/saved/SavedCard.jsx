import PropertyCard from '@/components/listing/PropertyCard'

// Same card as everywhere else; the corner square removes the listing instead.
export default function SavedCard({ onUnsave, ...card }) {
  return <PropertyCard {...card} onUnsave={onUnsave} />
}
