// filepath: cricket-ui/src/pages/Login.js
import React from "react";

const Login = () => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Sign In</h1>
      <form>
        <input type="email" placeholder="Email" style={{ display: "block", margin: "10px auto" }} />
        <input type="password" placeholder="Password" style={{ display: "block", margin: "10px auto" }} />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default Login;