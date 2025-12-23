import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Compare</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/compare" className="hover:text-white transition-colors">Find Providers</Link></li>
              <li><Link href="/compare/fiber-vs-cable" className="hover:text-white transition-colors">Fiber vs Cable</Link></li>
              <li><Link href="/best/fiber-providers" className="hover:text-white transition-colors">Best Fiber</Link></li>
              <li><Link href="/cheapest/providers" className="hover:text-white transition-colors">Cheapest Internet</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Providers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/providers/att" className="hover:text-white transition-colors">AT&T</Link></li>
              <li><Link href="/providers/xfinity" className="hover:text-white transition-colors">Xfinity</Link></li>
              <li><Link href="/providers/spectrum" className="hover:text-white transition-colors">Spectrum</Link></li>
              <li><Link href="/providers/verizon" className="hover:text-white transition-colors">Verizon Fios</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
              <li><Link href="/tools/speed-test" className="hover:text-white transition-colors">Speed Test</Link></li>
              <li><Link href="/tools/quiz" className="hover:text-white transition-colors">Find Your Plan</Link></li>
              <li><Link href="/coverage" className="hover:text-white transition-colors">Coverage Map</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} InternetProviders.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
