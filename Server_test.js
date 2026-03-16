const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

function generateAccessToken(user) {
  return jwt.sign(
    { email: user.email, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "1m" },
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ email: user.email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "14d",
  });
}

function saveRefreshToken(email, tokenHash) {
  const db = readDB();
  const d = new Date();
  d.setDate(d.getDate() + 14);
  const date = d.toISOString().split("T")[0];
  db.refreshTokens.push({ email, tokenHash, date });
  writeDB(db);
}

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.listen(3000);

function readDB() {
  const data = fs.readFileSync("Database.json", "utf8");
  return JSON.parse(data);
}

function writeDB(db) {
  fs.writeFileSync("Database.json", JSON.stringify(db, null, 2));
}
async function addUser(username, password, email) {
  const d = new Date();
  const date = d.toISOString().split("T")[0];
  const db = await readDB();
  db.users.push({
    username: username,
    password: password,
    email: email,
    mountain: [
      {
        image: "/Images/Mountain.png",
        days: [
          {
            text: "",
            date: date,
          },
        ],
      },
    ],
    character: [
      {
        hair: "/Images/Hair1.png",
        eyes: "/Images/Eyes1.png",
        shirt: "/Images/Shirt1.png",
        pants: "/Images/Pants1.png",
        skin: "/Images/Skin1.png",
        shoes: "/Images/Shoes1.png",
        accessories: "/Images/Accessory1.png",
      },
    ],
  });
  await writeDB(db);
  return null;
}
setInterval(
  () => {
    console.log("Cleaning expired refresh tokens...");
    removeExpiredTokens();
  },
  24 * 60 * 60 * 1000,
);

function findUserByUsername(username) {
  const db = readDB();
  return db.users.find((u) => u.username === username);
}

function findUserByEmail(email) {
  const db = readDB();
  return db.users.find((u) => u.email === email);
}

function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post("/registration", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const usernameExists = await findUserByUsername(username);
    if (usernameExists)
      return res.status(409).json({ error: "Username already exists" });
    const emailExists = await findUserByEmail(email);
    if (emailExists)
      return res.status(409).json({ error: "Email already registered" });
    const passwordHash = bcrypt.hashSync(password, 10);
    await addUser(username, passwordHash, email);
    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user.email, bcrypt.hashSync(refreshToken, 10));
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // cannot be read by JS
      secure: false, // HTTPS only (use false in local dev)
      sameSite: "lax", // CSRF protection
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
    return res.json({ accessToken });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  let decoded; /*
  const decoded = jwt.decode(refreshToken);
  console.log(decoded);
  console.log("Current time:", Math.floor(Date.now() / 1000));*/
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    //console.log("JWT ERROR:", err.message);
    return res.sendStatus(403);
  }

  const db = readDB();
  const validToken = db.refreshTokens.find((t) =>
    bcrypt.compareSync(refreshToken, t.tokenHash),
  );
  if (!validToken) return res.sendStatus(405);

  const user = db.users.find((u) => u.email === decoded.email);
  if (!user) return res.sendStatus(403);
  const newAccessToken = generateAccessToken(user);
  res.json({ accessToken: newAccessToken });
});

app.get("/profile", auth, (req, res) => {
  res.json({ email: req.user.email });
});

app.get("/logout", auth, (req, res) => {
  const db = readDB();
  const email = req.user.email;
  db.refreshTokens = db.refreshTokens.filter((t) => t.email != email);
  writeDB(db);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.sendStatus(200);
});

app.get("/days", auth, (req, res) => {
  const db = readDB();

  const user = db.users.find((u) => u.email === req.user.email);

  if (!user) return res.sendStatus(404);

  const today = new Date().toISOString().split("T")[0];

  const days = user.mountain[0].days;

  if (days[days.length - 1].date !== today) {
    let current = new Date(days[days.length - 1].date);
    while (true) {
      current.setDate(current.getDate() + 1);
      const dateStr = current.toISOString().split("T")[0];

      if (dateStr > today) break;

      days.push({
        date: dateStr,
        text: "",
      });
    }
    /*
    days.push({
      date: today,
      text: "",
    });
    */
    writeDB(db);
  }

  res.json(days);
});

app.post("/note", auth, (req, res) => {
  const db = readDB();
  const { day, text } = req.body;
  const user = db.users.find((u) => u.email === req.user.email);
  if (!user) return res.sendStatus(404);
  const days = user.mountain[0].days;
  days[day].text = text;
  writeDB(db);
  res.sendStatus(200);
});
