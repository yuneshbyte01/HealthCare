import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Appointments from "./pages/Appointments";
import Clinic from "./pages/Clinic";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#f0f0f0" }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/register">Register</Link> |{" "}
        <Link to="/appointments">Patient Dashboard</Link> |{" "}
        <Link to="/clinic">Clinic Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/clinic" element={<Clinic />} />
      </Routes>
    </Router>
  );
}

export default App;
