// filepath: cricket-ui/src/routes.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentProfile from "./pages/StudentProfile";
import CoachProfile from "./pages/CoachProfile";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student-profile" element={<StudentProfile />} />
      <Route path="/coach-profile" element={<CoachProfile />} />
    </Routes>
  </Router>
);

export default AppRoutes;