# Complex Backend Project
This is a complex backend project built using JavaScript with a focus on creating a production-level setup. The project is structured with specific folders for utilities, middleware, authentication, controllers, and handles API responses and errors like you would in a production environment.

## Website
+ [backendstreamingplatform.com](https://www.backendstreamingplatform.com)

## API Documentation
+ Interact with our live API endpoints directly through Postman!
+ Test all platform endpoints and functions with real-time responses via documentation.
+ [Link To API Documentation](https://documenter.getpostman.com/view/33431459/2sAXqs83Ct)

## Features
### User Management
+ **User account handling**: Registration, login, and logout functionalities.
+ **Password management**: Secure password reset process.
+ **Profile customization**: Manage user avatars, cover images, and personal details.
+ **Activity tracking**: Keep a record of the user’s watch history.

### Video Management
+ **Content creation**: Upload and publish videos with ease.
+ **Discovery tools**: Advanced video search, sorting options, and pagination for improved user experience.
+ **Content modification**: Edit or delete videos as needed.
+ **Privacy settings**: Control the visibility of your content with publish/unpublish options.

### tweet Management
+ **Microblogging features**: Create and publish tweets.
+ **User interactions**: View and manage tweets authored by the user.
+ **Content control**: Edit or delete tweets whenever necessary.

### Subscription Management
+ **Channel following**: Subscribe to your favorite channels.
+ **Network insights**: View lists of your subscribers and the channels you follow.

### Playlist Management
+ **Playlist operations**: Create, update, and delete video playlists.
+ **Content organization**: Add or remove videos from your playlists.
+ **User collection**: View playlists curated by the user.

### Like Management
+ **Engagement tracking**: Like or unlike videos, comments, and tweets.
+ **Favorites list**: Access all liked videos in one place.

### Comment Management
+ **Interaction tools**: Add, edit, or delete comments on videos.

### Dashboard
+ **Channel analytics**: Monitor channel statistics including views, subscriber count, and video performance.
+ **Content overview**: Access and manage uploaded videos through a user-friendly dashboard.

### Health Check
+ **System diagnostics**: Dedicated endpoint to verify the backend’s operational status.

### General 
+ **Authentication**: Implemented using JWT (JSON Web Tokens) with both access and refresh tokens for secure and efficient user authentication.
+ **Password Encryption**: Utilized bcrypt for hashing and securing user passwords.
+ **File Upload**: Integrated `multer` for handling file uploads, with further integration with `Cloudinary` for cloud storage.
+ **Database**: MongoDB is used as the database, with Mongoose for object data modeling (ODM).
+ **Core Logic**: Built many features using core JavaScript functionalities, minimizing the use of external libraries to enhance understanding and control over the codebase.
+ **Error Handling**: Robust API error and response handling, ensuring the application is reliable and easy to debug.

## Technologies Used
+ **Node.js**: Server-side JavaScript runtime environment.
+ **Express**: Fast and minimalist web framework for Node.js.
+ **MongoDB**: NoSQL database for storing data.
+ **Mongoose**: ODM library for MongoDB and Node.js.
+ **JWT**: For creating and verifying tokens for user authentication.
+ **bcrypt**: For hashing passwords.
+ **Multer**: Middleware for handling multipart/form-data, which is used for uploading files.
+ **Cloudinary**: Cloud-based image and video management service.
+ **JavaScript**: Core logic and functionality.

## Project Structure
+ **controllers**: Contains the logic for handling requests and returning responses.
+ **middleware**: Custom middleware functions to handle various tasks like authentication, error handling, etc.
+ **utils**: Utility functions used across different parts of the application.
+ **auth**: Handles everything related to authentication, including token generation and verification.

## Installation and Setup

### 1. Clone the Repository

Clone the repository to your local machine using Git.

```bash
git clone https://github.com/gill3hh/Video-Streaming-Platform-Backend.git
```
### 2. Navigate to Project Directory
```bash
cd Video-Streaming-Platform-Backend
```
### 3. Install Dependencies
```bash
npm install
```
### 4. Setup Environment Variables
Create a `.env` file in the root of the project directory and add the necessary environment variables. Use the `.env.example` file as a template
### 5. Start the Development Server
```bash
npm run dev
```
## Acknowlegments
+ This project was inspired by [ChaiAurCode](https://www.youtube.com/@chaiaurcode)
+ I want to emplasize that i have written all the controllers, routes and injected them into project by myself, with the exception of User controller as it was inspired by the tutorial.
+ All other controllers were given as assignment to complete and i have implemented by undersatnding of the concepts learned. 
