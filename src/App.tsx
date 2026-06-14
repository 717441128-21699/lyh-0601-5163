import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegionDetail from './pages/RegionDetail';
import WarningManagement from './pages/WarningManagement';
import MiningPlanManagement from './pages/MiningPlanManagement';
import HealthReportManagement from './pages/HealthReportManagement';
import PermissionManagement from './pages/PermissionManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="region">
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path=":provinceId" element={<RegionDetail />} />
            <Route path=":provinceId/:cityId" element={<RegionDetail />} />
          </Route>

          <Route path="warning">
            <Route index element={<WarningManagement />} />
            <Route path=":warningId" element={<WarningManagement />} />
          </Route>

          <Route path="mining-plan" element={<MiningPlanManagement />} />

          <Route path="report" element={<HealthReportManagement />} />

          <Route path="permission" element={<PermissionManagement />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
