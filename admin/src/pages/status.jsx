import React from 'react'
import Footer from '../components/footer';
function Status() {
  return (
      <>
    <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
        <div className="text-4xl mb-4">🟢</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">System Status</h1>
        <p className="text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-full inline-block">All Systems Operational</p>
      </div>
    </div>
      <Footer/>
      </>
  )
}

export default Status
