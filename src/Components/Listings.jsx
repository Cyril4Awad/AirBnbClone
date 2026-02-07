import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../index.css";
function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload(); // Refresh to update UI
  };

  const handleViewListing = (listing) => {
    localStorage.setItem("currentListing", JSON.stringify(listing));
    navigate("/view-listing");
  };
  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:8000/listings");
      const data = await res.json();
      // Filter listings for the current user
      const userListings = data.filter((listing) => listing.hostId === user.id);
      setListings(userListings);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDeleteListing = async (listing) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await fetch(`http://localhost:8000/listings/${listing.id}`, {
        method: "DELETE",
      });
      fetchListings(); // refresh list
      alert("Listing deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete listing");
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
                    {user.role === "admin" && (
                      <li className="nav-item">
                        <Link
                          to="/dashboard"
                          className="nav-link  hover-effect"
                        >
                          Dashboard
                        </Link>
                      </li>
                    )}

                    <li className="nav-item">
                      <Link to="/" className="nav-link  hover-effect">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link to="/profile" className="nav-link hover-effect">
                        Profile
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
                  navigate("/login")
                )}
              </ul>
            </div>
          </div>
        </nav>
        <div className="container py-5">
          <div className="row">
            <h2 className="mb-4">Your Listings</h2>
            {listings.length === 0 && (
              <p className="text-center py-5">You have no listings yet.</p>
            )}
            <div className="row row-cols-1 row-cols-md-3 g-4">
              <div className="col-lg-12">
                <section className="ftco-section bg-light">
                  <div className="container-fluid px-md-0">
                    <div className="row ">
                      {listings.map((listing) => (
                        <div className="col-lg-4 mb-4" key={listing.id}>
                          <div className="card h-100">
                            <img
                              src={listing.imgUrl}
                              className="card-img-top"
                              alt={listing.listingName}
                              style={{ height: "200px", objectFit: "cover" }}
                            />
                            {/* adress should go next to name */}
                            <div className="card-body">
                              <h5 className="card-title">
                                {listing.listingName}, {listing.country}
                              </h5>

                              {/* description should go here instead of adress */}
                              <p className="card-text">{listing.description}</p>
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
                              <Link
                                to="/listings"
                                className="btn btn-pink btn-sm m-2"
                                onClick={() => handleDeleteListing(listing)}
                              >
                                Delete Listing
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
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

export default Listings;
