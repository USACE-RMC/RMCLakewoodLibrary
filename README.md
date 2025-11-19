# 📚 Library Management System

A simple library book management system hosted on GitHub Pages with GitHub Actions.

## Features
- Check out / check in books
- Search by Title, Author, or User
- Data stored in `library.json` and `library.csv`
- GitHub Actions automatically update data when users submit

## Setup
1. Fork/clone this repo.
2. Replace `USERNAME/REPO` in `frontend/script.js` with your repo details.
3. Add a GitHub token with `repo` scope.
4. Enable GitHub Pages (serve `/frontend`).
5. Commit and push — you’re live!

---
name: 📚 Library Update
about: Submit a request to check out or check in a book
title: "Library Update Request"
labels: library
assignees: ''
---

Please fill out the JSON below with the correct values.  
⚠️ Do not change the field names (`barcode`, `user`, `action`).  

```json
{
  "barcode": "2010000000007",
  "user": "John Doe",
  "action": "checkout"
}
