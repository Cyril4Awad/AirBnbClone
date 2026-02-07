import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../index.css";

function ViewListing() {
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().split("T")[0]; // "2026-02-06"

  // Converts the string into a user object
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload(); // Refresh to update UI
  };

  useEffect(() => {
    const storedListing = JSON.parse(localStorage.getItem("currentListing"));

    if (!storedListing) {
      navigate("/");
      return;
    }

    setListing(storedListing);
    setLoading(false);

    const fetchHost = async () => {
      try {
        const hostId = storedListing.hostId;

        const res = await fetch("http://localhost:8000/users");
        const users = await res.json();

        const hostFound = users.find((u) => u.id === hostId);
        setHost(hostFound);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchHost(); // 👈 THIS was missing
  }, [navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    phoneNumber: "",
  });
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    if (!listing) return;

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/bookings?listingId=${listing.id}`
        );
        const data = await res.json();

        // check in check out
        const dates = data.flatMap((booking) => {
          const start = new Date(booking.checkIn);
          const end = new Date(booking.checkOut);
          const range = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            range.push(new Date(d).toISOString().split("T")[0]);
          }

          return range;
        });

        setBookedDates(dates);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };

    fetchBookings();
  }, [listing]);

  const handleBooking = async (e) => {
    e.preventDefault();

    let validationErrors = {};

    // Full name
    if (!formData.fullName.trim()) {
      validationErrors.fullName = "Full name is required";
    }

    // Check-in
    if (!formData.checkIn) {
      validationErrors.checkIn = "Check-in date is required";
    }

    // Check-out
    if (!formData.checkOut) {
      validationErrors.checkOut = "Check-out date is required";
    }

    // Check date logic
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0); // remove time part

      if (checkInDate > checkOutDate) {
        validationErrors.checkOut =
          "Check-out date must be after check-in date";
      }

      if (checkInDate < todayDate) {
        validationErrors.checkIn = "Check-in date cannot be in the past";
      }

      // Check against already booked dates
      const conflict = [];
      for (
        let d = new Date(checkInDate);
        d < checkOutDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        if (bookedDates.includes(dateStr)) {
          conflict.push(dateStr);
        }
      }
      if (conflict.length > 0) {
        validationErrors.checkIn =
          "Some of the selected dates are already booked";
      }
    }

    // Guests
    if (!formData.guests) {
      validationErrors.guests = "Please select number of guests";
    }

    // Phone number
    if (!formData.phoneNumber) {
      validationErrors.phoneNumber = "Phone number is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const newBooking = {
        ...formData,
        userId: user.id,
        listingId: listing.id,
      };

      await fetch("http://localhost:8000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      setLoading(false);
      alert("Booking made successfully");
      navigate("/bookings");
    } catch (err) {
      console.error("Failed to make booking:", err);
      setError("Failed to make booking. Try again.");
    }
  };

  const handleCheckInChange = (e) => {
    const value = e.target.value;

    if (bookedDates.includes(value)) {
      alert("This date is already booked. Please choose another date.");
      return;
    }
    if (value < today) {
      alert("You cannot check in before today.");
      return;
    }
    setFormData({
      ...formData,
      checkIn: value,
      checkOut: "", // reset checkout
    });
  };

  const handleCheckOutChange = (e) => {
    const value = e.target.value;

    //cant make a booking in a reserved range
    const start = new Date(formData.checkIn);
    const end = new Date(value);
    const conflict = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      if (bookedDates.includes(d.toISOString().split("T")[0])) {
        conflict.push(d.toISOString().split("T")[0]);
      }
    }

    if (conflict.length > 0) {
      alert(
        "Some of the selected dates are already booked. Please choose other dates."
      );
      return;
    }

    setFormData({ ...formData, checkOut: value });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading || !listing) {
    return <div className="text-center py-5">Loading listing...</div>;
  }

  return (
    <>
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
                      <Link to="/dashboard" className="nav-link  hover-effect">
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
              ) : (
                navigate("/login")
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="container py-5 min-vh-100">
        <div className="row align-items-start">
          {/* Listing Content */}
          <div className="col-lg-7 mb-4">
            <div className="card shadow-lg border-0">
              {/* Image */}
              <img
                src={listing.imgUrl}
                className="card-img-top"
                alt={listing.listingName}
                style={{ height: "320px", objectFit: "cover" }}
              />

              <div className="card-body">
                {/* Property Type */}
                <span className="badge bg-pink text-dark mb-2">
                  {listing.propertyType}
                </span>

                {/* Title */}
                <h2 className="fw-bold mt-2">{listing.listingName}</h2>

                {/* Host */}
                <p className="text-muted mb-2">
                  Hosted by{" "}
                  <strong>
                    {host ? `${host.fname} ${host.lname}` : "Loading host..."}
                  </strong>
                </p>

                {/* Full Address */}
                <p className="text-muted mb-3">
                  {listing.address}, {listing.city}, {listing.country}
                </p>

                {/* Description */}
                <p className="text-muted">Description:</p>
                <p className="mb-4">{listing.description}</p>

                {/* Info Row */}
                <div className="d-flex flex-wrap gap-3 mb-4 text-muted">
                  <span>{listing.bedrooms} bedrooms</span>
                  <span>{listing.bathrooms} bathrooms</span>
                  <span>{listing.guests} guests</span>
                  <span>{listing.size} m²</span>
                </div>

                <h5>Amenities</h5>
                <ul>
                  {listing.wifi && <li>WiFi</li>}
                  {listing.parking && <li>Parking</li>}
                  {listing.airConditioning && <li>Air Conditioning</li>}
                  {listing.kitchen && <li>Kitchen</li>}
                </ul>

                <hr />

                {/* Listing Creation Date */}
                <p>
                  <strong>Created on:</strong> {formatDate(listing.createdAt)}
                </p>

                {/* Price */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="fw-bold fs-4 ">
                      ${listing.pricePerNight}
                    </span>
                    <span className="text-muted"> / night</span>
                  </div>

                  {listing.cleaningFee && (
                    <span className="text-muted">
                      Cleaning fee: ${listing.cleaningFee}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body">
                <h3 className="mb-4 text-dark">Book Your Getaway</h3>
                <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                      value={formData.fullName}
                      placeholder="Your Full Name"
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                    />
                    {errors.fullName && (
                      <div className="invalid-feedback">{errors.fullName}</div>
                    )}
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6 mb-2 mb-md-0">
                      <DatePicker
                        selected={formData.checkIn ? new Date(formData.checkIn + 'T00:00:00') : null}
                        onChange={(date) => {
                          // Format date locally instead of using ISO
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const localDate = `${year}-${month}-${day}`;

                          setFormData({
                            ...formData,
                            checkIn: localDate,
                            checkOut: "", // reset checkout when checkin changes
                          });
                        }}
                        minDate={new Date()}
                        excludeDates={bookedDates.map((d) => new Date(d + 'T00:00:00'))}
                        placeholderText="Check-in"
                        className={`form-control ${errors.checkIn ? "is-invalid" : ""}`}
                      />
                      {errors.checkIn && (
                        <div className="invalid-feedback">{errors.checkIn}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <DatePicker
                        selected={formData.checkOut ? new Date(formData.checkOut + 'T00:00:00') : null}
                        onChange={(date) => {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const localDate = `${year}-${month}-${day}`;

                          setFormData({
                            ...formData,
                            checkOut: localDate,
                          });
                        }}
                        minDate={formData.checkIn ? new Date(formData.checkIn + 'T00:00:00') : new Date()}
                        excludeDates={bookedDates.map((d) => new Date(d + 'T00:00:00'))}
                        placeholderText="Check-out"
                        className={`form-control ${errors.checkOut ? "is-invalid" : ""}`}
                      />
                      {errors.checkOut && (
                        <div className="invalid-feedback">
                          {errors.checkOut}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <select
                      className={`form-control ${errors.guests ? "is-invalid" : ""}`}
                      value={formData.guests || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guests: Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Select number of guests</option>
                      {listing &&
                        listing.guests &&
                        Array.from(
                          { length: listing.guests },
                          (_, i) => i + 1,
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                    </select>
                    {errors.guests && (
                      <div className="invalid-feedback">{errors.guests}</div>
                    )}
                  </div>

                  <input
                    type="tel"
                    className={`form-control ${errors.phoneNumber ? "is-invalid" : ""} `}
                    value={formData.phoneNumber}
                    placeholder="Phone number"
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phoneNumber: digitsOnly });
                    }}
                  />
                  {errors.phoneNumber && (
                    <div className="invalid-feedback">{errors.phoneNumber}</div>
                  )}

                  <button className="btn btn-pink hover-effect w-100 py-2 fw-bold text-white mt-3">
                    Book Now
                  </button>
                </form>
              </div>

              <div className="mt-4">
                <LoadScript googleMapsApiKey="AIzaSyC1ZNtGH3gfzpzgBhjvUH7ZnL8MeYuM3Po">
                  <GoogleMap
                    mapContainerStyle={{ height: "300px", width: "100%" }}
                    center={{
                      lat: listing.lat,
                      lng: listing.lng,
                    }}
                    zoom={15}
                  >
                    <Marker
                      position={{
                        lat: listing.lat,
                        lng: listing.lng,
                      }}
                    />
                  </GoogleMap>
                </LoadScript>
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

export default ViewListing;
