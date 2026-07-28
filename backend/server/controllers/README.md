# Controllers — Phase 3

Controllers handle HTTP request/response mapping only.
They must NOT contain business logic or direct SQL.

## Responsibility (MVC)
- Parse request params/body
- Call the appropriate service method
- Return standardized ApiResponse JSON

## Planned controllers
- auth.controller.js
- project.controller.js
- skill.controller.js
- blog.controller.js
- message.controller.js
- certificate.controller.js
- settings.controller.js
- resume.controller.js
- education.controller.js
- experience.controller.js
- socialLink.controller.js

## Rule
One controller per resource. Keep methods thin (< 10 lines each).
