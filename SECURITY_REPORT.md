# Security Assessment and API Review Report

Demo Credit is an MVP wallet service, so I approached security with two goals in mind: protect the important wallet actions within the scope of the assessment, and avoid pretending this is a production-grade authentication system. The requirement allowed faux token authentication, so I kept the auth layer intentionally simple while still enforcing user ownership around money movement.

## Securing the API Endpoints

The API is split into clear resource areas: users, wallets, and transactions. Public user routes allow account creation and profile lookup, while wallet and transaction routes are protected because they deal with balance changes or private financial history.

For protected routes, the client must send a faux token using either:

```http
x-user-id: <user-id>
```

or:

```http
Authorization: Bearer <user-id>
```

The middleware checks that the id is a valid UUID, confirms that the user exists, and blocks blacklisted users from accessing wallet functionality. After that, the authorization middleware confirms that the authenticated user id matches the `:userId` in the route. This prevents a user from calling another user's wallet or transaction history endpoint by changing the URL.

The app also uses Helmet for baseline HTTP header protection, CORS configuration, centralized error handling, and route-level validators to reject bad input before it reaches business logic.

## Authentication and Authorization Approach

I used faux token authentication because the assessment explicitly says a full authentication system is not required. I treated the user id as the token, but I did not leave it unchecked. The API verifies that the token belongs to an existing user before allowing access.

Authorization is ownership-based. For example, if a request is made to:

```http
POST /api/wallets/:userId/withdraw
```

the `:userId` must match the faux token user id. This is simple, but it is enough to demonstrate the intended security boundary for the MVP: a user can only operate on their own wallet and view their own transaction history.

Blacklisted users are also blocked from wallet actions. This protects the system after onboarding too, not only during account creation.

## Potential Vulnerabilities Considered

The first vulnerability I considered was unauthorized wallet access. Without authentication, any caller could pass another user's id in the URL. The faux auth middleware mitigates this by verifying both identity and route ownership.

The second concern was insufficient balance or race conditions during withdrawals and transfers. Wallet balance changes are handled inside database transactions, and the repository locks wallet rows before debiting. This helps prevent two simultaneous withdrawals from spending the same balance.

The third concern was incomplete audit history. Wallet systems need traceability, so every fund, withdrawal, and transfer writes to the `transactions` table. Transfers create two ledger rows with the same reference: one debit for the sender and one credit for the recipient. This makes the money movement easier to trace and debug.

The fourth concern was onboarding blacklisted users. The user creation flow checks Lendsqr Adjutor Karma using the user's email and phone number. If a match is found, onboarding is rejected.

Finally, I considered data leakage. Password hashes are stored but never returned in API responses. User responses expose only the fields needed by the client.

## Input Validation and Backend Protection

Each module has small validators close to its routes. User creation validates required fields, email format, phone number presence, and minimum password length. Wallet routes validate UUID route parameters and ensure amounts are numeric and greater than zero. Transfer requests also validate the recipient user id.

This keeps invalid requests out of the service layer and makes the API behavior predictable. The service layer still performs business checks such as:

- user exists
- user is not blacklisted
- wallet is active
- sender has enough balance
- sender is not transferring to themselves

Those checks protect backend functionality even if a request passes basic shape validation.

## Error Handling, Logging, and Reliability

Errors are handled through a central error middleware. Known application errors return clear messages and HTTP status codes. Unexpected errors return a generic internal server error response, while the logger records the underlying issue.

For debugging, the code is organized so a failure can be traced through the request path: route validator, controller, service rule, repository query, and database state. For example, if a transfer fails, I would check the authenticated user id, sender wallet balance, requested amount, transaction result, and whether ledger rows were created.

This structure makes the application easier to inspect without scattering logs or business rules across unrelated files.

## Production Security Improvements

For production, I would replace the faux token with real authentication, such as JWT or session-based auth. Password hashing should use a dedicated password library such as bcrypt or Argon2 instead of the current lightweight assessment implementation.

I would also add rate limiting, idempotency keys for wallet operations, request ids for tracing, stricter CORS rules, API versioning, stronger environment validation, and monitoring/alerting around failed transactions. For money values, I would store amounts in integer minor units instead of decimals to avoid precision issues.

The Adjutor API key should also be mandatory in production. In this MVP, the service can run locally without it, but a real deployment should fail startup if blacklist verification is not configured.

## Closing Note

The security choices in this project are intentionally practical for the assessment. The API is not overbuilt, but the sensitive flows are protected: users cannot access another user's wallet, blacklisted users are blocked, inputs are validated, balance changes are transactional, and wallet movements are recorded in a ledger.
