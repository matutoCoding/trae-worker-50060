import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import VoyagePage from "@/pages/voyage/VoyagePage";
import FishingGroundPage from "@/pages/fishing-ground/FishingGroundPage";
import FishingOperationPage from "@/pages/fishing-operation/FishingOperationPage";
import CatchPage from "@/pages/catch/CatchPage";
import FuelPage from "@/pages/fuel/FuelPage";
import CrewPage from "@/pages/crew/CrewPage";
import SafetyPage from "@/pages/safety/SafetyPage";
import FinancePage from "@/pages/finance/FinancePage";
import SettingsPage from "@/pages/settings/SettingsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/voyage" element={<VoyagePage />} />
          <Route path="/fishing-ground" element={<FishingGroundPage />} />
          <Route path="/fishing-operation" element={<FishingOperationPage />} />
          <Route path="/catch" element={<CatchPage />} />
          <Route path="/fuel" element={<FuelPage />} />
          <Route path="/crew" element={<CrewPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
