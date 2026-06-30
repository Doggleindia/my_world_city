import { MessageSquare } from 'lucide-react'
import ContactButton from '@/components/contact/ContactButton'

export default function ChatFab() {
  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <ContactButton
        topic="Quick chat"
        title="Chat with us"
        subtitle="Ask anything — we’ll get back to you fast."
        className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
      >
        <MessageSquare className="h-6 w-6" />
      </ContactButton>
    </div>
  )
}
