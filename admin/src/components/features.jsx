import React from 'react'
import Featurecard from './featurecard'


function features() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Why Choose <span className="text-primary">Us?</span>
          </h2>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            We combine artistry with care to provide the best beauty experience.
          </p>
        </div>
        <Featurecard />
      </div>
    </div>
  )
}

export default features
