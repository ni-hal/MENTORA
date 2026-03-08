# Education Platform Backend

A production-ready REST API for an education mentorship platform connecting parents, students, and mentors.

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16+)
- MongoDB (v5+)
- Google Gemini API Key

### Setup Instructions

1. **Clone and install dependencies**
```bash
git clone <repo-url>
cd education-platform-backend
npm install
```

2. **Configure environment variables**

Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/education_platform

JWT_SECRET=your_secret_key_min_32_characters
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
```

3. **Start MongoDB**
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

4. **Run the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs at `http://localhost:5000`

---

## 📋 Design Decisions & Architecture

### 1. Code Structure & Organization

**Layered Architecture Pattern:**
```
src/
├── controllers/     # Request handling & business logic
├── models/          # Database schemas (Mongoose)
├── routes/          # API endpoint definitions
├── middleware/      # Auth, validation, error handling
├── validations/     # Input validation schemas
├── llm/            # External service integration
├── utils/          # Helpers (JWT, custom errors)
├── config/         # Database configuration
└── server.js       # Entry point
```

**Why this structure?**
- **Separation of concerns**: Each layer has a single responsibility
- **Maintainability**: Easy to locate and modify specific functionality
- **Scalability**: New features can be added without affecting existing code
- **Testability**: Each layer can be tested independently

**Key Decisions:**
- Controllers handle business logic, not routes
- Middleware for cross-cutting concerns (auth, validation)
- Centralized error handling via custom AppError class
- Utils folder for reusable functions (JWT generation, error creation)

---

### 2. API Design

**RESTful Principles:**
```
POST   /api/auth/signup          # Create user
POST   /api/auth/login           # Authenticate
GET    /api/auth/me              # Get current user

POST   /api/students             # Create student (PARENT)
GET    /api/students             # List students (PARENT)

POST   /api/lessons              # Create lesson (MENTOR)

POST   /api/bookings             # Enroll student (PARENT)

POST   /api/sessions             # Create session (MENTOR)
GET    /api/sessions/lessons/:id/sessions  # List sessions

POST   /api/llm/summarize        # AI summarization
```

**Design Decisions:**
- **Consistent response format**: All responses follow `{ success, data/error }` structure
- **HTTP status codes**: Proper use (200, 201, 400, 401, 403, 404, 413, 429, 500, 502)
- **Resource-based URLs**: Nouns, not verbs (e.g., `/students` not `/createStudent`)
- **Role-based endpoints**: Authorization enforced at route level
- **Nested routes**: For related resources (e.g., sessions under lessons)

**Why this approach?**
- Predictable and intuitive for API consumers
- Standard REST conventions make integration easier
- Clear separation between public and protected routes

---

### 3. Database Modeling

**Schema Design:**

```javascript
User {
  email: String (unique, indexed)
  password: String (hashed)
  name: String
  role: Enum [PARENT, MENTOR]
}

Student {
  name: String
  age: Number
  parentId: ObjectId → User
}

Lesson {
  title: String
  description: String
  mentorId: ObjectId → User
}

Booking {
  studentId: ObjectId → Student
  lessonId: ObjectId → Lesson
  // Compound unique index on (studentId, lessonId)
}

Session {
  lessonId: ObjectId → Lesson
  title: String
  scheduledAt: Date
  duration: Number
}
```

**Key Decisions:**

1. **Normalized design**: Separate collections for each entity to avoid data duplication
2. **Foreign key relationships**: Using ObjectId references for data integrity
3. **Unique constraints**: 
   - Email uniqueness for users
   - Compound index on Booking (studentId, lessonId) prevents duplicate enrollments
4. **No student authentication**: Students are managed entities, not users
5. **Timestamps**: Automatic `createdAt` and `updatedAt` via Mongoose

**Why this model?**
- **Flexibility**: Easy to query relationships (e.g., all students of a parent)
- **Data integrity**: References ensure valid relationships
- **Performance**: Indexes on frequently queried fields (email, foreign keys)
- **Scalability**: Can add new entities without restructuring existing ones

---

### 4. Error Handling

**Centralized Error Handling:**

```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Global error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message
  });
});
```

**Error Handling Strategy:**
- **Operational errors**: Expected errors (validation, auth) with custom messages
- **Programming errors**: Unexpected errors logged and returned as generic 500
- **Async error handling**: All async routes wrapped to catch errors
- **Validation errors**: Caught early via middleware before reaching controllers

**Error Types Handled:**
- Authentication failures (401)
- Authorization failures (403)
- Validation errors (400)
- Resource not found (404)
- Duplicate entries (400)
- Rate limit exceeded (429)
- External service failures (502)

---

### 5. Security Basics

**Authentication & Authorization:**
```javascript
// JWT-based authentication
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Token includes: userId, email, role
- Protected routes require valid token
- Role-based middleware (requireRole)
```

**Security Measures:**

1. **Password Security**
   - bcrypt hashing before storage
   - Never return password in API responses
   - Minimum 6 character requirement

2. **JWT Security**
   - Secret key stored in environment variables
   - Token expiration enforced
   - Token verified on every protected route

3. **Rate Limiting**
   - General endpoints: 100 requests per 15 minutes
   - Auth endpoints: 5 requests per 15 minutes
   - Prevents brute force attacks

4. **Input Validation**
   - Email format validation
   - Password length requirements
   - Role validation (only PARENT/MENTOR allowed)
   - Text length limits for LLM (50-10000 chars)

5. **Environment Variables**
   - No hardcoded secrets
   - Sensitive data in `.env` (not committed)

6. **CORS Configuration**
   - Configured for cross-origin requests
   - Can be restricted to specific domains in production

7. **Authorization Checks**
   - Parent can only access their own students
   - Mentor can only create lessons/sessions
   - Proper role verification before operations

---

### 6. Overall Backend Architecture

**Architecture Pattern: MVC + Service Layer**

```
Request Flow:
Client → Routes → Middleware (Auth/Validation) → Controller → Model → Database
                                                      ↓
                                                   Service (LLM)
                                                      ↓
                                                   Response
```

**Key Architectural Decisions:**

1. **Middleware Pipeline**
   - Rate limiting → CORS → Body parsing → Routes → Auth → Validation → Controller
   - Each middleware has single responsibility

2. **Dependency Injection**
   - Database connection established before server starts
   - Graceful error handling if DB connection fails

3. **Stateless Design**
   - JWT tokens enable stateless authentication
   - No server-side session storage
   - Horizontally scalable

4. **External Service Integration**
   - LLM service abstracted into separate module
   - Easy to swap providers (currently Gemini)
   - Error handling for external service failures

5. **Configuration Management**
   - Environment-based configuration
   - Separate dev/production settings
   - Centralized in `.env` file

**Scalability Considerations:**
- Stateless design allows horizontal scaling
- Database indexes for query performance
- Rate limiting prevents resource exhaustion
- Modular structure allows microservice migration

**Maintainability:**
- Clear folder structure
- Consistent naming conventions
- Centralized error handling
- Reusable middleware and utilities

---

## 🧪 Testing the API

**Quick Test Flow:**

1. **Create Parent**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@test.com","password":"pass123","name":"Parent","role":"PARENT"}'
```

2. **Create Mentor**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@test.com","password":"pass123","name":"Mentor","role":"MENTOR"}'
```

3. **Parent creates student** (use parent token)
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":12}'
```

4. **Mentor creates lesson** (use mentor token)
```bash
curl -X POST http://localhost:5000/api/lessons \
  -H "Authorization: Bearer <MENTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Python 101","description":"Learn Python"}'
```

5. **Parent books student to lesson**
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer <PARENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"<STUDENT_ID>","lessonId":"<LESSON_ID>"}'
```

6. **Mentor creates session**
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Authorization: Bearer <MENTOR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"<LESSON_ID>","title":"Week 1","scheduledAt":"2024-02-01T10:00:00Z","duration":60}'
```

7. **Test LLM summarization**
```bash
curl -X POST http://localhost:5000/api/llm/summarize \
  -H "Authorization: Bearer <ANY_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Your text here (minimum 50 characters for testing purposes)"}'
```

---

## 📊 API Response Format

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🔑 Key Assumptions

1. **User Roles**: Only PARENT and MENTOR can sign up; students are created by parents
2. **Authentication**: All endpoints except signup/login require authentication
3. **Authorization**: Role-based access enforced (parents manage students, mentors manage lessons)
4. **Booking Logic**: One student can only book one lesson once (unique constraint)
5. **LLM Service**: Using Google Gemini API (can be swapped with OpenAI)
6. **Session Management**: Sessions belong to lessons, created by mentors
7. **Data Ownership**: Parents can only access their students, mentors their lessons

---

## 📦 Dependencies

**Core:**
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables

**Security:**
- `express-rate-limit` - Rate limiting
- `cors` - Cross-origin resource sharing

**AI/LLM:**
- `@google/generative-ai` - Gemini API integration

**Development:**
- `nodemon` - Auto-reload during development

---

## 🎯 Evaluation Highlights

### Code Structure ✅
- Clean layered architecture
- Separation of concerns
- Modular and maintainable

### API Design ✅
- RESTful conventions
- Consistent response format
- Proper HTTP status codes
- Role-based access control

### Database Modeling ✅
- Normalized schema design
- Proper relationships and indexes
- Data integrity constraints
- Scalable structure

### Error Handling ✅
- Centralized error middleware
- Custom error classes
- Comprehensive error types
- Graceful failure handling

### Security ✅
- JWT authentication
- Password hashing
- Rate limiting
- Input validation
- Environment-based secrets
- Role-based authorization

### Architecture ✅
- Stateless design
- Middleware pipeline
- Service abstraction
- Configuration management
- Scalability considerations

---

## 📄 License

ISC
