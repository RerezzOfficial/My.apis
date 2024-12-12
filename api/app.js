const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Simulasi penyimpanan sesi login
let loggedInUser = null;

// Route: Dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "dashboard.html"));
});

// Route: Halaman Login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
});

// Route: Proses Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, "../akun.json"), "utf8"));

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    loggedInUser = user;
    res.redirect("/menu");
  } else {
    res.send("<h1>Login Gagal!</h1><a href='/login'>Coba Lagi</a>");
  }
});

// Route: Halaman Menu Utama
app.get("/menu", (req, res) => {
  if (loggedInUser) {
    res.sendFile(path.join(__dirname, "../views", "menu.html"));
  } else {
    res.redirect("/");
  }
});

// Route: Logout
app.get("/logout", (req, res) => {
  loggedInUser = null;
  res.redirect("/");
});

module.exports = app;
