// script.js

// Define the SharePoint site URL and list name
const siteUrl = "https://usace.dps.mil/sites/TDL-CEIWR-RMC-ALL";
const listName = "LibraryBooks";

// Define your Azure AD credentials
const tenantId = "fc4d76ba-f17c-4c50-b9a7-8f3163d27582"; // Directory (tenant) ID
const clientId = "0aab0c23-5dcf-40c5-80ff-4a35fcbf9d44"; // Application (client) ID
const clientSecret = "4ea6d8e3-d7d4-40cd-8f99-44f91f0df474"; // Client Secret ID
const resource = "https://usace.dps.mil"; // SharePoint resource URL

// Function to obtain an access token
async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      resource: resource
    })
  });

  const data = await response.json();
  if (data.error) {
    console.error("Error obtaining access token:", data.error_description);
    throw new Error(data.error_description);
  }
  return data.access_token;
}

// Fetch books from SharePoint
async function fetchBooks() {
  const accessToken = await getAccessToken(); // Get the access token

  const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`, // Use the access token
      "Accept": "application/json;odata=verbose"
    }
  });

  const data = await response.json();
  return data.d.results;
}

// Render books
async function renderBooks() {
  const books = await fetchBooks();
  const bookList = document.getElementById("books");
  bookList.innerHTML = "";
  books.forEach(book => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.Book_Title}</strong> by ${book.Author} <br>
      Status: ${book.Status} <br>
      User: ${book.User || "N/A"} <br>
      <button onclick="checkOutBook(${book.ID})">Check Out</button>
      <button onclick="checkInBook(${book.ID})">Check In</button>
    `;
    bookList.appendChild(li);
  });
}

// Check out a book
async function checkOutBook(bookId) {
  const userName = prompt("Enter your name:");
  if (!userName) return alert("Name is required!");

  const accessToken = await getAccessToken(); // Get the access token

  await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${bookId})`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`, // Use the access token
      "Accept": "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose"
    },
    body: JSON.stringify({
      Status: "Checked Out",
      User: userName
    })
  });

  alert("Book checked out successfully!");
  renderBooks();
}

// Check in a book
async function checkInBook(bookId) {
  const accessToken = await getAccessToken(); // Get the access token

  await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${bookId})`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`, // Use the access token
      "Accept": "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose"
    },
    body: JSON.stringify({
      Status: "Available",
      User: ""
    })
  });

  alert("Book checked in successfully!");
  renderBooks();
}

// Search books
document.getElementById("search-button").addEventListener("click", async () => {
  const title = document.getElementById("search-title").value.toLowerCase();
  const books = await fetchBooks();
  const filteredBooks = books.filter(book => book.Book_Title.toLowerCase().includes(title));
  renderFilteredBooks(filteredBooks);
});

// Filter books
document.getElementById("filter-button").addEventListener("click", async () => {
  const status = document.getElementById("filter-status").value;
  const user = document.getElementById("filter-user").value.toLowerCase();
  const books = await fetchBooks();
  const filteredBooks = books.filter(book => {
    return (!status || book.Status === status) && (!user || book.User.toLowerCase().includes(user));
  });
  renderFilteredBooks(filteredBooks);
});

// Render filtered books
function renderFilteredBooks(books) {
  const bookList = document.getElementById("books");
  bookList.innerHTML = "";
  books.forEach(book => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.Book_Title}</strong> by ${book.Author} <br>
      Status: ${book.Status} <br>
      User: ${book.User || "N/A"} <br>
      <button onclick="checkOutBook(${book.ID})">Check Out</button>
      <button onclick="checkInBook(${book.ID})">Check In</button>
    `;
    bookList.appendChild(li);
  });
}

// Initial render
renderBooks();