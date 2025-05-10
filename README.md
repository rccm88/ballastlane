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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

```

```
