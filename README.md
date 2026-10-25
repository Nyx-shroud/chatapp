# Private Chat

A small private one-to-one chat application built with Spring Boot, Spring Security, Spring Data JPA, H2, and a browser-based HTML/CSS/JavaScript interface.

## Requirements

- Java 17 or later
- Maven 3.6 or later

## Run locally

From the project root, start the application:

```sh
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

To build and verify the project:

```sh
mvn clean verify
```

## Use the chat

1. Register an account with a username of 3-32 characters using letters, numbers, `.`, `_`, or `-`.
2. Use a password between 8 and 72 characters.
3. Open the site in another browser or a private/incognito window and register a second account.
4. Log in with one account in each browser session.
5. Select the other account from the contacts list to view history and exchange messages.

The two accounts must be different. Messages are limited to 2,000 characters.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Register with JSON `{"username":"...","password":"..."}` |
| `GET` | `/api/auth/me` | Authenticated | Return the current username |
| `GET` | `/api/chat/users` | Authenticated | List other registered users |
| `GET` | `/api/chat/history/{username}` | Authenticated | Get the conversation with a user |
| `POST` | `/api/chat/send` | Authenticated | Send JSON `{"recipient":"...","content":"..."}` |

The API uses HTTP Basic authentication for authenticated requests. The browser client handles this after login.

## Data storage

The project includes H2 as its database. No external database server is required for local development. The default embedded H2 configuration is intended for development; use a persistent, properly secured database configuration before deploying or relying on data across restarts.

## Project layout

```text
src/
  main/
    java/com/example/privatechat/  Spring Boot application and API
    resources/static/              Browser client (HTML, CSS, JavaScript)
pom.xml                            Maven configuration
```

