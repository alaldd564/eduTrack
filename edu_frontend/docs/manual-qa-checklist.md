# Manual QA Checklist

## 1. Environment

- Backend API is running on http://127.0.0.1:4000
- Frontend app is running on http://127.0.0.1:3000 (or 3001 if 3000 is already used)

## 2. Authentication Flow

- Instructor signup succeeds with username, password, and name.
- Student signup succeeds with username, password, name, email, and grade.
- Login succeeds for both instructor and student accounts.
- Logout returns to auth screen.

## 3. Instructor Flow

- Instructor dashboard loads student, assignment, submission data.
- Program Library page opens and subject list renders.
- Material upload succeeds from Program Library.
- Uploaded material appears in latest materials list.
- Community board allows creating a new post.
- Community board allows replying to a post.
- Submission center allows instructor score and feedback updates.

## 4. Student Flow

- Student without instructor link is redirected to link screen.
- Student links with instructor code successfully.
- Student dashboard bootstrap data loads after linking.
- Curriculum recommendation list is sorted latest-first.
- Program Library page shows related materials and assignments.
- Community board allows viewing posts and adding replies.
- Submission center allows creating a submission.

## 5. Profile Management

- Profile page loads current user profile data.
- Profile update saves display name/bio/phone.
- Student profile update saves name/email/grade.
- Header reflects updated display name.

## 6. API/Error Handling

- Invalid signup payload shows API validation detail.
- Unauthorized API calls redirect to auth flow.
- Student-only or instructor-only routes are blocked by role.

## 7. Regression Checks

- App page renders without React hook order errors.
- Loading state exits correctly to auth or dashboard.
- Search and bootstrap data refresh complete without stuck loading.
- Frontend build and lint commands pass.
