# 🔗 URL Shortener – Secure Full-Stack Web Application

A feature-rich and secure URL Shortener built using Node.js, Express.js, Prisma ORM with MySQL, and more. It includes user authentication, form validation, email notifications, and server-side rendering using EJS.

---

## 🚀 Features

- 🔐 **User Authentication** with password hashing using **Argon2**
- 🧾 **Form Validation** with **Zod**
- 🛡️ **Secure Session Management** using **express-session**, **cookie-parser**, and **connect-flash**
- ✉️ **Email Notifications** using **Nodemailer** with responsive MJML templates
- 🔗 **URL Shortening** with unique code generation and redirection
- 🗃️ **MySQL** database management with **Prisma ORM**
- 📄 **EJS** templating for server-side rendering
- 🔑 **JWT-based Authorization**

---

## 🧑‍💻 Tech Stack

| Technology          | Description                            |
| ------------------- | -------------------------------------- |
| **Node.js**         | Runtime environment for server-side JS |
| **Express.js**      | Backend web framework                  |
| **Prisma ORM**      | Type-safe database client for MySQL    |
| **MySQL**           | Relational database                    |
| **EJS**             | Templating engine                      |
| **Zod**             | Schema-based form validation           |
| **Argon2**          | Secure password hashing                |
| **jsonwebtoken**    | User authentication using tokens       |
| **express-session** | Manage user sessions                   |
| **cookie-parser**   | Parse cookies in Express               |
| **connect-flash**   | Flash messages for form feedback       |
| **Nodemailer**      | Send emails                            |
| **MJML**            | Responsive email templates             |

---

## 📦 Installation

### Prerequisites

- Node.js >= 18.x
- MySQL installed and running
- `.env` file with necessary environment variables & I will shared .env.example file

### Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener

# Install dependencies
npm install

# Set up Prisma (after configuring your .env)
npx prisma generate
npx prisma migrate dev

# Start the development server
npm run dev
```
