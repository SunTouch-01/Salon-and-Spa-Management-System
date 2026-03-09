import React from 'react'
function Featurecard() {
  const features = [
    {
      title: "AI-Powered",
      description: "Advanced machine learning algorithms to enhance your healthcare analytics.",
      icon: "🤖"
    },
    {
      title: "Personalized",
      description: "Customized care paths tailored to unique patient needs and history.",
      icon: "👤"
    },
    {
      title: "Interactive",
      description: "Engaging dashboards and real-time feedback for better decision making.",
      icon: "✨"
    },
    {
      title: "Care Driven",
      description: "Built with a focus on patient outcomes and staff efficiency.",
      icon: "❤️"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <div key={index} className="bg-bg-light rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

export default Featurecard
