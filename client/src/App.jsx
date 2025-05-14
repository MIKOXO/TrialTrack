import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RoleSelector from "./pages/RoleSelector";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminHome from "./pages/AdminPages/AdminHome";
import AdminCases from "./pages/AdminPages/AdminCases";
import AdminClients from "./pages/AdminPages/AdminClients";
import AdminCalendar from "./pages/AdminPages/AdminCalendar";
import AdminReports from "./pages/AdminPages/AdminReports";
import AdminSettings from "./pages/AdminPages/AdminSettings";
import ClientHome from "./pages/ClientPages/ClientHome";
import MyCases from "./pages/ClientPages/MyCases";
import NewCase from "./pages/ClientPages/NewCase";
import ClientSettings from "./pages/ClientPages/ClientSettings";
import JudgeHome from "./pages/JudgePages/JudgeHome";
import JudgeCases from "./pages/JudgePages/JudgeCases";
import JudgeCalendar from "./pages/JudgePages/JudgeCalendar";
import JudgeSettings from "./pages/JudgePages/JudgeSettings";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/roleselector" element={<RoleSelector />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="Admin" />}>
          <Route path="/admin/home" element={<AdminHome />} />
          <Route path="/admin/cases" element={<AdminCases />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/calendar" element={<AdminCalendar />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Client Routes */}
        <Route element={<ProtectedRoute role="Client" />}>
          <Route path="/client/home" element={<ClientHome />} />
          <Route path="/client/mycases" element={<MyCases />} />
          <Route path="/client/newcase" element={<NewCase />} />
          <Route path="/client/settings" element={<ClientSettings />} />
        </Route>

        {/* Judge Routes */}
        <Route element={<ProtectedRoute role="Judge" />}>
          <Route path="/judge/home" element={<JudgeHome />} />
          <Route path="/judge/cases" element={<JudgeCases />} />
          <Route path="/judge/calendar" element={<JudgeCalendar />} />
          <Route path="/judge/settings" element={<JudgeSettings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
