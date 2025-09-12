import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { t } = useTranslation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      alert(t("loginSuccess"));
      window.location.href = "/appointments"; 
    } catch (err) {
      alert(t("loginFailed"));
    }
  };

  return (
    <div>
      <h2>{t("login")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder={t("email")}
          onChange={handleChange}
          required
        /><br/>
        <input
          name="password"
          type="password"
          placeholder={t("password")}
          onChange={handleChange}
          required
        /><br/>
        <button type="submit">{t("login")}</button>
      </form>
    </div>
  );
}
