// script.js

const siteUrl = "https://your-sharepoint-site-url";
const listName = "YourListName";

// Fetch books from SharePoint
async function fetchBooks() {
  const response = await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
    headers: {
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

  await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${bookId})`, {
    method: "POST",
    headers: {
      "Accept": "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value
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
  await fetch(`${siteUrl}/_api/web/lists/getbytitle('${listName}')/items(${bookId})`, {
    method: "POST",
    headers: {
      "Accept": "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value
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