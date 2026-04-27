import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/DashboardLayout";
import CandidatesTable from "./components/CandidatesTable";
import JobsTable from "./components/JobsTable";
import CreateJob from "./pages/CreateJob";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";
import { JobsProvider } from "./context/JobsContext";

// Placeholder for unbuilt routes
const PlaceholderPage = () => {
  const { pageId } = useParams();
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#FAFAFA] p-8 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-900 capitalize mb-2">
          {pageId?.replace('-', ' ')}
        </h2>
        <p className="text-sm text-gray-500">
          This module is currently under construction. Please check back later!
        </p>
      </div>
    </div>
  );
};

import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { CandidatesProvider } from "./context/CandidatesContext";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <JobsProvider>
        <CandidatesProvider>
          <DashboardProvider>
            <BrowserRouter>
              <Routes>
                {/* Authentication */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Main Application Layout (Protected) */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<DashboardLayout />}>
                    {/* Working Routes */}
                    <Route path="/overview" element={<OverviewPage />} />
                    <Route path="/jobs" element={<JobsTable />} />
                    <Route path="/create-job" element={<CreateJob />} />
                    <Route path="/candidates" element={<CandidatesTable />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Dynamic fallback for other routes */}
                    <Route path="/:pageId" element={<PlaceholderPage />} />
                  </Route>
                </Route>

                {/* Wildcard Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </DashboardProvider>
        </CandidatesProvider>
      </JobsProvider>
    </AuthProvider>
  );
}