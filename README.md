
---

## 9. `library-frontend`

**Repository About description:**  
> React frontend application for the Library Management System. Provides UI for books, members, and borrowing orders.

```markdown
# Library Frontend

## Mandatory Information

- **Student Name**: [B.K.Harsha Nimeda Sirithunga]
- **Student Number**: [2301691058]
- **Slack Handle**: [@Harsha Nimeda]
- **GCP Project ID**: [indigo-splice-491917-q2]

## Project Description

This is the **React**-based user interface for the Library Management System. It communicates with the backend microservices through the API Gateway (`http://localhost:8080`). The frontend provides three main sections:

- **Books** – View all books, add new books, delete books.
- **Members** – Register members, view member list, delete members.
- **Orders** – Borrow a book (select member and book), view all orders, return books.

## Technology Stack

- React JS
- Axios (HTTP client)
- React Router DOM v6
- CSS (basic styling)

## Setup / Getting Started Instructions

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Backend services running (API Gateway on port 8080, plus all microservices)

### Installation

```bash
git clone https://github.com/harsha2531/library-frontend.git
cd library-frontend
npm install
