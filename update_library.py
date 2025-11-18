import json
import csv
import os

# Load issue body from environment variable
issue_body = os.environ["ISSUE_BODY"]
data = json.loads(issue_body)

barcode = data["barcode"]
user = data["user"]
action = data["action"]

# Load library data from the "data" folder
with open("data/library.json", "r") as f:  # Updated path
    books = json.load(f)

# Update book status
for book in books:
    if book["Barcode"] == barcode:
        if action == "checkout":
            book["Status"] = "Checked Out"
            book["User"] = user
        elif action == "checkin":
            book["Status"] = "Available"
            book["User"] = ""

# Save updated library data to the "data" folder
with open("data/library.json", "w") as f:  # Updated path
    json.dump(books, f, indent=2)

with open("data/library.csv", "w", newline="") as f:  # Updated path
    writer = csv.DictWriter(f, fieldnames=["Book Title", "Author", "Barcode", "Status", "User"])
    writer.writeheader()
    writer.writerows(books)