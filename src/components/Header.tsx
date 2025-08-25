import HeaderUserMenu from '@/components/HeaderUserMenu'

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <img 
                src="https://ciwjjfcuhubjydajazkk.supabase.co/storage/v1/object/public/webstie-icon/FluxKrea%20log-120.png" 
                alt="FluxKrea Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FluxKrea
              </span>
            </a>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </a>
            <a href="/generate" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Generate
            </a>
            <a href="/gallery" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Gallery
            </a>
            <a href="https://www.fluxkrea.me/pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Pricing
            </a>
          </nav>
          
          <HeaderUserMenu />
        </div>
      </div>
    </header>
  )
}