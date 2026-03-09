import React from 'react'
import { Link } from 'react-router-dom';
function Hero() {
  return (
    <>
      <div className="relative h-screen flex items-center justify-center bg-cover bg-center" >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="text-primary">Luxe Salon</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto font-light">
            Relax, Rejuvenate, and Shine. Experience premium beauty services with our expert stylists.
          </p>
          <Link to='/signup'><button className="bg-primary hover:bg-secondary text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg">
            Get Started
          </button></Link>
        </div>
      </div>
    </>
  )
}

export default Hero
