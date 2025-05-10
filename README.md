# Drug Indications API

A NestJS-based API for processing and analyzing drug indications data from DailyMed and OpenAI.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Sample Output](#sample-output)
- [Scalability Considerations](#scalability-considerations)
- [Potential Improvements](#potential-improvements)

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ballastlane
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=drug_indications
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

### 3. Installation

#### Using Docker (Recommended)

```bash
# Build and start the containers
docker-compose up --build

# The API will be available at http://localhost:3000
```

#### Manual Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the development server
npm run start:dev
```

### 4. Database Migrations

The database schema will be automatically created when the application starts.

## API Documentation

The API documentation is available at `http://localhost:3000/api` when the server is running.

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### User Endpoints

- `POST /users` - Create a new user (requires ADMIN role)
- `GET /users` - Get all users (requires ADMIN role)
- `GET /users/:id` - Get user by UUID (requires ADMIN role)
- `PATCH /users/:id` - Update user by UUID (requires ADMIN role)
- `DELETE /users/:id` - Delete user by UUID (requires ADMIN role)

Note: All endpoints require JWT authentication and appropriate role (admin).

### Drug Indications Endpoints

- `POST /drug-indications` - Create a new drug indication (requires USER role)
- `GET /drug-indications` - Get all drug indications, sorted by drugName and title (requires USER role)
- `GET /drug-indications/:id` - Get specific drug indication by UUID (requires USER role)
- `PATCH /drug-indications/:id` - Update drug indication by UUID (requires USER role)
- `DELETE /drug-indications/:id` - Delete drug indication by UUID (requires USER role)

Note: All endpoints require JWT authentication and USER role.

### DailyMed Integration

- `GET /dailymed/search?name={drugName}` - Search for a drug label, return its indications and save them to the database (requires USER role)

## Sample Output

### Drug Indication Response

```json
{
  "indications": [
    {
      "id": "12345678-1234-1234-1234-123456789012",
      "drugName": "Drug Name",
      "title": "Indication Title",
      "text": "Indication Text",
      "icd10_code": "ICD-10 Code",
      "icd10_description": "ICD-10 Description"
    }
  ]
}
```

## Scalability Considerations

1. **Database Scaling**

   - PostgreSQL is configured for horizontal scaling
   - Consider implementing database sharding for large datasets
   - Use connection pooling for better performance

2. **Application Scaling**

   - The application is containerized for easy scaling
   - Implement load balancing for multiple instances
   - Use caching mechanisms for frequently accessed data

3. **API Rate Limiting**
   - Implement rate limiting for external API calls
   - Use queue systems for batch processing
   - Consider implementing circuit breakers

## Potential Improvements

1. **Performance Optimizations**

   - Implement Redis caching for frequently accessed data
   - Add database indexing for common queries
   - Implement batch processing for large datasets

2. **Security Enhancements**

   - Add API key rotation mechanism
   - Implement request validation middleware
   - Add rate limiting per user/IP

3. **Monitoring and Logging**

   - Implement structured logging
   - Add performance monitoring
   - Set up error tracking

4. **Testing**

   - Increase test coverage
   - Add integration tests
   - Implement load testing

5. **Documentation**
   - Add more detailed API documentation
   - Include code examples
   - Add troubleshooting guide

## Production Challenges

1. **Data Consistency**

   - Implement data validation
   - Add data backup mechanisms
   - Implement data recovery procedures

2. **Security**

   - Regular security audits
   - Implement WAF (Web Application Firewall)
   - Regular dependency updates

3. **Performance**

   - Monitor API response times
   - Implement caching strategies
   - Regular performance testing

4. **Maintenance**
   - Regular database maintenance
   - Log rotation
   - Backup verification

### How would you lead an engineering team to implement and maintain this project?

1. **Project Setup and Planning**

   - Establish clear project goals and success metrics
   - Create a detailed project timeline with milestones
   - Set up development, staging, and production environments
   - Implement CI/CD pipelines for automated testing and deployment

2. **Team Structure and Roles**

   - Backend Developers (NestJS, PostgreSQL)
   - DevOps Engineer (Docker, CI/CD)
   - QA Engineer (Testing, Quality Assurance)
   - Technical Lead (Architecture, Code Review)
   - Product Owner (Requirements, Prioritization)

3. **Development Process**

   - Implement Git Flow workflow
   - Use feature branches and pull requests
   - Enforce code review process
   - Maintain comprehensive documentation
   - Regular code quality checks and refactoring

4. **Testing Strategy**

   - Unit tests for all services and controllers
   - Integration tests for API endpoints
   - E2E tests for critical user flows
   - Performance testing for scalability
   - Security testing and vulnerability scanning

5. **Monitoring and Maintenance**

   - Set up logging and monitoring (e.g., ELK Stack)
   - Implement error tracking (e.g., Sentry)
   - Regular performance monitoring
   - Database maintenance and optimization
   - Security updates and dependency management

6. **Team Communication and Collaboration**

   - Daily stand-up meetings
   - Weekly sprint planning and retrospectives
   - Technical documentation updates
   - Knowledge sharing sessions
   - Regular team training on new technologies

7. **Quality Assurance**

   - Code quality metrics tracking
   - Automated testing coverage goals
   - Performance benchmarks
   - Security compliance checks
   - Regular code reviews and pair programming

8. **Risk Management**

   - Regular security audits
   - Data backup and recovery procedures
   - Disaster recovery planning
   - Dependency vulnerability monitoring
   - API rate limiting and protection

9. **Continuous Improvement**

   - Regular architecture reviews
   - Performance optimization
   - Code refactoring
   - Technology stack updates
   - Process improvements based on retrospectives

10. **Documentation and Knowledge Base**
    - API documentation maintenance
    - System architecture documentation
    - Deployment procedures
    - Troubleshooting guides
    - Team onboarding materials

## License

This project is licensed under the MIT License - see the LICENSE file for details.
