import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-yellow-400 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-yellow-100 mb-4">Product Not Found</h2>
        <p className="text-yellow-200 mb-8">The product you're looking for doesn't exist.</p>
        <Link
          href="/shop"
          className="inline-block bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold py-3 px-8 rounded-lg text-lg uppercase hover:opacity-90 transition"
        >
          Back to Shop
        </Link>
      </div>
    </main>
  )
}
