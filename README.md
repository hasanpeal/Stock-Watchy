
# Stock Watchy

Stock Watchy is a web application designed to help users monitor their favorite stocks by adding them to a personalized watchlist. The application provides real-time data and news sentiment analysis for each stock, allowing users to stay updated on the latest market trends and news.

## Features

- **User Authentication**: Secure login and signup functionality.
- **Personalized Watchlist**: Add and manage stocks in your watchlist.
- **Real-time Stock Data**: Displays up-to-date stock information using TradingView widgets.
- **News Sentiment Analysis**: Provides sentiment analysis for the latest news articles related to the stocks in your watchlist, including:
  - **Title**: The title of the news article.
  - **URL**: The URL link to the news article.
  - **Overall Sentiment Score**: The sentiment score of the news article.
  - **Overall Sentiment Label**: The sentiment label (e.g., positive, neutral, negative) of the news article.

## APIs and Data

The application features data from various APIs, including:

1. **Real-time Stock Data**: Integrates TradingView widgets to display live stock data and charts.
2. **News Sentiment Analysis**: Uses the Alpha Vantage API to fetch news articles and their sentiment scores related to the stocks.
3. **Ticker Data**: Utilizes a pre-defined list of stock tickers to help users search and add stocks to their watchlist.

### API Call Optimization

The application optimizes API calls by caching news data for stocks that is less than one week old. If the cached data is available and not older than one week, it uses the cached data instead of making a new API request. This reduces the number of API calls and improves the application's performance.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/hasanpeal/Stock-Watchy.git
   cd Stock-Watchy
   \`\`\`

2. Install the dependencies:

   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:

   \`\`\`plaintext
   API_KEY=your_alpha_vantage_api_key
   \`\`\`

4. Start the application:

   \`\`\`bash
   npm start
   \`\`\`

5. Visit the application in your browser:

   \`\`\`plaintext
   http://localhost:3000
   \`\`\`

### Deployment

The application is deployed on Render. You can access it via the following link:

[Stock Watchy on Render](https://stockwatchy.onrender.com)

## Usage

1. **Sign Up**: Create a new account using your email, username, and password.
2. **Login**: Sign in with your username and password.
3. **Add Stocks**: Use the search box to add stocks to your watchlist by entering their ticker symbols.
4. **View Stock Data**: Click on the stock cards to view real-time data and news sentiment analysis.

## Technologies Used

- **Express.js**: Web framework for Node.js.
- **Bootstrap**: Front-end framework for responsive design.
- **SimplDB**: Lightweight local database for storing user data.
- **Axios**: Promise-based HTTP client for making API requests.
- **EJS**: Embedded JavaScript templating for rendering dynamic content.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any inquiries or issues, please contact:

- **Name**: Peal Hasan
- **GitHub**: [hasanpeal](https://github.com/hasanpeal)
