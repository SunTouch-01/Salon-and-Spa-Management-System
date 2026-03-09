import Profilecard from '../components/Profilecard'
import React, { useState, useEffect } from 'react'
import Footer from '../components/footer';

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`http://localhost:5173/profile/${userId}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(err => console.error("Error fetching profile:", err));
    }
  }, []);

  return (
    <div className='flex flex-col min-h-screen'>
      <div className='flex-grow'>
        <Profilecard user={user} />
      </div>
      <Footer />
    </div>
  )
}

export default Profile
