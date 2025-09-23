import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { loginUser } from "@/api/User";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // const response = await fetch(`${BACKEND_URL}/auth/login`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     email,
      //     password,
      //   }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || "Login failed");
      // }

      const data = await loginUser(email,password)

      if (data.token) {
        login(data.token, data.user);
      } else {
        throw new Error("Token not found in response.");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img className="login-icon" src="RLION.jpg" height={150} />
          <p className="login-subtitle">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <TextField
              id="outlined-basic"
              type="email"
              required
              label="Email"
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <TextField
              id="outlined-basic"
              type="password"
              required
              label="Password"
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} size="large" variant="contained">{loading ? "Signing in..." : "Sign In"}</Button>

        </form>
      </div>
    </div>
  );
}
