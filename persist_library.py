#!/usr/bin/env python3
import os
import csv
import io
import base64
import argparse
import requests
from typing import List, Dict

# ----- Configuration (env vars recommended) -----
OWNER = os.environ.get("GITHUB_OWNER", "USACE-RMC")
REPO = os.environ.get("GITHUB_REPO", "RMCLakewoodLibrary")
BRANCH = os.environ.get("GITHUB_BRANCH", "main")
FILE_PATH = os.environ.get("LIBRARY_FILE_PATH", "library.csv")
TOKEN = os.environ.get("GITHUB_TOKEN")  # REQUIRED: store securely

API_CONTENT_URL = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{FILE_PATH}"
RAW_URL = f"https://raw.githubusercontent.com/{OWNER}/{REPO}/{BRANCH}/{FILE_PATH}"


# ----- Helpers -----
def require_token():
    if not TOKEN:
        raise RuntimeError("GITHUB_TOKEN environment variable is not set.")


def fetch_current_csv() -> List[Dict[str, str]]:
    """Download and parse the CSV from the repo's raw URL."""
    resp = requests.get(RAW_URL)
    resp.raise_for_status()
    text = resp.text
    reader = csv.DictReader(io.StringIO(text))
    return list(reader)


def write_csv_to_string(rows: List[Dict[str, str]]) -> str:
    """Serialize rows back to CSV string with original headers."""
    if not rows:
        # Default headers if file was empty
        fieldnames = ["Book Title", "Author", "Barcode", "Status", "User"]
    else:
        # Keep headers from the first row keys
        fieldnames = list(rows[0].keys())

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


def get_file_sha() -> str:
    """Fetch the current SHA for the file (required for updates)."""
    require_token()
    headers = {"Authorization": f"token {TOKEN}"}
    params = {"ref": BRANCH}
    resp = requests.get(API_CONTENT_URL, headers=headers, params=params)
    resp.raise_for_status()
    return resp.json()["sha"]


def put_updated_csv(csv_string: str, message: str):
    """Commit updated CSV to GitHub via PUT /contents API."""
    require_token()
    headers = {
        "Authorization": f"token {TOKEN}",
        "Content-Type": "application/json",
    }
    sha = get_file_sha()
    payload = {
        "message": message,
        "content": base64.b64encode(csv_string.encode("utf-8")).decode("utf-8"),
        "sha": sha,
        "branch": BRANCH,
    }
    resp = requests.put(API_CONTENT_URL, headers=headers, json=payload)
    if not resp.ok:
        raise RuntimeError(f"GitHub update failed: {resp.status_code} {resp.text}")
    return resp.json()


def update_book(rows: List[Dict[str, str]], barcode: str, action: str, user_name: str = None) -> bool:
    """
    Update a single book by barcode.
    - action: 'checkout' or 'checkin'
    - checkout requires user_name (non-empty)
    Returns True if a row was updated, False if not found or invalid state.
    """
    updated = False
    for row in rows:
        if row.get("Barcode") == barcode:
            status = row.get("Status", "").strip()
            if action == "checkout":
                if status != "Available":
                    # invalid transition