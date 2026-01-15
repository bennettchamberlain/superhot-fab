'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & {digest?: string}
  reset: () => void
}) {
  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24">
      <div className="container mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">Something went wrong!</h2>
          <p className="text-yellow-200 text-lg mb-6">{error.message}</p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  )
}
