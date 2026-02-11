import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "../index.css";
import { BASE_URL } from "../api";

function AddListing() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  const [formData, setFormData] = useState({
    listingName: "",
    description: "",
    propertyType: "",

    address: "",
    city: "",
    country: "",

    guests: "",
    bedrooms: "",

    bathrooms: "",

    size: "",

    pricePerNight: "",
    cleaningFee: "",

    imgUrl: "",

    wifi: false,
    parking: false,
    airConditioning: false,
    kitchen: false,

    lat: null,
    lng: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // <-- track field-specific errors

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous error
      setErrors((prev) => ({ ...prev, imgUrl: "" }));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800x600)
        let { width, height } = img;
        const maxWidth = 800;
        const maxHeight = 600;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce until size is acceptable
        let quality = 0.8;
        let compressedDataUrl;
        let attempts = 0;

        const compress = () => {
          compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          const sizeInBytes = compressedDataUrl.length * 0.75; // Approximate base64 to bytes

          if (sizeInBytes > 90000 && quality > 0.1 && attempts < 10) {
            quality -= 0.1;
            attempts++;
            compress();
          } else {
            setFormData((prev) => ({
              ...prev,
              imgUrl: compressedDataUrl,
            }));
          }
        };

        compress();
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const handleMapClick = (e) => {
    setFormData((prev) => ({
      ...prev,
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};
    setLoading(true);

    // Basic info
    if (!formData.listingName.trim())
      validationErrors.listingName = "Listing name is required";

    if (!formData.description.trim())
      validationErrors.description = "Description is required";

    if (!formData.propertyType)
      validationErrors.propertyType = "Property type is required";

    // Location
    if (!formData.address.trim())
      validationErrors.address = "Address is required";

    if (!formData.city.trim()) validationErrors.city = "City is required";

    if (!formData.country.trim())
      validationErrors.country = "Country is required";

    // Capacity
    if (!formData.guests || formData.guests <= 0)
      validationErrors.guests = "Guests must be at least 1";

    if (!formData.bedrooms || formData.bedrooms <= 0)
      validationErrors.bedrooms = "Bedrooms must be at least 1";

    if (!formData.bathrooms || formData.bathrooms <= 0)
      validationErrors.bathrooms = "Bathrooms must be at least 1";

    // Size
    if (!formData.size || formData.size <= 0)
      validationErrors.size = "Size must be greater than 0";

    // Pricing
    if (!formData.pricePerNight || formData.pricePerNight <= 0)
      validationErrors.pricePerNight = "Price per night must be greater than 0";

    if (formData.cleaningFee < 0)
      validationErrors.cleaningFee = "Cleaning fee cannot be negative";

    // Image
    if (!formData.imgUrl.trim()) validationErrors.imgUrl = "Image is required";

    // Coordinates
    if (formData.lat === null || formData.lng === null)
      validationErrors.location = "Please select a location on the map";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const newListing = {
        ...formData,
        hostId: user.id,
        guests: Number(formData.guests),
        bedrooms: Number(formData.bedrooms),

        bathrooms: Number(formData.bathrooms),
        size: Number(formData.size),
        pricePerNight: Number(formData.pricePerNight),
        cleaningFee: Number(formData.cleaningFee || 0),
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(`${BASE_URL}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newListing),
      });
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      const listingId = result.id;

      console.log("Success result:", result);
      alert("Listing created successfully!");
      if (formData.imgUrl) {
        const imageResponse = await fetch(`${BASE_URL}/ListingImages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ListingId: listingId, // must match ListingId
            ImageUrl: formData.imgUrl, // must match ImageUrl
          }),
        });

        if (!imageResponse.ok) {
          const errorText = await imageResponse.text();
          console.error("Failed to save listing image:", errorText);
        } else {
          console.log("Image saved successfully");
        }
      }
      navigate("/listings");
    } catch (err) {
      console.error("Full error:", err);
      setErrors({ general: err.message || "Failed to create listing" });
    } finally {
      setLoading(false);
    }
  };

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const countryCodes = [
    "AF",
    "AL",
    "DZ",
    "AS",
    "AD",
    "AO",
    "AI",
    "AQ",
    "AG",
    "AR",
    "AM",
    "AW",
    "AU",
    "AT",
    "AZ",
    "BS",
    "BH",
    "BD",
    "BB",
    "BY",
    "BE",
    "BZ",
    "BJ",
    "BM",
    "BT",
    "BO",
    "BA",
    "BW",
    "BR",
    "IO",
    "BN",
    "BG",
    "BF",
    "BI",
    "KH",
    "CM",
    "CA",
    "CV",
    "KY",
    "CF",
    "TD",
    "CL",
    "CN",
    "CX",
    "CC",
    "CO",
    "KM",
    "CG",
    "CD",
    "CK",
    "CR",
    "CI",
    "HR",
    "CU",
    "CY",
    "CZ",
    "DK",
    "DJ",
    "DM",
    "DO",
    "EC",
    "EG",
    "SV",
    "GQ",
    "ER",
    "EE",
    "SZ",
    "ET",
    "FK",
    "FO",
    "FJ",
    "FI",
    "FR",
    "GF",
    "PF",
    "GA",
    "GM",
    "GE",
    "DE",
    "GH",
    "GI",
    "GR",
    "GL",
    "GD",
    "GP",
    "GU",
    "GT",
    "GG",
    "GN",
    "GW",
    "GY",
    "HT",
    "HN",
    "HK",
    "HU",
    "IS",
    "IN",
    "ID",
    "IR",
    "IQ",
    "IE",
    "IM",
    "IL",
    "IT",
    "JM",
    "JP",
    "JE",
    "JO",
    "KZ",
    "KE",
    "KI",
    "KP",
    "KR",
    "KW",
    "KG",
    "LA",
    "LV",
    "LB",
    "LS",
    "LR",
    "LY",
    "LI",
    "LT",
    "LU",
    "MO",
    "MG",
    "MW",
    "MY",
    "MV",
    "ML",
    "MT",
    "MH",
    "MQ",
    "MR",
    "MU",
    "YT",
    "MX",
    "FM",
    "MD",
    "MC",
    "MN",
    "ME",
    "MS",
    "MA",
    "MZ",
    "MM",
    "NA",
    "NR",
    "NP",
    "NL",
    "NC",
    "NZ",
    "NI",
    "NE",
    "NG",
    "NU",
    "NF",
    "MK",
    "MP",
    "NO",
    "OM",
    "PK",
    "PW",
    "PS",
    "PA",
    "PG",
    "PY",
    "PE",
    "PH",
    "PL",
    "PT",
    "PR",
    "QA",
    "RO",
    "RU",
    "RW",
    "RE",
    "WS",
    "SM",
    "ST",
    "SA",
    "SN",
    "RS",
    "SC",
    "SL",
    "SG",
    "SX",
    "SK",
    "SI",
    "SB",
    "SO",
    "ZA",
    "SS",
    "ES",
    "LK",
    "SD",
    "SR",
    "SE",
    "CH",
    "SY",
    "TW",
    "TJ",
    "TZ",
    "TH",
    "TL",
    "TG",
    "TO",
    "TT",
    "TN",
    "TR",
    "TM",
    "TC",
    "TV",
    "UG",
    "UA",
    "AE",
    "GB",
    "US",
    "UY",
    "UZ",
    "VU",
    "VE",
    "VN",
    "VG",
    "VI",
    "WF",
    "EH",
    "YE",
    "ZM",
    "ZW",
  ];

  const countries = countryCodes.map((code) => regionNames.of(code));

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
                  <li className="nav-item">
                    <Link to="/" className="nav-link  hover-effect">
                      Home
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li className="nav-item">
                      <Link to="/dashboard" className="nav-link  hover-effect">
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
                    <button
                      onClick={handleLogout}
                      className="btn btn-pink btn-sm hover-effect"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                navigate("/")
              )}
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow">
              <div className="card-header bg-pink text-white text-center">
                <h1 className="mb-0">Add Your Listing</h1>
              </div>
              <div className="card-body p-4">
                {errors.general && (
                  <div className="alert alert-danger">{errors.general}</div>
                )}

                <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
                  {/** Example input with inline error */}
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      name="listingName"
                      className={`form-control ${
                        errors.listingName ? "is-invalid" : ""
                      }`}
                      value={formData.listingName}
                      onChange={handleChange}
                    />
                    {errors.listingName && (
                      <div className="invalid-feedback">
                        {errors.listingName}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      name="description"
                      className={`form-control ${errors.description ? "is-invalid" : ""}`}
                      value={formData.description}
                      onChange={handleChange}
                      maxLength={500} // limit to 500 characters
                      rows={5} // show 5 lines by default
                      placeholder="Write a description (max 500 characters)"
                    />
                    <div className="form-text">
                      {formData.description.length} / 500 characters
                    </div>
                    {errors.description && (
                      <div className="invalid-feedback">
                        {errors.description}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Property Type</label>
                    <select
                      name="propertyType"
                      className={`form-control ${errors.propertyType ? "is-invalid" : ""}`}
                      value={formData.propertyType}
                      onChange={handleChange}
                    >
                      <option value="">Select a property type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="House">House</option>
                      <option value="Villa">Villa</option>
                      <option value="Cabin">Cabin</option>
                      <option value="Studio">Studio</option>
                    </select>
                    {errors.propertyType && (
                      <div className="invalid-feedback">
                        {errors.propertyType}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className={`form-control ${errors.address ? "is-invalid" : ""}`}
                      value={formData.address}
                      onChange={handleChange}
                    />
                    {errors.address && (
                      <div className="invalid-feedback">{errors.address}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className={`form-control ${errors.city ? "is-invalid" : ""}`}
                      value={formData.city}
                      onChange={handleChange}
                    />
                    {errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <select
                        name="country"
                        className={`form-control ${errors.country ? "is-invalid" : ""}`}
                        value={formData.country}
                        onChange={handleChange}
                      >
                        <option value="">Select a country</option>
                        {countries.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>

                      {errors.country && (
                        <div className="invalid-feedback">{errors.country}</div>
                      )}
                    </div>

                    {errors.country && (
                      <div className="invalid-feedback">{errors.country}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Guests</label>
                    <input
                      type="number"
                      name="guests"
                      className={`form-control ${errors.guests ? "is-invalid" : ""}`}
                      value={formData.guests}
                      onChange={handleChange}
                      min="1"
                    />
                    {errors.guests && (
                      <div className="invalid-feedback">{errors.guests}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      className={`form-control ${errors.bedrooms ? "is-invalid" : ""}`}
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="1"
                    />
                    {errors.bedrooms && (
                      <div className="invalid-feedback">{errors.bedrooms}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      className={`form-control ${errors.bathrooms ? "is-invalid" : ""}`}
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="1"
                    />
                    {errors.bathrooms && (
                      <div className="invalid-feedback">{errors.bathrooms}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Size (m²)</label>
                    <input
                      type="number"
                      name="size"
                      className={`form-control ${errors.size ? "is-invalid" : ""}`}
                      value={formData.size}
                      onChange={handleChange}
                      min="50"
                    />
                    {errors.size && (
                      <div className="invalid-feedback">{errors.size}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Amenities</label>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="wifi"
                        className="form-check-input"
                        checked={formData.wifi || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            wifi: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">Wi-Fi</label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="parking"
                        className="form-check-input"
                        checked={formData.parking || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parking: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">Parking</label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="airConditioning"
                        className="form-check-input"
                        checked={formData.airConditioning || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            airConditioning: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">
                        Air Conditioning
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="kitchen"
                        className="form-check-input"
                        checked={formData.kitchen || false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            kitchen: e.target.checked,
                          }))
                        }
                      />
                      <label className="form-check-label">Kitchen</label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Price ($)</label>
                    <input
                      type="number"
                      name="pricePerNight"
                      className={`form-control ${errors.pricePerNight ? "is-invalid" : ""}`}
                      value={formData.pricePerNight}
                      onChange={handleChange}
                      min="10"
                    />
                    {errors.pricePerNight && (
                      <div className="invalid-feedback">
                        {errors.pricePerNight}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Cleaning fee ($)</label>
                    <input
                      type="number"
                      name="cleaningFee"
                      className={`form-control ${errors.cleaningFee ? "is-invalid" : ""}`}
                      value={formData.cleaningFee}
                      onChange={handleChange}
                      min="0"
                    />
                    {errors.cleaningFee && (
                      <div className="invalid-feedback">
                        {errors.cleaningFee}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Upload Image</label>
                    <input
                      type="file"
                      className={`form-control ${errors.imgUrl ? "is-invalid" : ""}`}
                      onChange={handleImage}
                      accept="image/*"
                    />
                    {errors.imgUrl && (
                      <div className="invalid-feedback">{errors.imgUrl}</div>
                    )}
                  </div>

                  {formData.imgUrl && (
                    <div className="mb-3 text-center">
                      <img
                        src={formData.imgUrl}
                        alt="Preview"
                        style={{ maxHeight: "200px", maxWidth: "100%" }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}

                  {/* Google Maps */}
                  <div className="mb-3">
                    <label className="form-label">Pick Location on Map</label>
                    <LoadScript googleMapsApiKey="AIzaSyC1ZNtGH3gfzpzgBhjvUH7ZnL8MeYuM3Po">
                      <GoogleMap
                        mapContainerStyle={{ height: "300px", width: "100%" }}
                        center={{
                          lat: formData.lat || 33.8938,
                          lng: formData.lng || 35.5018,
                        }} // default Beirut
                        zoom={12}
                        onClick={handleMapClick}
                      >
                        {formData.lat && formData.lng && (
                          <Marker
                            position={{ lat: formData.lat, lng: formData.lng }}
                          />
                        )}
                      </GoogleMap>
                    </LoadScript>

                    {/* Show selected coordinates */}
                    {formData.lat && formData.lng && (
                      <p className="mt-2 text-center">
                        Selected: Lat {formData.lat.toFixed(5)}, Lng{" "}
                        {formData.lng.toFixed(5)}
                      </p>
                    )}

                    {/* Inline error */}
                    {errors.location && (
                      <div className="text-danger mt-1">{errors.location}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-pink w-100"
                    disabled={loading}
                  >
                    {loading ? "Adding..." : "Add Listing"}
                  </button>
                </form>
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

export default AddListing;
