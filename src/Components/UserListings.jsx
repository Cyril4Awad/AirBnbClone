import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../index.css";
import { BASE_URL } from "../api";

function UserListings() {
  const { userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    navigate("/login"); // Redirect to login if user is not logged in
  }

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/listings`);
        const data = await res.json();

        const userListings = data.filter((listing) => listing.hostId == userId);

        const listingsWithImages = await Promise.all(
          userListings.map(async (listing) => {
            const imgRes = await fetch(
              `${BASE_URL}/ListingImages/${listing.id}`,
            );
            const images = await imgRes.json();

            return {
              ...listing,
              images: images, // array of images
              imgUrl: images.length > 0 ? images[0].imageUrl : "", // first image
            };
          }),
        );

        setListings(listingsWithImages);
        setLoading(false);

      } catch (err) {
        console.error("Failed to fetch images for listing:", listing.id, err);
        return { ...listing, images: [], imgUrl: "" };
        setLoading(false);
      }
    };

    fetchUserListings();
  }, [userId]);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await fetch(`${BASE_URL}/listings/${listingId}`, {
        method: "DELETE",
      });
      setListings(listings.filter((listing) => listing.id !== listingId)); // Remove listing from state
      alert("Listing deleted successfully!");
      navigate("/dashboard")
    } catch (err) {
      console.error("Failed to delete listing:", err);
      alert("Failed to delete listing");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login"); // Redirect to login after logout
  };
  const handleViewListing = (listing) => {
    localStorage.setItem("currentListing", JSON.stringify(listing));
    navigate("/view-listing");
  };

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
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link  hover-effect">
                    Dashboard
                  </Link>
                </li>

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
                  <Link to="/add-listing" className="nav-link  hover-effect">
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
            </ul>
          </div>
        </div>
      </nav>
      <div className="container py-5">
        <div className="row">
          <h2 className="mb-4">Listings of User {userId}</h2>
          {loading && <p>Loading...</p>}
          {listings.length === 0 && !loading && (
            <p className="text-center py-5">This user has no listings.</p>
          )}

          <div className="row row-cols-1 row-cols-md-3 g-4">
            {listings.map((listing) => (
              <div className="col-lg-4 mb-4" key={listing.id}>
                <div className="card h-100">
                  <img
                    src={listing.imgUrl}
                    className="card-img-top"
                    alt={listing.listingName}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {listing.listingName}, {listing.country}
                    </h5>
                    <p className="card-text">{listing.description}</p>
                    <p className="card-text">
                      <small className="text-muted">
                        ${listing.pricePerNight} / night
                      </small>
                    </p>
                    <Link
                      to="/view-listing"
                      className="btn btn-pink btn-sm m-2"
                      onClick={() => handleViewListing(listing)}
                    >
                      View details
                    </Link>
                    <Link
                     
                      className="btn btn-pink btn-sm"
                      onClick={() => handleDeleteListing(listing.id)}
                    >
                      Delete Lisitng
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserListings;
