# API Testing Examples

## Authentication

### 1. Signup (Parent)
```json
POST http://localhost:5000/api/auth/signup

{
  "email": "parent@test.com",
  "password": "password123",
  "name": "Test Parent",
  "role": "PARENT"
}
```

### 2. Signup (Mentor)
```json
POST http://localhost:5000/api/auth/signup

{
  "email": "mentor@test.com",
  "password": "password123",
  "name": "Test Mentor",
  "role": "MENTOR"
}
```

### 3. Login
```json
POST http://localhost:5000/api/auth/login

{
  "email": "parent@test.com",
  "password": "password123"
}
```

### 4. Get Current User
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

## Students (Parent Only)

### 5. Create Student
```json
POST http://localhost:5000/api/students
Authorization: Bearer PARENT_TOKEN

{
  "name": "Alice Student",
  "age": 10
}
```

### 6. Get All Students
```
GET http://localhost:5000/api/students
Authorization: Bearer PARENT_TOKEN
```

## Lessons (Mentor Only)

### 7. Create Lesson
```json
POST http://localhost:5000/api/lessons
Authorization: Bearer MENTOR_TOKEN

{
  "title": "Introduction to Python",
  "description": "Learn Python basics"
}
```

## Bookings

### 8. Create Booking (Parent Only)
```json
POST http://localhost:5000/api/bookings
Authorization: Bearer PARENT_TOKEN

{
  "studentId": "STUDENT_UUID",
  "lessonId": "LESSON_UUID"
}
```

### 9. Accept Booking (Parent or Mentor)
```
PATCH http://localhost:5000/api/bookings/BOOKING_UUID/accept
Authorization: Bearer PARENT_TOKEN_OR_MENTOR_TOKEN
```

## Sessions (Mentor Only)

### 10. Create Session
```json
POST http://localhost:5000/api/sessions
Authorization: Bearer MENTOR_TOKEN

{
  "lessonId": "LESSON_UUID",
  "title": "Week 1: Variables and Data Types",
  "scheduledAt": "2024-02-01T10:00:00Z",
  "duration": 60
}
```

### 11. Get Lesson Sessions
```
GET http://localhost:5000/api/sessions/lessons/LESSON_UUID/sessions
Authorization: Bearer YOUR_TOKEN
```

## LLM Integration

### 12. Summarize Text
```json
POST http://localhost:5000/api/llm/summarize
Authorization: Bearer YOUR_TOKEN

{
  "text": "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of intelligent agents: any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals. Colloquially, the term artificial intelligence is often used to describe machines that mimic cognitive functions that humans associate with the human mind, such as learning and problem solving."
}
```

## Error Cases

### Invalid Email
```json
POST http://localhost:5000/api/auth/signup

{
  "email": "invalid-email",
  "password": "password123",
  "name": "Test User",
  "role": "PARENT"
}
```

### Short Password
```json
POST http://localhost:5000/api/auth/signup

{
  "email": "test@test.com",
  "password": "123",
  "name": "Test User",
  "role": "PARENT"
}
```

### Invalid Role
```json
POST http://localhost:5000/api/auth/signup

{
  "email": "test@test.com",
  "password": "password123",
  "name": "Test User",
  "role": "ADMIN"
}
```

### Text Too Short (LLM)
```json
POST http://localhost:5000/api/llm/summarize
Authorization: Bearer YOUR_TOKEN

{
  "text": "Short text"
}
```

### Text Too Long (LLM)
```json
POST http://localhost:5000/api/llm/summarize
Authorization: Bearer YOUR_TOKEN

{
  "text": "TEXT_OVER_10000_CHARACTERS"
}
```

## Testing Flow

1. Create a PARENT account → Save token
2. Create a MENTOR account → Save token
3. Parent creates a student → Save student ID
4. Mentor creates a lesson → Save lesson ID
5. Parent books student to lesson → Save booking ID
6. Parent or Mentor accepts the booking
7. Mentor creates sessions for lesson
8. Get all sessions for the lesson
9. Test LLM summarization

## Notes

- Replace `YOUR_TOKEN_HERE` with actual JWT token
- Replace UUIDs with actual IDs from responses
- Tokens expire based on JWT_EXPIRES_IN setting
- Rate limits apply (5 requests per 15 min for auth)
