document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('getUserBtn');
  const userDiv = document.getElementById('userInfo');
  const countryDiv = document.getElementById('countryInfo');
  const newsDiv = document.getElementById('newsInfo');

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    userDiv.innerHTML = '';
    countryDiv.innerHTML = '';
    newsDiv.innerHTML = '';
    userDiv.innerHTML = '<p>Loading user data...</p>';

    try {
      const response = await fetch('/api/get-user');
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      const data = await response.json();

      const u = data.user;
      userDiv.innerHTML = `
        <h2>User Information</h2>
        <div class="card">
          <img src="${u.picture}" alt="Profile Picture" class="profile-img">
          <div class="info">
            <p><strong>First Name:</strong> ${u.firstName}</p>
            <p><strong>Last Name:</strong> ${u.lastName}</p>
            <p><strong>Gender:</strong> ${u.gender}</p>
            <p><strong>Age:</strong> ${u.age}</p>
            <p><strong>Date of Birth:</strong> ${u.dob}</p>
            <p><strong>City:</strong> ${u.city}</p>
            <p><strong>Country:</strong> ${u.country}</p>
            <p><strong>Full Address:</strong> ${u.address}</p>
          </div>
        </div>
      `;

      const c = data.country;
      countryDiv.innerHTML = `
        <h2>Country Information</h2>
        <div class="card">
          ${c.flag ? `<img src="${c.flag}" alt="Flag" class="flag">` : ''}
          <div class="info">
            <p><strong>Country:</strong> ${c.name}</p>
            <p><strong>Capital:</strong> ${c.capital}</p>
            <p><strong>Official Language(s):</strong> ${c.languages}</p>
            <p><strong>Currency:</strong> ${c.currency}</p>
            <p><strong>Exchange Rate:</strong> ${c.exchange.toUSD}</p>
            <p><strong>to KZT:</strong> ${c.exchange.toKZT}</p>
          </div>
        </div>
      `;

      newsDiv.innerHTML = '<h2>News Headlines (containing country name)</h2>';
      if (data.news.length === 0) {
        newsDiv.innerHTML += '<p>No relevant news found for this country.</p>';
      } else {
        data.news.forEach(article => {
          const card = document.createElement('div');
          card.className = 'card news-card';
          card.innerHTML = `
            ${article.image ? `<img src="${article.image}" alt="News" class="news-img">` : ''}
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank" class="read-more">Read full article →</a>
          `;
          newsDiv.appendChild(card);
        });
      }
    } catch (error) {
      userDiv.innerHTML = `<p class="error">Error: ${error.message}. Check console or API keys.</p>`;
      console.error(error);
    } finally {
      btn.disabled = false;
    }
  });
});