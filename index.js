import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import SimplDB from "simpl.db"; // Importing simpl.db

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Initialize the database
const db = new SimplDB({ filePath: "./database.json" });

// This line lets us use .body method
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Function to check authentication
function checkAuth(user, pass) {
  const userObj = db.get(user); // Retrieve user object from database
  if (userObj) {
    if (userObj.password === pass) {
      return 1; // Successful
    } else {
      return 0; // Wrong password
    }
  } else {
    return 2; // Wrong username
  }
}

// Function to sign up a new user
function authSignUp(user, pass, mail) {
  const newUser = {
    email: mail,
    password: pass,
  };

  if (db.has(user)) {
    throw new Error("User already exists"); // Check if user already exists
  }

  db.set(user, newUser); // Add new user to the database
}

// Function to delete a user
function deleteUser(user) {
  if (db.has(user)) {
    db.delete(user); // Remove user from the database
  } else {
    throw new Error("User does not exist");
  }
}

// Get request for the home page
app.get("/", (req, res) => {
  res.render("auth.ejs");
});

// Get request for the sign-up page
app.post("/sign-up", (req, res) => {
  res.render("signup.ejs");
});

// Post request for handling sign-ups
app.post("/sign-up-successful", (req, res) => {
  try {
    authSignUp(
      req.body["signupUsername"],
      req.body["signupPass"],
      req.body["signupEmail"]
    );
    res.redirect("/"); // Redirect to home page after successful sign-up
  } catch (err) {
    res.send(`<h1> Sign Up Failed: ${err.message} </h1>`); // Handle errors during sign-up
  }
});

// Post request for authentication
app.post("/watchlist", (req, res) => {
  const authResult = checkAuth(req.body["username"], req.body["password"]);
  if (authResult === 1) {
    res.send("<h1> Successful </h1>");
  } else if (authResult === 2) {
    res.send("<h1> Wrong Username </h1>");
  } else if (authResult === 0) {
    res.send("<h1> Wrong Password </h1>");
  } else {
    res.send("<h1> Err </h1>");
  }
});

// Post request for deleting a user (for demonstration)
app.post("/delete-user", (req, res) => {
  try {
    deleteUser(req.body["username"]);
    res.send("<h1> User Deleted </h1>");
  } catch (err) {
    res.send(`<h1> Delete Failed: ${err.message} </h1>`);
  }
});

// Listening port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
