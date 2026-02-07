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
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isvalid = true;
    let validationErrors = {};

    if (!formData.fname) validationErrors.fname = "First name is required";
    if (!formData.lname) validationErrors.lname = "Last name is required";

    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    if (formData.cpassword !== formData.password) {
      validationErrors.cpassword = "Passwords do not match";
    }

    setErrors(validationErrors);

    // in case of no errors
    if (Object.keys(validationErrors).length === 0) {
      try {
        //fetching all users
        const res = await fetch("http://localhost:8000/users");
        const users = await res.json();

        // Check if email already exists
        const emailTaken = users.some((user) => user.email === formData.email);
        if (emailTaken) {
          setErrors({ email: "Email is already registered" });
          return;
        }

        //destructuring
        const { cpassword, ...userData } = formData; // don't save cpassword
        // everyone is a user only admin@gmail.com is admin
        userData.role = "user";

        //adding user data to the json file
        await fetch("http://localhost:8000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        setIsLoading(true);

        //setting the delay for the loading page
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

                {/* Printing the errror on the form */}
                {Object.keys(errors).length > 0 && (
                  <div className="alert alert-danger">
                    {Object.values(errors).map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <input
                    className="form-control mb-3"
                    placeholder="First Name"
                    onChange={(e) =>
                      setFormData({ ...formData, fname: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-3"
                    placeholder="Last Name"
                    onChange={(e) =>
                      setFormData({ ...formData, lname: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-3"
                    placeholder="Email"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Password"
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Confirm Password"
                    onChange={(e) =>
                      setFormData({ ...formData, cpassword: e.target.value })
                    }
                  />

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
