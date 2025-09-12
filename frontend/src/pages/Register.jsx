import { useState } from "react";
import API from "../services/api";
import { useTranslation } from "react-i18next";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { t } = useTranslation();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert(t("registerSuccess"));
      window.location.href = "/login";
    } catch (err) {
      alert(t("registerFailed"));
    }
  };

  return (
    <div>
      <h2>{t("register")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder={t("name")}
          onChange={handleChange}
          required
        /><br/>
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
        <button type="submit">{t("register")}</button>
      </form>
    </div>
  );
}
