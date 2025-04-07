# URL Shortener - A Modern Web Application

A feature-rich URL shortening service built with modern web technologies, offering secure authentication, dual database support, and real-time analytics.

## ✨ Features

- **URL Shortening**: Convert long URLs into short, memorable links
- **Analytics Tracking**: Monitor click-through rates and access times
- **User Authentication**: JWT-based security with cookie sessions
- **Dual Database Support**: MongoDB + MySQL integration via Prisma ORM
- **Secure Hashing**: Argon2 password encryption for enhanced security
- **Template Rendering**: Dynamic views using EJS templating engine
- **RESTful API**: Endpoints for programmatic URL management

## 🛠️ Technologies Used

- **Backend**: Express.js
- **Databases**: MongoDB (NoSQL) + MySQL (Relational)
- **ORM**: Prisma for unified database access
- **Security**: JWT, Argon2, cookie-parser
- **Templating**: EJS for server-side rendering
- **Validation**: Zod (optional - add if used)
- **Testing**: (Add your testing framework)

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- npm/yarn
- MongoDB Atlas/local instance
- MySQL server

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/yourusername/urlShortener.git
    cd urlShortener
    ```

2.  Install dependencies:

    `npm install`

3.  Configure environment variables (create .env file):

    `I shared .env.example file`

4.  Initialize databases with Prisma:

    ```
    npx prisma generate
    npx prisma migrate dev
    ```

5.  Start the server:

    `npm start`
