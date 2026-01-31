const express = require("express");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
require("dotenv").config();
const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.email, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.email }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "14d",
  });
}

function saveRefreshToken(userId, tokenHash) {
  const db = readDB();
  db.refreshTokens.push({ userId, tokenHash });
  writeDB(db);
}

const app = express();
app.use(cors());
app.use(express.json());
app.listen(3000);

function readDB() {
  const data = fs.readFileSync("Database.json", "utf8");
  return JSON.parse(data);
}

function writeDB(db) {
  fs.writeFileSync("Database.json", JSON.stringify(db, null, 2));
}
async function addUser(username, password, email) {
  const db = await readDB();
  const userId = Date.now();
  db.users.push({
    id: userId,
    username: username,
    password: password,
    email: email,
    mountain: [
      {
        image: "/Images/Mountain.png",
        days: [],
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

  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
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
    await saveRefreshToken(user.id, hash(refreshToken));
    return res.json({ accessToken });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  const db = readDB();
  const user = db.users.find((u) => u.refreshToken === refreshToken);
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err) => {
    if (err) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});

app.get("/profile", auth, (req, res) => {
  res.json({ message: `Hello ${req.user.username}` });
});
