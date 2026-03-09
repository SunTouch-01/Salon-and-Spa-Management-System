import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api";

export function SignupPage({ setIsLoggedIn, setCurrentUser, setActiveSalon }) {

  const [accountType, setAccountType] = useState("admin");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (accountType === "staff") {
      setError("Staff accounts are created by admin. Please contact your admin.");
      return;
    }

    const normalizedEmail = formData.email.trim().toLowerCase();

    if (!formData.name || !normalizedEmail || !formData.password) {
      return setError("All fields required");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/signup", {
        name: formData.name,
        email: normalizedEmail,
        password: formData.password
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.removeItem("activeSalon");

      setCurrentUser(user);
      setIsLoggedIn(true);
      if (setActiveSalon) setActiveSalon("");

      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="w-full max-w-md bg-[var(--gray-100)]
                      border border-[var(--border-light)]
                      rounded-2xl shadow-xl p-8">

        <h2 className="text-3xl font-bold mb-2">Sign Up</h2>
        <p className="opacity-70 mb-6">Choose account type</p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3 mb-5">
          <button
            type="button"
            onClick={() => {
              setAccountType("admin");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition
              ${accountType === "admin"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--gray-200)]"}`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => {
              setAccountType("staff");
              setError("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition
              ${accountType === "staff"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--gray-200)]"}`}
          >
            Staff
          </button>
        </div>

        {accountType === "admin" ? (
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              className="input-themed"
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="input-themed"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="input-themed"
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
              className="input-themed"
            />

            <button
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-[var(--border-light)] bg-[var(--background)] p-4 text-sm opacity-80">
            Staff signup is managed by your salon admin. Ask admin/manager to create your staff profile, then login with provided credentials.
          </div>
        )}

        <p className="text-center text-sm opacity-70 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--primary)] font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
