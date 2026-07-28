# Services — Phase 3

Services contain all business logic and orchestrate repository calls.
They are the only layer that controllers should call.

## Responsibility (Service Layer)
- Input validation beyond express-validator (business rules)
- Transaction management for multi-table operations
- Password hashing, slug generation, publish logic
- Throw ApiError with appropriate HTTP status codes

## Planned services
- auth.service.js
- project.service.js
- skill.service.js
- blog.service.js
- message.service.js
- certificate.service.js
- settings.service.js
- resume.service.js
- education.service.js
- experience.service.js
- socialLink.service.js
- visitorLog.service.js

## Rule
Services never access req/res objects. Pure functions with clear inputs/outputs.
