import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loading from "./Loading";
import "../index.css";
function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const loggedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!loggedUser) {
      alert("Please login first!");
      navigate("/login");
      return;
    }



    setUser(loggedUser);
    setFormData({
      fname: loggedUser.fname,
      lname: loggedUser.lname,
      email: loggedUser.email,
      password: loggedUser.password,
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    let validationErrors = {};
    if (!formData.fname) validationErrors.fname = "First name is required";
    if (!formData.lname) validationErrors.lname = "Last name is required";
    if (!formData.phone) validationErrors.phone = "Phone number is required";
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (
      formData.email !== user.email &&
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      validationErrors.email = "Invalid email format";
    }

    if (formData.password && formData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Fetch current user data from db
      const res = await fetch(`http://localhost:8000/users/${user.id}`);
      const currentUserData = await res.json();

      // Update user data
      const updatedData = {
        ...currentUserData,
        fname: formData.fname,
        lname: formData.lname,
        phone:formData.phone,
        ...(formData.email !== user.email && { email: formData.email }),
        ...(formData.password && { password: formData.password }),
      };

      await fetch(`http://localhost:8000/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      // Update localStorage
      const { password, ...userWithoutPassword } = updatedData;
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);
      setFormData({ ...formData, password: "" });
    } catch (err) {
      console.error(err);
      setErrors({ general: "Failed to update profile" });
    }
  };

  if (isLoading || !user) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <>
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
                      <Link to="/listings" className="nav-link  hover-effect">
                        Listings
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link to="/bookings" className="nav-link  hover-effect">
                        Bookings
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        to="/add-listing"
                        className="nav-link  hover-effect"
                      >
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
                      <Link to="/login" className="nav-link  hover-effect">
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
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow">
                <div className="card-header bg-pink text-white">
                  <h4 className="mb-0">My Profile</h4>
                </div>
                <div className="card-body p-4">
                  {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                  )}

                  {errors.general && (
                    <div className="alert alert-danger">{errors.general}</div>
                  )}

                  {!editMode ? (
                    <div>
                      <div className="mb-3">
                        <strong>First Name:</strong> {user.fname}
                      </div>
                      <div className="mb-3">
                        <strong>Last Name:</strong> {user.lname}
                      </div>
                      <div className="mb-3">
                        <strong>Phone Number:</strong> {user.phone}
                      </div>
                      <div className="mb-3">
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div className="mb-3">
                        <strong>Role:</strong>{" "}
                        <span className="badge bg-pink p-2">{user.role}</span>
                      </div>

                      <button
                        onClick={() => {
                          setEditMode(true);
                          setSuccessMessage("");
                        }}
                        className="btn btn-pink hover-effect"
                      >
                        Edit Profile
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfile}>
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          className={`form-control ${errors.fname ? "is-invalid" : ""
                            }`}
                          value={formData.fname}
                          onChange={(e) =>
                            setFormData({ ...formData, fname: e.target.value })
                          }
                        />
                        {errors.fname && (
                          <div className="invalid-feedback">{errors.fname}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          className={`form-control ${errors.lname ? "is-invalid" : ""
                            }`}
                          value={formData.lname}
                          onChange={(e) =>
                            setFormData({ ...formData, lname: e.target.value })
                          }
                        />
                        {errors.lname && (
                          <div className="invalid-feedback">{errors.lname}</div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          className={`form-control ${errors.phone ? "is-invalid" : ""
                            }`}
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                        {errors.phone && (
                          <div className="invalid-feedback">{errors.phone}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""
                            }`}
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          New Password (leave blank to keep current)
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? "is-invalid" : ""
                            }`}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          placeholder="Enter new password"
                        />
                        {errors.password && (
                          <div className="invalid-feedback">
                            {errors.password}
                          </div>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-pink">
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditMode(false);
                            setFormData({
                              fname: user.fname,
                              lname: user.lname,
                              email: user.email,
                              password: "",
                            });
                            setErrors({});
                          }}
                          className="btn btn-pink"
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
        </div>
      </div>
      <footer className="bg-light py-4">
        <div className="container text-center">
          <p>
            &copy; {new Date().getFullYear()} AirBnBee. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}

export default Profile;
