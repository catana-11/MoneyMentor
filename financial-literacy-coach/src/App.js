
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import FTPage from './pages/FTPage';
import FinancialAdvicePage from './pages/FinancialAdvicePage';
import FinancialPersonaPage from './pages/FinancialPersonaPage';
import LearnInvestmentsPage from './pages/LearnInvestmentsPage';
import ESGPage from './pages/ESGPage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/financial-terms" element={<FTPage />} />
          <Route path="/financial-advice" element={<FinancialAdvicePage />} />
          <Route path="/financial-persona" element={<FinancialPersonaPage />} />
          <Route path="/course/investment-options" element={<LearnInvestmentsPage />} />
          <Route path="/course/esg" element={<ESGPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
