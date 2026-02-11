import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BASE_URL } from "../api";

import "../index.css";

function Home() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]); // Assuming you have bookings data
  const [searchQuery, setSearchQuery] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [favorites, setFavorites] = useState([]); // Initialize as an empty array

  const user = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload();
  };

  const handleViewListing = (listing) => {
    localStorage.setItem("currentListing", JSON.stringify(listing));
    navigate("/view-listing");
  };
  const handleFavoriteToggle = async (listingId) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    const isFavorite = favorites.includes(listingId);

    try {
      if (isFavorite) {
        // REMOVE
        await fetch(
          `${BASE_URL}/userfavorites/${Number(currentUser.id)}/${Number(listingId)}`,
          {
            method: "DELETE",
          },
        );

        setFavorites(favorites.filter((id) => id !== listingId));
      } else {
        // ADD
        await fetch(`${BASE_URL}/userfavorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(currentUser.id),
            listingId: Number(listingId),
          }),
        });

        setFavorites([...favorites, listingId]);
      }
    } catch (error) {
      console.error("Failed to update favorites:", error);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchBookings();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const res = await fetch(`${BASE_URL}/userfavorites`);
        const data = await res.json();

        // Filter only current user's favorites
        const userFavorites = data
          .filter((f) => f.userId === user.id)
          .map((f) => f.listingId);

        setFavorites(userFavorites);
      } catch (err) {
        console.error("Failed to fetch user favorites:", err);
      }
    };

    fetchFavorites();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch(`${BASE_URL}/listings`);
      const data = await res.json();

      // Fetch images for each listing
      const listingsWithImages = await Promise.all(
        data.map(async (listing) => {
          try {
            const imgRes = await fetch(
              `${BASE_URL}/ListingImages/${listing.id}`,
            );
            const images = await imgRes.json();

            return {
              ...listing,
              images: images, // add the array of images to the listing
              imgUrl: images.length > 0 ? images[0].imageUrl : "",
              // first image for display
            };
          } catch (err) {
            console.error(
              "Failed to fetch images for listing:",
              listing.id,
              err,
            );
            return { ...listing, images: [], imgUrl: "" };
          }
        }),
      );

      setListings(listingsWithImages);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setLoading(false);
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

  // Function to check if a listing is available for the selected dates
  const isListingAvailable = (listing) => {
    return !bookings.some((booking) => {
      if (booking.listingId === listing.id) {
        const bookingStartDate = new Date(booking.checkIn);
        const bookingEndDate = new Date(booking.checkOut);
        const selectedStartDate = new Date(checkInDate);
        const selectedEndDate = new Date(checkOutDate);

        // Check if the booking dates overlap with the selected dates
        return (
          (selectedStartDate >= bookingStartDate &&
            selectedStartDate <= bookingEndDate) ||
          (selectedEndDate >= bookingStartDate &&
            selectedEndDate <= bookingEndDate) ||
          (selectedStartDate <= bookingStartDate &&
            selectedEndDate >= bookingEndDate)
        );
      }
      return false;
    });
  };

  // Filter listings based on country, available dates, and guests

  const filteredListings = listings.filter((listing) => {
    // Only apply filtering when the user has entered criteria
    const isAvailable = isListingAvailable(listing);
    const isWithinGuestLimit = listing.guests >= guests;

    // Check if the listing matches the search criteria
    return (
      listing.country.toLowerCase().includes(searchQuery.toLowerCase()) &&
      isAvailable &&
      isWithinGuestLimit
    );
  });

  // Get today's date for disabling past dates
  const today = new Date().toISOString().split("T")[0]; // Format: "YYYY-MM-DD"

  // Handle Check-In Date Change
  const handleCheckInChange = (e) => {
    const newCheckInDate = e.target.value;
    setCheckInDate(newCheckInDate);

    // Reset the check-out date when the check-in date changes
    if (newCheckInDate >= checkOutDate) {
      setCheckOutDate(newCheckInDate); // Reset check-out to the same day as check-in
    }
  };
  // Handle Check-Out Date Change
  const handleCheckOutChange = (e) => {
    setCheckOutDate(e.target.value);
  };
  const resetSearch = () => {
    setSearchQuery("");
    setCheckInDate("");
    setCheckOutDate("");
    setGuests(1);
  };
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      setFavorites(currentUser.favorites); // Load favorites from localStorage
    }
  }, []);

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
                    {user.role === 1 && (
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

        <header className="bg-pink text-white text-center py-5">
          <div className="container">
            <h1 className="display-4">Find Your Perfect Getaway</h1>
            <p className="lead">
              Explore unique stays and experiences around the world
            </p>
          </div>
        </header>

        <section className="container my-5 mb-5">
          <h2 className="mb-4">Search for Your Stay</h2>
          <form className="row g-3" onSubmit={(e) => e.preventDefault()}>
            <div className="col-md-4">
              <label htmlFor="destination" className="form-label">
                Destination (Country)
              </label>
              <input
                type="text"
                className="form-control"
                id="destination"
                placeholder="Enter country"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="check-in" className="form-label">
                Check-in
              </label>
              <input
                type="date"
                className="form-control"
                id="check-in"
                value={checkInDate}
                min={today} // Disable past dates
                onChange={handleCheckInChange} // Reset check-out date when check-in changes
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="check-out" className="form-label">
                Check-out
              </label>
              <input
                type="date"
                className="form-control"
                id="check-out"
                value={checkOutDate}
                min={checkInDate || today} // Ensure check-out date is at least the check-in date
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="guests" className="form-label">
                Guests
              </label>
              <input
                type="number"
                className="form-control"
                id="guests"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
          </form>
          <button className="btn btn-secondary mt-3" onClick={resetSearch}>
            Reset Search
          </button>
        </section>

        <div className="container py-5">
          <h2 className="mb-4">Featured Listings</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {filteredListings.length === 0 ? (
              <div className="col-12">
                <p>No listings found for the selected criteria.</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <div className="col-lg-4 mb-4" key={listing.id}>
                  <div className="card h-100">
                    <img
                      src={listing.imgUrl}
                      className="card-img-top"
                      alt={listing.listingName}
                      style={{ height: "200px", objectFit: "cover" }}
                    />

                    <div className="card-body">
                      <button
                        className="btn btn-link position-absolute top-0 end-0 m-2"
                        onClick={() => handleFavoriteToggle(listing.id)}
                      >
                        <i
                          className={`bi ${favorites.includes(listing.id) ? "bi-heart-fill" : "bi-heart"}`}
                          style={{ fontSize: "1.5rem", color: "red" }}
                        ></i>
                      </button>

                      <h5 className="card-title">
                        {listing.listingName}, {listing.country}
                      </h5>
                      <p className="card-text">
                        {listing.description
                          ? listing.description.substring(0, 100) +
                            (listing.description.length > 100 ? "..." : "")
                          : ""}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          ${listing.pricePerNight} / night
                        </small>
                      </p>

                      <Link
                        to="/view-listing"
                        className="btn btn-pink btn-sm"
                        onClick={() => handleViewListing(listing)}
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
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

export default Home;
