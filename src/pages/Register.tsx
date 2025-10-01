import { useState } from "react";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "BUYER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await register(form);
    login(res.token, res.role);
    // redirect to dashboard
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
      <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <select onChange={e => setForm({ ...form, role: e.target.value as any })}>
        <option value="BUYER">I want to buy</option>
        <option value="AGENT">I want to sell</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}
