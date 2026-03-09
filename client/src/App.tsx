import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import BookingModal from './components/BookingModal';
import Home from './pages/Home';
import Services from './pages/Services';
import Salons from './pages/Salons';
import Offers from './pages/Offers';
import About from './pages/About';
import Contact from './pages/Contact';
import SalonDetail from './pages/SalonDetail';

interface Offer {
  _id: string;
  name: string;
  code: string;
  discount: number;
  discountType: string;
  validTo: string;
  description?: string;
  imageUrl?: string;
  salonId: { _id: string; name: string };
}

interface BookingState {
  isOpen: boolean;
  initialSalonId?: string;
  initialService?: any;
  initialOffer?: Offer;
}

function App() {
  const [bookingState, setBookingState] = useState<BookingState>({ isOpen: false });

  const openBooking = (salonId?: string, service?: any, offer?: Offer) => {
    setBookingState({
      isOpen: true,
      initialSalonId: salonId,
      initialService: service,
      initialOffer: offer
    });
  };

  const closeBooking = () => {
    setBookingState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <Router>
      <div className="min-h-screen bg-bg-light selection:bg-primary selection:text-white flex flex-col">
        <Navbar onOpenBooking={() => openBooking()} />

        <Routes>
          <Route path="/" element={<Home onOpenBooking={() => openBooking()} />} />
          <Route path="/services" element={<Services onOpenBooking={(service) => openBooking(undefined, service)} />} />
          <Route path="/salons" element={<Salons onOpenBooking={(salonId) => openBooking(salonId)} />} />
          <Route path="/salon" element={<Salons onOpenBooking={(salonId) => openBooking(salonId)} type="salon" />} />
          <Route path="/spa" element={<Salons onOpenBooking={(salonId) => openBooking(salonId)} type="spa" />} />
          <Route path="/salons/:id" element={<SalonDetail onOpenBooking={(salonId) => openBooking(salonId)} />} />
          <Route path="/offers" element={<Offers onOpenBooking={(salonId, offer) => openBooking(salonId, undefined, offer)} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

        <BookingModal
          isOpen={bookingState.isOpen}
          onClose={closeBooking}
          initialSalonId={bookingState.initialSalonId}
          initialService={bookingState.initialService}
        />
      </div>
    </Router>
  );
}

export default App;
