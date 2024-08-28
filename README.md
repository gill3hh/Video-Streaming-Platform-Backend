# Complex Backend Project
This is a complex backend project built using JavaScript with a focus on creating a production-level setup. The project is structured with specific folders for utilities, middleware, authentication, controllers, and handles API responses and errors like you would in a production environment.

## Features
+ ** Authentication **: Implemented using JWT (JSON Web Tokens) with both access and refresh tokens for secure and efficient user authentication.
+ ** Password Encryption **: Utilized bcrypt for hashing and securing user passwords.
+ ** File Upload **: Integrated `multer` for handling file uploads, with further integration with `Cloudinary` for cloud storage.
+ ** Database **: MongoDB is used as the database, with Mongoose for object data modeling (ODM).
+ ** Core Logic **: Built many features using core JavaScript functionalities, minimizing the use of external libraries to enhance understanding and control over the codebase.
+ ** Error Handling **: Robust API error and response handling, ensuring the application is reliable and easy to debug.

## Technologies Used
+ ** Node.js **: Server-side JavaScript runtime environment.
+ ** Express **: Fast and minimalist web framework for Node.js.
+ ** MongoDB **: NoSQL database for storing data.
+ ** Mongoose **: ODM library for MongoDB and Node.js.
+ ** JWT **: For creating and verifying tokens for user authentication.
+ ** bcrypt **: For hashing passwords.
+ ** Multer **: Middleware for handling multipart/form-data, which is used for uploading files.
+ ** Cloudinary **: Cloud-based image and video management service.
+ ** JavaScript **: Core logic and functionality.

## Project Structure
+ ** controllers **: Contains the logic for handling requests and returning responses.
+ ** middleware **: Custom middleware functions to handle various tasks like authentication, error handling, etc.
+ ** utils **: Utility functions used across different parts of the application.
+ ** auth **: Handles everything related to authentication, including token generation and verification.
