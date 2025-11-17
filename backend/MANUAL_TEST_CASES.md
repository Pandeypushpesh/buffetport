# Manual Test Cases for /api/send-resume Endpoint

## Prerequisites

1. Backend server running: `npm start` or `npm run dev`
2. Server accessible at: `http://localhost:5000`
3. Test tool: Postman, curl, or browser DevTools

---

## Test Case 1: Valid Email - Success (200)

**Test ID:** TC-001  
**Description:** Send resume to valid email address  
**Expected Result:** 200 OK with success message

### Steps:
1. Send POST request to `http://localhost:5000/api/send-resume`
2. Body (JSON): `{ "email": "test@example.com" }`
3. Headers: `Content-Type: application/json`

### Expected Response:
```json
{
  "success": true,
  "message": "Resume sent successfully! Check your email.",
  "messageId": "..."
}
```

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Test Case 2: Valid Email with Subdomain - Success (200)

**Test ID:** TC-002  
**Description:** Send resume to email with subdomain  
**Expected Result:** 200 OK

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "user@mail.example.com" }`

### Expected Response:
- Status: 200
- `success: true`

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"user@mail.example.com"}'
```

---

## Test Case 3: Email with Whitespace - Success (200)

**Test ID:** TC-003  
**Description:** Email with leading/trailing whitespace should be sanitized  
**Expected Result:** 200 OK (email trimmed)

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "  test@example.com  " }`

### Expected Response:
- Status: 200
- Email should be trimmed before processing

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"  test@example.com  "}'
```

---

## Test Case 4: Missing Email - Error (400)

**Test ID:** TC-004  
**Description:** Request without email field  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{}` (empty object)

### Expected Response:
```json
{
  "error": "Email is required",
  "message": "Please provide an email address"
}
```

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Test Case 5: Invalid Email Format - Error (400)

**Test ID:** TC-005  
**Description:** Email without valid format  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "not-an-email" }`

### Expected Response:
```json
{
  "error": "Invalid email format",
  "message": "Please provide a valid email address"
}
```

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}'
```

---

## Test Case 6: Email Without Domain - Error (400)

**Test ID:** TC-006  
**Description:** Email missing domain part  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "test@" }`

### Expected Response:
- Status: 400
- Error about invalid format

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@"}'
```

---

## Test Case 7: Email Without @ Symbol - Error (400)

**Test ID:** TC-007  
**Description:** Email missing @ symbol  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "testexample.com" }`

### Expected Response:
- Status: 400
- Error about invalid format

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"testexample.com"}'
```

---

## Test Case 8: Email with Invalid Characters - Error (400)

**Test ID:** TC-008  
**Description:** Email containing suspicious characters  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "test<script>@example.com" }`

### Expected Response:
```json
{
  "error": "Invalid email format",
  "message": "Email contains invalid characters"
}
```

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test<script>@example.com"}'
```

---

## Test Case 9: Email Too Long - Error (400)

**Test ID:** TC-009  
**Description:** Email exceeding 254 character limit  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "a...a@example.com" }` (250+ chars before @)

### Expected Response:
```json
{
  "error": "Invalid email",
  "message": "Email address is too long"
}
```

### cURL Command:
```bash
# Generate long email
LONG_EMAIL="$(printf 'a%.0s' {1..250})@example.com"
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LONG_EMAIL\"}"
```

---

## Test Case 10: Empty String Email - Error (400)

**Test ID:** TC-010  
**Description:** Empty string as email  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "" }`

### Expected Response:
- Status: 400
- Error: "Email is required"

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":""}'
```

---

## Test Case 11: Whitespace-Only Email - Error (400)

**Test ID:** TC-011  
**Description:** Email containing only whitespace  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "   " }`

### Expected Response:
- Status: 400
- Error: "Email is required"

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"   "}'
```

---

## Test Case 12: Rate Limiting - Error (429)

**Test ID:** TC-012  
**Description:** Exceed rate limit (5 requests per hour)  
**Expected Result:** 429 Too Many Requests

### Steps:
1. Send 5 valid requests to `/api/send-resume`
2. Send 6th request immediately after

### Expected Response:
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Maximum 5 requests per hour per IP."
}
```

### cURL Command:
```bash
# Send 6 requests in quick succession
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/send-resume \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo ""
done
```

---

## Test Case 13: Case Sensitivity - Success (200)

**Test ID:** TC-013  
**Description:** Email with mixed case should be lowercased  
**Expected Result:** 200 OK

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "Test@Example.COM" }`

### Expected Response:
- Status: 200
- Email should be processed as lowercase

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"Test@Example.COM"}'
```

---

## Test Case 14: Missing Content-Type Header - Error (400)

**Test ID:** TC-014  
**Description:** Request without Content-Type header  
**Expected Result:** 400 or 415 (depends on Express config)

### Steps:
1. POST to `/api/send-resume`
2. No Content-Type header
3. Body: `{ "email": "test@example.com" }`

### Expected Response:
- May fail to parse JSON
- Status: 400 or 415

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -d '{"email":"test@example.com"}'
```

---

## Test Case 15: Invalid JSON Body - Error (400)

**Test ID:** TC-015  
**Description:** Malformed JSON in request body  
**Expected Result:** 400 Bad Request

### Steps:
1. POST to `/api/send-resume`
2. Body: `{ "email": "test@example.com"` (missing closing brace)

### Expected Response:
- JSON parse error
- Status: 400

### cURL Command:
```bash
curl -X POST http://localhost:5000/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"'
```

---

## Test Results Template

| Test ID | Description | Status | Notes |
|---------|-------------|--------|-------|
| TC-001 | Valid email | ⬜ Pass / ⬜ Fail | |
| TC-002 | Subdomain email | ⬜ Pass / ⬜ Fail | |
| TC-003 | Whitespace email | ⬜ Pass / ⬜ Fail | |
| TC-004 | Missing email | ⬜ Pass / ⬜ Fail | |
| TC-005 | Invalid format | ⬜ Pass / ⬜ Fail | |
| TC-006 | No domain | ⬜ Pass / ⬜ Fail | |
| TC-007 | No @ symbol | ⬜ Pass / ⬜ Fail | |
| TC-008 | Invalid chars | ⬜ Pass / ⬜ Fail | |
| TC-009 | Too long | ⬜ Pass / ⬜ Fail | |
| TC-010 | Empty string | ⬜ Pass / ⬜ Fail | |
| TC-011 | Whitespace only | ⬜ Pass / ⬜ Fail | |
| TC-012 | Rate limiting | ⬜ Pass / ⬜ Fail | |
| TC-013 | Case sensitivity | ⬜ Pass / ⬜ Fail | |
| TC-014 | Missing header | ⬜ Pass / ⬜ Fail | |
| TC-015 | Invalid JSON | ⬜ Pass / ⬜ Fail | |

---

## Quick Test Script

Save as `test-endpoint.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "Testing /api/send-resume endpoint..."
echo ""

# Test 1: Valid email
echo "Test 1: Valid email"
curl -X POST $BASE_URL/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Invalid email
echo "Test 2: Invalid email"
curl -X POST $BASE_URL/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}' \
  -w "\nStatus: %{http_code}\n\n"

# Test 3: Missing email
echo "Test 3: Missing email"
curl -X POST $BASE_URL/api/send-resume \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code}\n\n"
```

Run: `chmod +x test-endpoint.sh && ./test-endpoint.sh`

