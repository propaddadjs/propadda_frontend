import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const register = async (data: {
  username: string;
  email: string;
  password: string;
  role: "BUYER" | "AGENT";
}) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};
