import React from 'react'

function Footer() {
  return (
    <>
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <span className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 md:mb-0">Luxe Salon</span>

            <ul className="flex space-x-8">
              <li><a href="/about" className="text-gray-500 hover:text-primary transition-colors">About</a></li>
              <li><a href="/status" className="text-gray-500 hover:text-primary transition-colors">Status</a></li>

              <li><a href="/contact" className="text-gray-500 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <span>© {new Date().getFullYear()} Luxe Salon. All rights reserved.</span>
            <span className="mt-2 md:mt-0 flex items-center">
              Built with care, not noise.
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
