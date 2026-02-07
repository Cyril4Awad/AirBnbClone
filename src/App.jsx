import { Routes, Route } from "react-router-dom";
import Registration from "./Components/Registration";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import Home from "./Components/Home";
import ProtectedRoute from "./Components/ProtectedRoute";
import RandomPage from "./Components/RandomPage";
import Bookings from "./Components/Bookings";
import Listings from "./Components/Listings";
import Profile from "./Components/Profile";
import AddListing from "./Components/AddListing";
import ViewListing from "./Components/ViewListing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/login" element={<Login />} />
      <Route path="/random-page" element={<RandomPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings"
        element={
          <ProtectedRoute>
            <Listings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
       <Route
        path="/add-listing"
        element={
          <ProtectedRoute>
            <AddListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/view-listing"
        element={
          <ProtectedRoute>
            <ViewListing />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
