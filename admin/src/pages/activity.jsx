import React from 'react'
import Footer from '../components/footer';
function Activity() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      <div className="grow pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Log</h1>
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">
            <p>No recent activity to display.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Activity
