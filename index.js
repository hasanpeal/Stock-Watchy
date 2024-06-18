import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import SimplDB from "simpl.db"; // Importing simpl.db
import axios from "axios";
import stocks from "stock-ticker-symbol";

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
    stockData: [],
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

app.post("/watchlist/ticker-added", (req, res) => {
  const ticker = req.body["tickerInput"];
  const authName = req.body["authName"]; // Get the username from the form data

  console.log("Ticker Input:", ticker);
  console.log("Auth Name:", authName);

  // Add the ticker to the user's stocks list
  const user = db.get(authName);

  if (user) {
    var stockName = stocks.lookup(ticker);
    var tickerFormat = `${ticker}|1D`;

    console.log("Stock Name:", stockName);
    console.log("Ticker Format:", tickerFormat);

    // Ensure stockData is an array
    if (!Array.isArray(user.stockData)) {
      user.stockData = [];
    }

    // Add the new stock data to the array
    user.stockData.push({ symbol: stockName, ticker: tickerFormat });

    // Log the updated user data
    console.log("Updated User Data:", user);

    // Save the updated user data back to the database
    db.set(authName, user);

    // Manually save the database to the file
    db.save(); // This forces a manual save to ensure data is written to the file

    // Log the database entry to verify
    console.log("Database Entry:", db.get(authName));
  }

  // Redirect to the watchlist page and render with updated data
  res.render("watchlist.ejs", {
    dataBase: db,
    authName: authName,
  });
});


///////

// Post request for handling sign-ups
app.post("/sign-up-successful", (req, res) => {
  try {
    authSignUp(
      req.body["signupUsername"],
      req.body["signupPass"],
      req.body["signupEmail"]
    );
    res.render("auth.ejs", { val: 1 }); // Redirect to home page after successful sign-up
  } catch (err) {
    res.render("auth.ejs", { val: 2 }); // Handle errors during sign-up
  }
});

// Post request for authentication
app.post("/watchlist", async (req, res) => {
  const authResult = checkAuth(req.body["username"], req.body["password"]);
  if (authResult === 1) {
    res.render("watchlist.ejs", {
      dataBase: db,
      authName: req.body["username"],
    });
  } else if (authResult === 2) {
    res.render("auth.ejs", { val: 3 });
  } else if (authResult === 0) {
    res.render("auth.ejs", { val: 4 });
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

// Get request for the sign-up page
app.post("/sign-up", (req, res) => {
  res.render("signup.ejs");
});

// Listening port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
