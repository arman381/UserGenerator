require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/get-user', async (req, res) => {
  try {
    const userResponse = await axios.get('https://randomuser.me/api/');
    const user = userResponse.data.results[0];



    const userData = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      picture: user.picture.large,
      age: user.dob.age,
      dob: new Date(user.dob.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      city: user.location.city,
      country: user.location.country,
      address: `${user.location.street.number} ${user.location.street.name}`
    };

    const countryName = userData.country;

    let countryInfo = { 
      name: countryName,
      capital: 'N/A',
      languages: 'N/A',
      currency: 'N/A',
      flag: `https://flagcdn.com/w320/${countryName.toLowerCase().replace(/\s+/g, '-').substring(0,2)}.png`, // красивый fallback флаг
      exchange: { toUSD: 'N/A', toKZT: 'N/A' }
    };

   try {
  const countryResponse = await axios.get(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`
  );
  const cData = countryResponse.data[0] || {};

  countryInfo.name = cData.name?.common || countryName;
  countryInfo.capital = cData.capital?.[0] || 'N/A';

  if (cData.languages) {
    countryInfo.languages = Object.values(cData.languages).join(', ');
  } else {
    countryInfo.languages = 'N/A';
  }

  if (cData.currencies) {
    const currencyCode = Object.keys(cData.currencies)[0];
    countryInfo.currency = currencyCode || 'N/A';
  } else {
    countryInfo.currency = 'N/A';
  }

  if (cData.flags?.svg) {
    countryInfo.flag = cData.flags.svg;
  } else if (cData.cca2) {
    countryInfo.flag = `https://flagcdn.com/w320/${cData.cca2.toLowerCase()}.png`;
  }
} catch (err) {
  console.error('Restcountries error:', err.message);
}

    if (countryInfo.currency && countryInfo.currency !== 'N/A') {
      try {
        const exchangeResponse = await axios.get(`https://api.exchangerate-api.com/v4/latest/${countryInfo.currency}`);
        const rates = exchangeResponse.data.rates || {};
        countryInfo.exchange.toUSD = rates.USD ? `1 ${countryInfo.currency} = ${rates.USD.toFixed(2)} USD` : 'N/A';
        countryInfo.exchange.toKZT = rates.KZT ? `1 ${countryInfo.currency} = ${rates.KZT.toFixed(2)} KZT` : 'N/A';
      } catch (err) {
        console.error('Exchange error:', err.message);
      }
    }

    let newsArticles = [];
    try {
      const newsResponse = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(countryName)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`
      );
      const articles = newsResponse.data.articles || [];

      const filtered = articles
        .filter(article => article.title && article.title.toLowerCase().includes(countryName.toLowerCase()))
        .slice(0, 5);

      newsArticles = filtered.map(article => ({
        title: article.title || 'No title',
        image: article.urlToImage || '',
        description: article.description || 'No description',
        url: article.url || '#'
      }));
    } catch (err) {
      console.error('News API error:', err.response?.data || err.message);
    }

    res.json({ user: userData, country: countryInfo, news: newsArticles });
  } catch (error) {
    console.error('Critical error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});