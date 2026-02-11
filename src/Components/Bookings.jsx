import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../index.css";
import {BASE_URL} from "../api";

function Bookings() {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload(); // Refresh to update UI
  };
  const handleViewListing = (listing) => {
    // Save the selected listing to localStorage
    localStorage.setItem("currentListing", JSON.stringify(listing));
    // Navigate to the view-listing page
    navigate("/view-listing");
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings`);
      const data = await res.json();

      // Only current user's bookings
      const userBookings = data.filter(
        (booking) => Number(booking.userId) === Number(user.id),
      );

      // Fetch listing info for each booking
      const resListings = await fetch(`${BASE_URL}/listings`);
      const listingsData = await resListings.json();

      const bookingsWithListing = userBookings.map((booking) => {
        const listing = listingsData.find(
          (l) => Number(l.id) === Number(booking.listingId),
        );
        return { ...booking, listing };
      });

      setBookings(bookingsWithListing);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDeleteBooking = async (booking) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      await fetch(`${BASE_URL}/bookings/${booking.id}`, { method: "DELETE" });

      fetchBookings(); // refresh list
      alert("Booking deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete booking");
    }
  };

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
                      <Link to="/listings" className="nav-link hover-effect">
                        Listings
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/profile" className="nav-link hover-effect">
                        Profile
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
                  navigate("/login")
                )}
              </ul>
            </div>
          </div>
        </nav>

        <div className="container py-5">
          <div className="row">
            <h2 className="mb-4">Your Bookings</h2>

            {/* If there are no bookings */}
            {bookings.length === 0 ? (
              <p className="text-center py-5">You have no bookings yet.</p>
            ) : (
              bookings.map((booking) => {
                // If the listing doesn't exist for this booking, skip it
                if (!booking.listing) return null;

                return (
                  <div className="col-lg-6 mb-4" key={booking.id}>
                    <div className="card shadow-sm">
                      <img
                        src={booking.listing.imgUrl}
                        className="card-img-top"
                        alt={booking.listing.listingName}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          {booking.listing.listingName},{" "}
                          {booking.listing.country}
                        </h5>
                        <ul className="list-unstyled">
                          <li>
                            <strong>Address:</strong> {booking.listing.address}
                          </li>
                          <li>
                            <strong>Size:</strong> {booking.listing.size} m²
                          </li>
                          <li>
                            <strong>Bedrooms:</strong>{" "}
                            {booking.listing.bedrooms}
                          </li>
                          <li>
                            <strong>Price:</strong> $
                            {booking.listing.pricePerNight} / night
                          </li>
                          <li>
                            <strong>Check-in:</strong> {booking.checkIn}
                          </li>
                          <li>
                            <strong>Check-out:</strong> {booking.checkOut}
                          </li>
                          <li>
                            <strong>People:</strong> {booking.guests}
                          </li>
                          <li>
                            <strong>Phone:</strong> {booking.phoneNumber}
                          </li>
                          <li>
                            <strong>Created on:</strong>{" "}
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </li>
                        </ul>
                        <Link
                          className="btn btn-pink btn-sm m-2"
                          to="/view-listing"
                          onClick={() => handleViewListing(booking.listing)}
                        >
                          View Details
                        </Link>
                        <button
                          className="btn btn-pink btn-sm"
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          Delete Booking
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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

export default Bookings;
