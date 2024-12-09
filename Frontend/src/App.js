import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/common/AuthContext";
import Navbar from "./components/common/Navbar";
import Home from "./Pages/Home";
import Events from "./Pages/Events";
import Register from "./Pages/RegisterEvent";
import Login from "./Pages/Login";
import Profile from "./Pages/User";
import AdminDashboard from "./Pages/AdminDashboard";
import Payment from './Pages/Payment';
import PaymentSuccess from './Pages/PaymentSuccess';

const App = () => {
    return (
        <AuthProvider> {/* Wrap the entire Router with AuthProvider */}
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
