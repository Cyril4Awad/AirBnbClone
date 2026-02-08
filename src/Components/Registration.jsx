import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Loading from "./Loading";

function Registration() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
    cpassword: "",
    phone: "",
    countryCode: "+1", // Default country code (US)
    age: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    // Validate names
    if (!formData.fname) validationErrors.fname = "First name is required";
    if (!formData.lname) validationErrors.lname = "Last name is required";

    // Validate email
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }

    // Validate password
    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    // Validate confirm password
    if (formData.cpassword !== formData.password) {
      validationErrors.cpassword = "Passwords do not match";
    }

    // Validate phone number (Country code + number format)
    if (!formData.phone) {
      validationErrors.phone = "Phone number is required";
    } else if (!/^\d{8,15}$/.test(formData.phone)) {
      validationErrors.phone = "Phone number must be between 8 and 15 digits";
    }

    // Validate age (should be a number between 18 and 120)
    if (!formData.age) {
      validationErrors.age = "Age is required";
    } else if (isNaN(formData.age) || formData.age < 18 || formData.age > 120) {
      validationErrors.age = "Age must be a number between 18 and 120";
    }

    setErrors(validationErrors);

    // In case of no errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        // Fetching all users
        const res = await fetch("http://localhost:8000/users");
        const users = await res.json();

        // Check if email already exists
        const emailTaken = users.some((user) => user.email === formData.email);
        if (emailTaken) {
          setErrors({ email: "Email is already registered" });
          return;
        }

        // Destructuring
        const { cpassword, countryCode, ...userData } = formData; // Don't save cpassword and countryCode
        userData.role = "user";

        // Adding user data to the JSON file
        await fetch("http://localhost:8000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        setIsLoading(true);

        // Setting the delay for the loading page
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } catch (err) {
        console.error(err);
        alert("Failed to register user");
      }
    }
  };

  if (isLoading) {
    return <Loading message="Registration successful! Redirecting..." />;
  }

  return (
    <section className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <h3 className="text-center mb-4">Create Account</h3>

                <form onSubmit={handleSubmit}>
                  {/* First Name */}
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="First Name"
                      onChange={(e) =>
                        setFormData({ ...formData, fname: e.target.value })
                      }
                    />
                    {errors.fname && (
                      <div className="text-danger mt-1">{errors.fname}</div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="Last Name"
                      onChange={(e) =>
                        setFormData({ ...formData, lname: e.target.value })
                      }
                    />
                    {errors.lname && (
                      <div className="text-danger mt-1">{errors.lname}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="Email"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <div className="text-danger mt-1">{errors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    {errors.password && (
                      <div className="text-danger mt-1">{errors.password}</div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm Password"
                      onChange={(e) =>
                        setFormData({ ...formData, cpassword: e.target.value })
                      }
                    />
                    {errors.cpassword && (
                      <div className="text-danger mt-1">{errors.cpassword}</div>
                    )}
                  </div>

                  {/* Country Code and Phone */}
                  <div className="d-flex mb-3">
                    {/* Country Code Select Dropdown */}
                    <select
                      className="form-control me-2"
                      value={formData.countryCode}
                      onChange={(e) =>
                        setFormData({ ...formData, countryCode: e.target.value })
                      }
                    >
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+91">+91 (India)</option>
                      <option value="+33">+33 (France)</option>
                      <option value="+961">+961 (Lebanon)</option>
                      {/* Add more country codes as needed */}
                    </select>
                    {/* Phone Number Input */}
                    <input
                      className="form-control"
                      placeholder="Phone Number"
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    {errors.phone && (
                      <div className="text-danger mt-1">{errors.phone}</div>
                    )}
                  </div>

                  {/* Age */}
                  <div className="mb-3">
                    <input
                      className="form-control"
                      placeholder="Age"
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                    />
                   
                  </div>
                      <span className="row"> {errors.age && (
                      <div className="row text-danger mt-1">{errors.age}</div>
                    )}</span>
                  <button className="btn btn-success w-100 mb-3">
                    Register
                  </button>

                  <div className="text-center">
                    <span>Already have an account? </span>
                    <Link to="/login" className="text-decoration-none">
                      Login here
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Registration;
