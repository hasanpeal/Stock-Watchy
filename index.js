import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import SimplDB from "simpl.db"; // Importing simpl.db
import axios from "axios";
import stocks from "stock-ticker-symbol";
import fs from "fs";
import { title } from "process";
import { url } from "inspector";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Initialize the database
const db = new SimplDB({ filePath: "./database.json" });
const tickerData = JSON.parse(
  fs.readFileSync(__dirname + "/tickerToName.json", "utf8")
);

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

// Post request to add a ticker to the watchlist
app.post("/watchlist/ticker-added", async (req, res) => {
  const ticker = req.body["tickerInput"];
  const authName = req.body["authName"]; // Get the username from the form data
  const apiKey = "KF70Z8IX6PEDKNGP"; // Replace with your actual API key
  const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${apiKey}&sort=LATEST`;

  let title, url, overall_sentiment_score, overall_sentiment_label;
  const user = db.get(authName);
  const currentTimestamp = new Date().getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // One week in milliseconds

  // Initialize user's stockCache if it doesn't exist
  if (!user.stockCache) {
    user.stockCache = {};
  }

  // Check if we have cached data and it's not older than one week
  if (user.stockCache[ticker] && (currentTimestamp - user.stockCache[ticker].timestamp) < oneWeek) {
    console.log("Existing data used");
    const cachedData = user.stockCache[ticker].data;
    ({ title, url, overall_sentiment_score, overall_sentiment_label } = cachedData);

    console.log("Using cached data:");
    console.log("Title:", title);
    console.log("URL:", url);
    console.log("Overall Sentiment Score:", overall_sentiment_score);
    console.log("Overall Sentiment Label:", overall_sentiment_label);
  } else {
    try {
      const result = await axios.get(apiUrl);
      console.log(result.data);

      // Access a random article from the feed array
      const feed = result.data.feed;
      if (feed && feed.length > 0) {
        var stockNames = stocks.lookup(ticker).split(/[\s,.]/)[0];
        const articlesWithSymbol = feed.filter(article => article.title.includes(stockNames) || article.summary.includes(ticker));

        let randomArticle;
          if (articlesWithSymbol.length > 0) {
            randomArticle = articlesWithSymbol[Math.floor(Math.random() * articlesWithSymbol.length)];
          } else {
            console.log("No articles found mentioning the stock symbol. Selecting a random article.");
            randomArticle = feed[Math.floor(Math.random() * feed.length)];
          }
          ({ title, url, overall_sentiment_score, overall_sentiment_label } = randomArticle);
          console.log("Random Article:");
          console.log("Title:", title);
          console.log("URL:", url);
          console.log("Overall Sentiment Score:", overall_sentiment_score);
          console.log("Overall Sentiment Label:", overall_sentiment_label);

          // Cache the data
          user.stockCache[ticker] = {
            data: { title, url, overall_sentiment_score, overall_sentiment_label },
            timestamp: currentTimestamp
          };

          // Save the updated user data back to the database
          db.set(authName, user);
          db.save(); // Manually save the database
      } else {
        console.log("No articles found in the feed.");
      }
    } catch (error) {
      console.error("Error fetching news sentiment:", error);
      return res.status(500).send("Error fetching news sentiment");
    }
  }

  console.log("Ticker Input:", ticker);
  console.log("Auth Name:", authName);

  // Add the ticker to the user's stocks list
  if (user) {
    var stockName = stocks.lookup(ticker).split(/[\s,.]/)[0];
    var tickerFormat = `${ticker}|1D`;

    console.log("Stock Name:", stockName);
    console.log("Ticker Format:", tickerFormat);

    // Ensure stockData is an array
    if (!Array.isArray(user.stockData)) {
      user.stockData = [];
    }

    // Check if the stock is already in the list
    const stockExists = user.stockData.some(stock => stock.symbol === stockName);

    if (!stockExists) {
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
    } else {
      console.log("Stock already in the list.");
    }
  }

  // Redirect to the watchlist page and render with updated data
  res.render("watchlist.ejs", {
    dataBase: db,
    authName: authName,
    apiTitle: title,
    apiLink: url,
    apiScore: overall_sentiment_score,
    apiLabel: overall_sentiment_label,
    stockCache: user.stockCache,
    tickers: Object.keys(tickerData),
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
    const user = db.get(req.body["username"]);
    const stockCache = user.stockCache || {};

    res.render("watchlist.ejs", {
      dataBase: db,
      authName: req.body["username"],
      stockCache: stockCache,
      tickers: Object.keys(tickerData),
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

// Post request to delete a ticker from the watchlist
app.post("/watchlist/delete-ticker", (req, res) => {
  const ticker = req.body["ticker"];
  const authName = req.body["authName"]; // Get the username from the form data

  // Get the user data
  const user = db.get(authName);

  if (user) {
    // Remove the stock from the user's stocks list
    user.stockData = user.stockData.filter(stock => stock.symbol !== ticker);

    // Log the updated user data
    console.log("Updated User Data:", user);

    // Save the updated user data back to the database
    db.set(authName, user);

    // Manually save the database to the file
    db.save(); // This forces a manual save to ensure data is written to the file

    // Log the database entry to verify
    console.log("Database Entry:", db.get(authName));
  }

  // Render the watchlist page with updated data
  res.render("watchlist.ejs", {
    dataBase: db,
    authName: authName,
    stockCache: user.stockCache,
    tickers: Object.keys(tickerData),
  });
});


// Listening port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
