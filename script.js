// Load book data from JSON file
async function loadBooks() {
  const response = await fetch("../data/library.json");
  const books = await response.json();
  displayBooks(books);
}

function displayBooks(books) {
  const tbody = document.querySelector("#bookTable tbody");
  tbody.innerHTML = "";

  books.forEach(book => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${book["Book Title"]}</td>
      <td>${book["Author"]}</td>
      <td>${book["Barcode"]}</td>
      <td>${book["Status"]}</td>
      <td>${book["User"] || ""}</td>
      <td>
        ${book["Status"] === "Checked Out" ? `<button onclick="checkInBook('${book["Barcode"]}')">Check In</button>` : ""}
      </td>
    `;

    tbody.appendChild(row);
  });
}
async function checkInBook(barcode) {
  const data = {
    barcode: barcode,
    user: "",           // Clear user on check-in
    action: "checkin"
  };

  await fetch("https://api.github.com/repos/USACE-RMC/RMCLakewoodLibrary/issues", {
    method: "POST",
    headers: {
      "Authorization": "token YOUR_GITHUB_TOKEN",  // Replace with secure proxy or backend
      "Accept": "application/vnd.github.v3+json"
    },
    body: JSON.stringify({
      title: `Book checkin: ${barcode}`,
      body: JSON.stringify(data)
    })
  });

  alert("Book checked in! Refresh to see updates.");
}


// Search functionality
document.getElementById("searchBox").addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase();
  const response = await fetch("../data/library.json");
  const books = await response.json();
  const filtered = books.filter(book =>
    book.Book_Title.toLowerCase().includes(query) ||
    book.Author.toLowerCase().includes(query) ||
    (book.User && book.User.toLowerCase().includes(query))
  );
  displayBooks(filtered);
});

// Submit form (creates GitHub Issue)
document.getElementById("bookForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const barcode = document.getElementById("barcode").value;
  const user = document.getElementById("user").value;
  const action = document.getElementById("action").value;

  const data = { barcode, user, action };

  await fetch("https://api.github.com/repos/USACE-RMC/RMCLakewoodLibrary/issues", {
    method: "POST",
    headers: {
      "Authorization": "token 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",
      "Accept": "application/vnd.github.v3+json"
    },
    body: JSON.stringify({
      title: `Book ${action}: ${barcode}`,
      body: JSON.stringify(data)
    })
  });

  alert("Submitted! Please refresh after a minute to see updates.");
});

loadBooks();
