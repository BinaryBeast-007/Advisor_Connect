import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AdvisorSection } from './components/AdvisorSection';
import { ServicesSection } from './components/ServicesSection';
import { Footer } from './components/Footer';
import { SeeAllPage } from './pages/SeeAllPage';
import { AdvisorProfilePage } from './pages/AdvisorProfilePage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <div id="advisor-sections">
          <AdvisorSection
            title="SEBI Registered Analysts"
            type="SEBI"
          />
          <AdvisorSection
            title="Mutual Fund Distributors"
            type="MFD"
          />
        </div>
        <ServicesSection />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/analysts" element={<SeeAllPage type="analyst" />} />
        <Route path="/distributors" element={<SeeAllPage type="distributor" />} />
        <Route path="/advisor/:id" element={<AdvisorProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;