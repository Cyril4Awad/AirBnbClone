import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BASE_URL } from "../api";

function Favorites() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const user = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload();
  };

  const handleFavoriteToggle = async (listingId) => {
    if (!user) return;

    const isFavorite = favorites.includes(listingId);

    try {
      if (isFavorite) {
        // REMOVE
        await fetch(
          `${BASE_URL}/userfavorites/${Number(user.id)}/${Number(listingId)}`,
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
            userId: Number(user.id),
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

  const favoriteListings = listings.filter((listing) =>
    favorites.includes(listing.id),
  );

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
                <li className="nav-item">
                  <Link to="/" className="nav-link hover-effect">
                    Home
                  </Link>
                </li>

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
        <div className="container py-5">
          <h2 className="mb-4">Favorites Listings</h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {favoriteListings.length === 0 ? (
              <div className="col-12">
                <p>No listings found in your favorites.</p>
              </div>
            ) : (
              favoriteListings.map((listing) => (
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

export default Favorites;
