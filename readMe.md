The automatic tests have not been rewritten after User module.

To Run the code pnpm(Package Manager) docker(`docker compose up db -d`-for database operations) needs to be installed.

# API Documentation

This repository contains the documentation for the API endpoints of the project.

## Table of Contents

- [API Documentation](#api-documentation)
  - [Table of Contents](#table-of-contents)
  - [Authentication](#authentication)
    - [Register](#register)
    - [Login](#login)
    - [Forgot Password](#forgot-password)
    - [Reset Password {token}](#reset-password-token)
    - [Logout](#logout)
    - [Change Password](#change-password)
  - [User](#user)
    - [Get All Users](#get-all-users)
    - [Delete User {username}](#delete-user-username)
    - [View Profile {username}](#view-profile-username)
    - [Get My Profile](#get-my-profile)
    - [Edit My Profile](#edit-my-profile)
    - [Delete My Profile](#delete-my-profile)
    - [Deactivate My Profile](#deactivate-my-profile)
  - [Organization](#organization)
    - [Create Organization](#create-organization)
    - [Get All Organizations](#get-all-organizations)
    - [View All Members {orgId}](#view-all-members-orgid)
    - [Join Organization {orgId}/members](#join-organization-orgidmembers)
    - [Leave Organization {orgId}/members/{username}](#leave-organization-orgidmembersusername)
    - [Promote Member {orgId}/members/{username}/promote](#promote-member-orgidmembersusernamepromote)
    - [Demote Member {orgId}/members/{username}/demote](#demote-member-orgidmembersusernamedemote)
  - [Repository](#repository)
    - [Create Repository {orgId}](#create-repository-orgid)
    - [Get All Repositories {orgId}](#get-all-repositories-orgid)
    - [View Repository {orgId}/{repositoryId}](#view-repository-orgidrepositoryid)
    - [Delete Repository {orgId}/{repositoryId}](#delete-repository-orgidrepositoryid)
    - [Edit Repository {orgId}/{repositoryId}](#edit-repository-orgidrepositoryid)
    - [Fork Repository {orgId}/{repositoryId}/fork](#fork-repository-orgidrepositoryidfork)
    - [Add Collaborator {orgId}/{repositoryId}/collaborators](#add-collaborator-orgidrepositoryidcollaborators)
    - [Remove Collaborator {orgId}/{repositoryId}/collaborators/{username}](#remove-collaborator-orgidrepositoryidcollaboratorsusername)
    - [View Collaborators {orgId}/{repositoryId}/collaborators](#view-collaborators-orgidrepositoryidcollaborators)
    - [List Branches {orgId}/{repositoryId}/branches](#list-branches-orgidrepositoryidbranches)
    - [Create Branch {orgId}/{repositoryId}/branches](#create-branch-orgidrepositoryidbranches)
    - [Delete Branch {orgId}/{repositoryId}/branches/{branchName}](#delete-branch-orgidrepositoryidbranchesbranchname)
    - [View Pull Requests {orgId}/{repositoryId}/pull-requests](#view-pull-requests-orgidrepositoryidpull-requests)
    - [Create Pull Request {orgId}/{repositoryId}/pull-requests](#create-pull-request-orgidrepositoryidpull-requests)
    - [View Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}](#view-pull-request-orgidrepositoryidpull-requestspullrequestid)
    - [Merge Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}/merge](#merge-pull-request-orgidrepositoryidpull-requestspullrequestidmerge)
    - [Close Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}/close](#close-pull-request-orgidrepositoryidpull-requestspullrequestidclose)
    - [Comment on Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}/comments](#comment-on-pull-request-orgidrepositoryidpull-requestspullrequestidcomments)
    - [Get Comments {orgId}/{repositoryId}/pull-requests/{pullRequestId}/comments](#get-comments-orgidrepositoryidpull-requestspullrequestidcomments)
    - [Delete Comment {orgId}/{repositoryId}/pull-requests/{pullRequestId}/comments/{commentId}](#delete-comment-orgidrepositoryidpull-requestspullrequestidcommentscommentid)

## Authentication

### Register

- URL: `/register`
- Method: `POST`
- Description: Registers a new user.
- Request Body:
  - Content-Type: `application/json`
  - Schema: `RegisterDto`

### Login

- URL: `/login`
- Method: `POST`
- Description: Authenticates a user and generates an access token.
- Request Body:
  - Content-Type: `application/json`
  - Schema: `AuthDto`

### Forgot Password

- URL: `/forgotPassword`
- Method: `POST`
- Description: Sends a password reset email to the user's email address.
- Request Headers:
  - `host` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `PasswordForgotDto`

### Reset Password {token}

- URL: `/resetPassword/{token}`
- Method: `POST`
- Description: Resets the user's password using the provided token.
- Request Parameters:
  - `token` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `PasswordResetDto`

### Logout

- URL: `/logout`
- Method: `POST`
- Description: Logs out the authenticated user.

### Change Password

- URL: `/changePassword`
- Method: `POST`
- Description: Changes the password for the authenticated user.
- Request Body:
  - Content-Type: `application/json`
  - Schema: `ChangePasswordDto`

## User

### Get All Users

- URL: `/user`
- Method: `GET`
- Description: Retrieves a list of all users.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `User[]`

### Delete User {username}

- URL: `/user/{username}`
- Method: `DELETE`
- Description: Deletes a specific user.
- Request Headers:
  - `Authorization` (string, required)

### View Profile {username}

- URL: `/user/{username}`
- Method: `GET`
- Description: Retrieves the profile of a specific user.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `User`

### Get My Profile

- URL: `/user/me`
- Method: `GET`
- Description: Retrieves the profile of the authenticated user.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `User`

### Edit My Profile

- URL: `/user/me`
- Method: `PUT`
- Description: Updates the profile information of the authenticated user.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `UserEditDto`

### Delete My Profile

- URL: `/user/me/delete`
- Method: `DELETE`
- Description: Deletes the profile of the authenticated user.
- Request Headers:
  - `Authorization` (string, required)

### Deactivate My Profile

- URL: `/user/me/deactivate`
- Method: `PUT`
- Description: Deactivates the profile of the authenticated user.
- Request Headers:
  - `Authorization` (string, required)

## Organization

### Create Organization

- URL: `/organization`
- Method: `POST`
- Description: Creates a new organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `OrganizationCreateDto`

### Get All Organizations

- URL: `/organization`
- Method: `GET`
- Description: Retrieves a list of all organizations.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Organization[]`

### View All Members {orgId}

- URL: `/organization/{orgId}/members`
- Method: `GET`
- Description: Retrieves a list of all members in the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Member[]`

### Join Organization {orgId}/members

- URL: `/organization/{orgId}/members`
- Method: `POST`
- Description: Allows a user to join an organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `JoinOrganizationDto`

### Leave Organization {orgId}/members/{username}

- URL: `/organization/{orgId}/members/{username}`
- Method: `DELETE`
- Description: Allows a user to leave an organization.
- Request Headers:
  - `Authorization` (string, required)

### Promote Member {orgId}/members/{username}/promote

- URL: `/organization/{orgId}/members/{username}/promote`
- Method: `PUT`
- Description: Promotes a member to an admin role within the organization.
- Request Headers:
  - `Authorization` (string, required)

### Demote Member {orgId}/members/{username}/demote

- URL: `/organization/{orgId}/members/{username}/demote`
- Method: `PUT`
- Description: Demotes an admin member within the organization.
- Request Headers:
  - `Authorization` (string, required)

## Repository

### Create Repository {orgId}

- URL: `/organization/{orgId}/repository`
- Method: `POST`
- Description: Creates a new repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `RepositoryCreateDto`

### Get All Repositories {orgId}

- URL: `/organization/{orgId}/repository`
- Method: `GET`
- Description: Retrieves a list of all repositories within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Repository[]`

### View Repository {orgId}/{repositoryId}

- URL: `/organization/{orgId}/repository/{repositoryId}`
- Method: `GET`
- Description: Retrieves information about a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Repository`

### Delete Repository {orgId}/{repositoryId}

- URL: `/organization/{orgId}/repository/{repositoryId}`
- Method: `DELETE`
- Description: Deletes a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)

### Edit Repository {orgId}/{repositoryId}

- URL: `/organization/{orgId}/repository/{repositoryId}`
- Method: `PUT`
- Description: Updates the information of a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `RepositoryEditDto`

### Fork Repository {orgId}/{repositoryId}/fork

- URL: `/organization/{orgId}/repository/{repositoryId}/fork`
- Method: `POST`
- Description: Forks a repository within the organization.
- Request Headers:
  - `Authorization` (string, required)

### Add Collaborator {orgId}/{repositoryId}/collaborators

- URL: `/organization/{orgId}/repository/{repositoryId}/collaborators`
- Method: `POST`
- Description: Adds a collaborator to a repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `CollaboratorAddDto`

### Remove Collaborator {orgId}/{repositoryId}/collaborators/{username}

- URL: `/organization/{orgId}/repository/{repositoryId}/collaborators/{username}`
- Method: `DELETE`
- Description: Removes a collaborator from a repository within the organization.
- Request Headers:
  - `Authorization` (string, required)

### View Collaborators {orgId}/{repositoryId}/collaborators

- URL: `/organization/{orgId}/repository/{repositoryId}/collaborators`
- Method: `GET`
- Description: Retrieves a list of collaborators for a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Collaborator[]`

### List Branches {orgId}/{repositoryId}/branches

- URL: `/organization/{orgId}/repository/{repositoryId}/branches`
- Method: `GET`
- Description: Retrieves a list of branches for a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Branch[]`

### Create Branch {orgId}/{repositoryId}/branches

- URL: `/organization/{orgId}/repository/{repositoryId}/branches`
- Method: `POST`
- Description: Creates a new branch within a specific repository in the organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `BranchCreateDto`

### Delete Branch {orgId}/{repositoryId}/branches/{branchName}

- URL: `/organization/{orgId}/repository/{repositoryId}/branches/{branchName}`
- Method: `DELETE`
- Description: Deletes a specific branch within a repository in the organization.
- Request Headers:
  - `Authorization` (string, required)

### View Pull Requests {orgId}/{repositoryId}/pull-requests

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests`
- Method: `GET`
- Description: Retrieves a list of pull requests for a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `PullRequest[]`

### Create Pull Request {orgId}/{repositoryId}/pull-requests

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests`
- Method: `POST`
- Description: Creates a new pull request for a specific repository within the organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `PullRequestCreateDto`

### View Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests/{pullRequestId}`
- Method: `GET`
- Description: Retrieves information about a specific pull request within a repository in the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `PullRequest`

### Merge Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}/merge

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests/{pullRequestId}/merge`
- Method: `PUT`
- Description: Merges a specific pull request within a repository in the organization.
- Request Headers:
  - `Authorization` (string, required)

### Close Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}/close

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests/{pullRequestId}/close`
- Method: `PUT`
- Description: Closes a specific pull request within a repository in the organization.
- Request Headers:
  - `Authorization` (string, required)

### Comment on Pull Request {orgId}/{repositoryId}/pull-requests/{pullRequestId}/comments

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests/{pullRequestId}/comments`
- Method: `POST`
- Description: Adds a comment to a specific pull request within a repository in the organization.
- Request Headers:
  - `Authorization` (string, required)
- Request Body:
  - Content-Type: `application/json`
  - Schema: `CommentCreateDto`

### Get Comments {orgId}/{repositoryId}/pull-requests/{pullRequestId}/comments

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests/{pullRequestId}/comments`
- Method: `GET`
- Description: Retrieves a list of comments for a specific pull request within a repository in the organization.
- Request Headers:
  - `Authorization` (string, required)
- Response Body:
  - Content-Type: `application/json`
  - Schema: `Comment[]`

### Delete Comment {orgId}/{repositoryId}/pull-requests/{pullRequestId}/comments/{commentId}

- URL: `/organization/{orgId}/repository/{repositoryId}/pull-requests/{pullRequestId}/comments/{commentId}`
- Method: `DELETE`
- Description: Deletes a specific comment within a pull request in the organization.
- Request Headers:
  - `Authorization` (string, required)
