import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loading from "./Loading";
import { BASE_URL } from "../api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    passwordHash: "",
  });

  // Load user from localStorage
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!loggedUser) {
      navigate("/login");
      return;
    }

    setUser(loggedUser);
    setFormData({
      firstName: loggedUser.firstName || "",
      lastName: loggedUser.lastName || "",
      email: loggedUser.email || "",
      phoneNumber: loggedUser.phoneNumber || "",
      passwordHash: "",
    });

    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validation
    const validationErrors = {};
    if (!formData.firstName)
      validationErrors.firstName = "First name is required";
    if (!formData.lastName) validationErrors.lastName = "Last name is required";
    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.phoneNumber)
      validationErrors.phoneNumber = "Phone number is required";
    if (formData.passwordHash && formData.passwordHash.length < 6)
      validationErrors.passwordHash = "Password must be at least 6 characters";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const updatedData = {
      id: user.id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      // Only include passwordHash if user typed a new password
      ...(formData.passwordHash ? { passwordHash: formData.passwordHash } : {}),
    };

    // send password ONLY if filled
    if (formData.passwordHash) {
      updatedData.passwordHash = formData.passwordHash;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Update failed");

      // Update UI + storage
      const updatedUser = { ...user, ...updatedData };
      delete updatedUser.passwordHash;

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      setSuccessMessage("Profile updated successfully!");

      setFormData({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        passwordHash: "",
      });
    } catch (err) {
      console.error(err);
      setErrors({ general: "Failed to update profile" });
    }
  };

  if (isLoading || !user) return <Loading message="Loading profile..." />;

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            testing
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
              {user ? (
                <>
                  <li className="nav-item">
                    <Link to="/" className="nav-link hover-effect">
                      Home
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li className="nav-item">
                      <Link to="/dashboard" className="nav-link hover-effect">
                        Dashboard
                      </Link>
                    </li>
                  )}
                  <li className="nav-item">
                    <Link to="/listings" className="nav-link hover-effect">
                      Listings
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/bookings" className="nav-link hover-effect">
                      Bookings
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/add-listing" className="nav-link hover-effect">
                      Add Listing
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={handleLogout}
                      className="btn btn-pink btn-sm hover-effect"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link hover-effect">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      to="/registration"
                      className="btn btn-pink btn-sm hover-effect"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="card shadow">
          <div className="card-header bg-pink text-white">
            <h4>My Profile</h4>
          </div>
          <div className="card-body">
            {successMessage && (
              <div className="alert alert-success">{successMessage}</div>
            )}
            {errors.general && (
              <div className="alert alert-danger">{errors.general}</div>
            )}

            {!editMode ? (
              <>
                <p>
                  <strong>First Name:</strong> {user.firstName}
                </p>
                <p>
                  <strong>Last Name:</strong> {user.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phoneNumber}
                </p>

                <button
                  className="btn btn-pink"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                {[
                  "firstName",
                  "lastName",
                  "email",
                  "phoneNumber",
                  "passwordHash",
                ].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label">
                      {field === "passwordHash"
                        ? "New Password"
                        : field.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type={field === "passwordHash" ? "password" : "text"}
                      className={`form-control ${errors[field] ? "is-invalid" : ""}`}
                      value={formData[field] ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                    />
                    {errors[field] && (
                      <div className="invalid-feedback">{errors[field]}</div>
                    )}
                  </div>
                ))}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-pink">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        passwordHash: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
