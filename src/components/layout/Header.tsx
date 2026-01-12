import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-vinyl-800 bg-vinyl-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-vinyl-50 group-hover:text-accent-purple transition-colors">
                Vinyl View
              </h1>
              <p className="text-xs text-vinyl-400">Your Collection</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-vinyl-200 hover:text-vinyl-50 hover:bg-vinyl-800 rounded-lg transition-colors"
            >
              Collection
            </Link>
            <Link
              href="/add"
              className="px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors shadow-lg shadow-accent-purple/30"
            >
              + Add Record
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
