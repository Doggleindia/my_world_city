// Solid glyphs for the four home-page action tiles. Hand-drawn rather than
// lucide because two of them are composites (building + tower crane, people +
// gear) that no icon set ships. All inherit `color` via currentColor.

export function BuyIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      {/* roof */}
      <path d="M24 3.4 1.9 22.3a2.7 2.7 0 0 0 1.8 4.7h40.6a2.7 2.7 0 0 0 1.8-4.7L24 3.4Z" />
      {/* body, with the doorway carved out of the outline */}
      <path d="M8.6 27v14.3A2.7 2.7 0 0 0 11.3 44h7V33.2a5.7 5.7 0 0 1 11.4 0V44h7a2.7 2.7 0 0 0 2.7-2.7V27H8.6Z" />
    </svg>
  )
}

export function BuildIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      {/* tower block — windows are holes via even-odd */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 13h20v31H4V13Zm3.6 4v4.4H12V17H7.6Zm6.8 0v4.4h4.4V17h-4.4Zm-6.8 6.5v4.4H12v-4.4H7.6Zm6.8 0v4.4h4.4v-4.4h-4.4Zm-6.8 6.5v4.4H12V30H7.6Zm6.8 0v4.4h4.4V30h-4.4Zm-6.8 6.5v4.4H12v-4.4H7.6Zm6.8 0v4.4h4.4v-4.4h-4.4Z"
      />
      {/* crane: mast on the right, jib reaching left across the block */}
      <path d="M33.5 9.5h4.8V44h-4.8V9.5Z" />
      <path d="M12.5 4.5h34V9.5h-34V4.5Z" />
      <path d="M34.5.5h2.8v4h-2.8v-4Z" />
      <path d="M15.8 9.5h1.8v6h-1.8v-6Z" />
      <path d="M13.2 15.5h7v3.5h-7v-3.5Z" />
    </svg>
  )
}

export function ManageIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      {/* front figure */}
      <circle cx="14.5" cy="11.5" r="7.2" />
      <path d="M3 31.5a11.5 11.5 0 0 1 23 0v1.6A1.9 1.9 0 0 1 24.1 35H4.9A1.9 1.9 0 0 1 3 33.1v-1.6Z" />
      {/* figure behind */}
      <circle cx="30.6" cy="10.4" r="5.4" />
      <path d="M23.4 19.9a9.5 9.5 0 0 1 16.1 5.4 11.7 11.7 0 0 0-6.4 1.5 14.9 14.9 0 0 0-9.7-6.9Z" />
      {/* gear */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.6 26.3a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2Zm0 5.4a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect
          key={a}
          x="32.9"
          y="23.3"
          width="3.4"
          height="4.6"
          rx="1.1"
          transform={`rotate(${a} 34.6 34.9)`}
        />
      ))}
    </svg>
  )
}

export function InvestIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true" {...props}>
      {/* board outline as a ring */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 7h25a4.5 4.5 0 0 1 4.5 4.5v28a4.5 4.5 0 0 1-4.5 4.5h-25A4.5 4.5 0 0 1 7 39.5v-28A4.5 4.5 0 0 1 11.5 7Zm-.7 3.8v29.4h26.4V10.8H10.8Z"
      />
      {/* clip */}
      <rect x="17" y="3" width="14" height="8" rx="2.6" />
      {/* double chevron up */}
      <path
        d="M15 28 24 19l9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 37 24 28l9 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const actionIcons = {
  buy: BuyIcon,
  build: BuildIcon,
  manage: ManageIcon,
  invest: InvestIcon,
}
