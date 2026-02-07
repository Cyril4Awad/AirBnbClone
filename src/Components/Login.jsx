import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Loading from "./Loading";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError("");

    let validationErrors = {};
    if (!formData.email) validationErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      validationErrors.email = "Invalid email format";

    if (!formData.password) {
      validationErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        // Fetch all users from the API
        const res = await fetch("http://localhost:8000/users");
        const users = await res.json();
        //check to see if it matches any of the users
        const user = users.find(
          (u) => u.email === formData.email && u.password === formData.password
        );

          //setting the user who logged in as a currentUser to use it later
        if (user) {
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

          setIsLoading(true);


          if (user.role === "admin") {
            navigate("/dashboard");
          }
          else {
            setTimeout(() => {
              navigate("/");
            }, 1000);

          }



        } else {
          setError("Invalid email or password");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to connect to server. Make sure json-server is running.");
      }
    }
  };
//loading while still in login page waiting for the timeout
  if (isLoading) {
    return <Loading message="Loading your page..." />;
  }

  return (
    <section className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <h3 className="text-center mb-4">Login</h3>
              {/* writing all the erros occured in the form */}
                {Object.keys(errors).length > 0 && (
                  <div className="alert alert-danger">
                    {Object.values(errors).map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </div>
                )}

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <input
                    className="form-control mb-3"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    className="form-control mb-3"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button className="btn btn-success w-100 mb-3">Log in</button>

                  <div className="text-center">
                    <span>Don't have an account? </span>
                    <Link to="/registration" className="text-decoration-none">
                      Register here
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

export default Login;
