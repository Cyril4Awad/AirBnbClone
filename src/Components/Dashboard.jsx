import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loading from "./Loading";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  //everytime we navigate to this page do these:
  useEffect(() => {
    // Check if user is logged in by using the currentUser set in the login.jsx
    const loggedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!loggedUser) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    // Only admins can access dashboard
    if (loggedUser.role !== "admin") {
      alert("Access denied! Admins only.");
      navigate("/");
      return;
    }


    setUser(loggedUser);
    fetchUserCount();
  }, [navigate]);


  //getting data from the db.json
  const fetchUserCount = async () => {
    try {
      //wait till we get an answer for the fetch
      const res = await fetch("http://localhost:8000/users");
      //read the body of the response from res and parses it to an array of objects
      const data = await res.json();
      setUserCount(data.length);

      //delaying the loading by delaying to make it false
      setTimeout(() => {
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error("Failed to fetch users:", err);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  // admin dashboard 
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-danger shadow">
        <div className="container">
          <span className="navbar-brand">
            <i className="bi bi-shield-lock"></i> Admin Dashboard - Welcome, {user.fname}
          </span>
          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-light btn-sm">
              Home
            </Link>

            <button onClick={handleLogout} className="btn btn-dark btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row mb-4">
          <div className="col">
            <h2 className="mb-0">User Management</h2>
            <p className="text-muted">Total Users: {userCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
