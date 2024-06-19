import axios from "axios";

const apiKey = "ZCBFTYLPFC8IO4LB"; // Replace with your actual API key
const ticker = "AAPL";
const apiUrl = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${ticker}&apikey=${apiKey}`;

axios
  .get(apiUrl)
  .then((response) => {
    console.log("News Sentiment API Response:", response.data);
  })
  .catch((error) => {
    console.error("Error fetching news sentiment:", error);
  });
