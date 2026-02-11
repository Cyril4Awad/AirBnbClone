import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loading from "./Loading";
import { BASE_URL } from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
  });

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    PasswordHash: "",
    Role: 0,
  });
  useEffect(() => {
    // Check if user is logged in
    const loggedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!loggedUser) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    // Only admins can access dashboard
    if (loggedUser.role !== 1) {
      alert("Access denied! Admins only.");
      navigate("/profile");
      return;
    }

    setUser(loggedUser);
    fetchUsers();
    fetchListings();
    fetchBookings();
  }, [navigate]);
  const [addUserErrors, setAddUserErrors] = useState({});

  const handleViewUserListings = (userId) => {
    navigate(`/user-listings/${userId}`);
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setLoading(false);
    }
  };

  const handleViewUserBookings = (userId) => {
    navigate(`/user-bookings/${userId}`);
  };

  const fetchListings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/listings`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings`);
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const handleStartEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({ fname: "", lname: "", email: "" });
  };

  const handleSaveEdit = async (userId) => {
    if (
      !editFormData.FirstName ||
      !editFormData.LastName ||
      !editFormData.Email
    ) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const userData = await res.json();

      await fetch(`${BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, ...editFormData }),
      });

      fetchUsers();
      setEditingUser(null);
      alert("User updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddUserErrors({});

    // Validation
    let errors = {};
    if (!newUserData.FirstName) errors.FirstName = "First name is required";
    if (!newUserData.LastName) errors.LastName = "Last name is required";
    if (!newUserData.Email) {
      errors.Email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUserData.Email)) {
      errors.Email = "Invalid email format";
    }
    if (!newUserData.PasswordHash) {
      errors.PasswordHash = "Password is required";
    } else if (newUserData.PasswordHash.length < 6) {
      errors.PasswordHash = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setAddUserErrors(errors);
      return;
    }

    try {
      // Check if email already exists
      const res = await fetch(`${BASE_URL}/users`);
      const existingUsers = await res.json();

      const emailExists = existingUsers.some(
        (u) => u.Email === newUserData.Email,
      );

      if (emailExists) {
        setAddUserErrors({ email: "Email already exists" });
        return;
      }

      // Add new user
      await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      // Reset form and close modal
      setNewUserData({
        fname: "",
        lname: "",
        email: "",
        password: "",
        role: 0,
      });
      setShowAddUser(false);
      fetchUsers();
      alert("User added successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to add user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await fetch(`${BASE_URL}/users/${userId}`, {
        method: "DELETE",
      });
      fetchUsers(); // refresh list
      alert("User deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  };

  const handleEditUser = async (userId, updates) => {
    try {
      const res = await fetch(`${BASE_URL}/users/${userId}`);
      const userData = await res.json();

      await fetch(`${BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, ...updates }),
      });

      fetchUsers();
      alert("User updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  // Get listings and bookings for each user
  const getUserListingsCount = (userId) => {
    return listings.filter((listing) => listing.hostId === userId).length;
  };

  const getUserBookingsCount = (userId) => {
    return bookings.filter((booking) => booking.userId === userId).length;
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  // ADMIN DASHBOARD ONLY
  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-danger shadow">
        <div className="container">
          <span className="navbar-brand">
            <i className="bi bi-shield-lock"></i> Admin Dashboard - Welcome,{" "}
            {user.firstName}
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
            <h2 className="mb-2">User Management</h2>
            <p className="text-muted mb-0">Total Users: {users.length}</p>
            <p className="text-muted mb-0">Total Listings: {listings.length}</p>
            <p className="text-muted mb-0">Total Bookings: {bookings.length}</p>
          </div>

          <div className="col-auto">
            <button
              onClick={() => setShowAddUser(!showAddUser)}
              className="btn btn-pink"
            >
              {showAddUser ? "Cancel" : "+ Add New User"}
            </button>
          </div>
        </div>

        {/* Add User Form */}
        {showAddUser && (
          <div className="card shadow mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Add New User</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddUser}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name *</label>
                    <input
                      className={`form-control ${
                        addUserErrors.fname ? "is-invalid" : ""
                      }`}
                      value={newUserData.FirstName}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          FirstName: e.target.value,
                        })
                      }
                      placeholder="Enter first name"
                    />
                    {addUserErrors.fname && (
                      <div className="invalid-feedback">
                        {addUserErrors.fname}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name *</label>
                    <input
                      className={`form-control ${
                        addUserErrors.lname ? "is-invalid" : ""
                      }`}
                      value={newUserData.LastName}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          LastName: e.target.value,
                        })
                      }
                      placeholder="Enter last name"
                    />
                    {addUserErrors.lname && (
                      <div className="invalid-feedback">
                        {addUserErrors.lname}
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className={`form-control ${
                        addUserErrors.email ? "is-invalid" : ""
                      }`}
                      value={newUserData.Email}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          Email: e.target.value,
                        })
                      }
                      placeholder="Enter email"
                    />
                    {addUserErrors.email && (
                      <div className="invalid-feedback">
                        {addUserErrors.email}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className={`form-control ${
                        addUserErrors.password ? "is-invalid" : ""
                      }`}
                      value={newUserData.PasswordHash}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          PasswordHash: e.target.value,
                        })
                      }
                      placeholder="Enter password (min 6 characters)"
                    />
                    {addUserErrors.password && (
                      <div className="invalid-feedback">
                        {addUserErrors.password}
                      </div>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Select Role *</label>
                    <select
                      className="form-select"
                      value={newUserData.Role}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, Role: e.target.value })
                      }
                    >
                      <option value="0">User</option>
                      <option value="1">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    Add User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUser(false);
                      setNewUserData({
                        FirstName: "",
                        LastName: "",
                        Email: "",
                        PasswordHash: "",
                        Role: 0,
                      });

                      setAddUserErrors({});
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card shadow">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Listings</th>
                    <th>Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        {editingUser?.id === u.id ? (
                          <input
                            className="form-control form-control-sm"
                            value={editFormData.fname}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                FirstName: e.target.value,
                              })
                            }
                          />
                        ) : (
                          u.firstName
                        )}
                      </td>
                      <td>
                        {editingUser?.id === u.id ? (
                          <input
                            className="form-control form-control-sm"
                            value={editFormData.lname}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                LastName: e.target.value,
                              })
                            }
                          />
                        ) : (
                          u.lastName
                        )}
                      </td>
                      <td>
                        {editingUser?.id === u.id ? (
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            value={editFormData.email}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                Email: e.target.value,
                              })
                            }
                          />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            u.role === 1 ? "bg-pink" : "bg-pink"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{getUserListingsCount(u.id)}</td>
                      <td>{getUserBookingsCount(u.id)}</td>
                      <td>
                        {editingUser?.id === u.id ? (
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => handleSaveEdit(u.id)}
                              className="btn btn-sm btn-success"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn btn-sm btn-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-1">
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="btn btn-sm btn-danger"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                const newRole = u.role == 1 ? 0 : 1;
                                handleEditUser(u.id, { role: newRole });
                              }}
                              className="btn btn-sm btn-pink"
                            >
                              {u.role === 1 ? "Remove Admin" : "Make Admin"}
                            </button>
                            <button
                              onClick={() => handleViewUserListings(u.id)}
                              className="btn btn-sm btn-danger"
                            >
                              Go to his lisitngs
                            </button>
                            <button
                              onClick={() => handleViewUserBookings(u.id)}
                              className="btn btn-sm btn-pink"
                            >
                              Go to his bookings
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-sm btn-danger"
                              disabled={u.id === user.id}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
