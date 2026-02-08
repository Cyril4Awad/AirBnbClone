import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../index.css";

function UserBookings() {
    const { userId } = useParams();  // Get userId from URL params
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [listings, setListings] = useState([]); // Store the listings fetched
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        navigate("/login"); // Redirect to login if no user is logged in
    }

    // Fetch bookings and their associated listings
    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                // Fetch the bookings for the user
                const res = await fetch(`http://localhost:8000/bookings?userId=${userId}`);
                const data = await res.json();

                // Fetch the associated listings for the bookings
                const listingIds = data.map((booking) => booking.listingId);
                const uniqueListingIds = [...new Set(listingIds)]; // Remove duplicates

                // Fetch listings for each unique listingId
                const listingRes = await Promise.all(
                    uniqueListingIds.map((id) => fetch(`http://localhost:8000/listings/${id}`).then((res) => res.json()))
                );

                // Store both bookings and listings
                setBookings(data);
                setListings(listingRes);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch user bookings:", err);
                setLoading(false);
            }
        };

        fetchUserBookings();
    }, [userId]);

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) {
            return;
        }

        try {
            await fetch(`http://localhost:8000/bookings/${bookingId}`, {
                method: "DELETE",
            });
            setBookings(bookings.filter((booking) => booking.id !== bookingId));  // Remove booking from state
            alert("Booking deleted successfully!");
        } catch (err) {
            console.error("Failed to delete booking:", err);
            alert("Failed to delete booking");
        }
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
                            <li className="nav-item">
                                <Link to="/dashboard" className="nav-link hover-effect">
                                    Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/" className="nav-link hover-effect">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/profile" className="nav-link hover-effect">Profile</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/bookings" className="nav-link hover-effect">Bookings</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/add-listing" className="nav-link hover-effect">Add Listing</Link>
                            </li>
                            <li className="nav-item">
                                <button onClick={() => { localStorage.removeItem("currentUser"); navigate("/login"); }} className="btn btn-pink btn-sm hover-effect">Logout</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container py-5">
                <div className="row">
                    <h2 className="mb-4">Bookings of User {userId}</h2>
                    {loading && <p>Loading...</p>}
                    {bookings.length === 0 && !loading && <p className="text-center py-5">This user has no bookings.</p>}

                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {bookings.map((booking) => {
                            // Find the listing for this booking using the listingId
                            const listing = listings.find((listing) => listing.id === booking.listingId);

                            return (
                                listing && (
                                    <div className="col-lg-4 mb-4" key={booking.id}>
                                        <div className="card h-100">
                                            <img
                                                src={listing.imgUrl || "default-image.jpg"}  // Add default image if imgUrl is missing
                                                className="card-img-top"
                                                alt={listing.listingName || "No Name"}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    {listing.listingName}, {listing.country}
                                                </h5>
                                                <ul className="list-unstyled">
                                                    <li>
                                                        <strong>Address:</strong> {listing.address}
                                                    </li>
                                                    <li>
                                                        <strong>Size:</strong> {listing.size} m²
                                                    </li>
                                                    <li>
                                                        <strong>Bedrooms:</strong> {listing.bedrooms}
                                                    </li>
                                                    <li>
                                                        <strong>Price:</strong> ${listing.pricePerNight} / night
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
                                                        <strong>Created on:</strong> {new Date(booking.createdAt).toLocaleDateString()}
                                                    </li>

                                                </ul>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                >
                                                    Delete Booking
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserBookings;
