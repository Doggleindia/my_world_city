import { MessageSquare } from 'lucide-react'

export default function ChatFab() {
  return (
    <button
      aria-label="Chat with us"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
    >
      <MessageSquare className="h-6 w-6" />
    </button>
  )
}
