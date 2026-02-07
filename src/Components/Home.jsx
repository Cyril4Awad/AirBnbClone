import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../index.css";

function Home() {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  //converts the string into a user object
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload(); // Refresh to update UI
  };

  const handleViewListing = (listing) => {
    localStorage.setItem("currentListing", JSON.stringify(listing));
    navigate("/view-listing");
  };

  //getting data from the db.json
  const fetchLisitngs = async () => {
    try {
      //wait till we get an answer for the fetch
      const res = await fetch("http://localhost:8000/listings");
      //read the body of the response from res and parses it to an array of objects
      const data = await res.json();
      setListings(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLisitngs();
  }, []);

  const filteredListings = listings.filter((listing) =>
    listing.country.toLowerCase().includes(searchQuery.toLowerCase()),
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
                      <Link to="/listings" className="nav-link  hover-effect">
                        Listings
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
          <form
            className="row g-3"
            onSubmit={(e) => e.preventDefault()} // prevent page refresh
          >
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
                onChange={(e) => setSearchQuery(e.target.value)} // <-- bind search
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="check-in" className="form-label">
                Check-in
              </label>
              <input type="date" className="form-control" id="check-in" />
            </div>
            <div className="col-md-3">
              <label htmlFor="check-out" className="form-label">
                Check-out
              </label>
              <input type="date" className="form-control" id="check-out" />
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
                value="1"
              />
            </div>
          </form>
        </section>

        <div className="container py-5">
          <h2 className="mb-4">Featured Listings</h2>
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
                          {/* address should go next to name */}
                          <div className="card-body">
                            <h5 className="card-title">
                              {listing.listingName}, {listing.country}
                            </h5>

                            {/* description should go here instead of address */}
                            <p className="card-text">
                              {listing.description
                                ? listing.description.substring(0, 100) +
                                  (listing.description.length > 100
                                    ? "..."
                                    : "")
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
                    ))}
                  </div>
                </div>
              </section>
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

export default Home;
