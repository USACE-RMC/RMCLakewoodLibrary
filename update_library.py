import json
import csv
import os

# Load issue body from environment variable
issue_body = os.environ["ISSUE_BODY"]
data = json.loads(issue_body)

barcode = data["barcode"]
user = data["user"]
action = data["action"]

# Load library data
with open("data/library.json", "r") as f:
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

# Save updated library data
with open("data/library.json", "w") as f:
    json.dump(books, f, indent=2)

with open("data/library.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["Book Title", "Author", "Barcode", "Status", "User"])
    writer.writeheader()
    writer.writerows(books)