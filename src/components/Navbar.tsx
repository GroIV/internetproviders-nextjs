import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            InternetProviders.ai
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/compare" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Compare
          </Link>
          <Link href="/providers" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Providers
          </Link>
          <Link href="/guides" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Guides
          </Link>
          <Link href="/tools" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Tools
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href="/compare"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Find Providers
          </Link>
        </div>
      </div>
    </header>
  )
}
