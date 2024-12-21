# ft_transcendence
<img width="1446" alt="Screen Shot 2024-12-21 at 1 54 10 PM" src="https://github.com/user-attachments/assets/49fb1b31-5226-4c64-992a-c40f38b53a0f" />

## Overview

### [Ping Pong Game](https://www.youtube.com/watch?v=OMCP8KNT1Rg)

**ft_transcendence** is a web application built with Docker that allows users to register, log in, and play a ping pong game 🏓. Users can invite friends, block them, and engage in games with friends. The application features profile management with avatars, two-factor authentication (2FA), and secure JSON Web Token (JWT) authentication.

## Architecture

The project is composed of three main Docker containers:

1. **NGINX**: 
   - Serves the frontend built with vanilla JavaScript.
   - Acts as a reverse proxy for the backend.

2. **Django Backend**:
   - Built with Django and Django REST Framework.
   - Handles user authentication, game logic, and API endpoints.

3. **PostgreSQL Database**:
   - Stores user data, game history, and other relevant information.

## Features

- User registration and login
- Play ping pong game
- Invite friends and manage friend requests
- Block/unblock users
- Chat functionality with `/invite` and `/accept` commands
- User profiles with customizable avatars
- Two-factor authentication (2FA)
- JWT security for API endpoints

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Installation
- make sure install docker application or tools
1. Clone the repository:
  ```
  git clone https://github.com/Bouhrir/ft_transcendence
  cd ft_transcendence
  ```

2. Build and start the containers:
  ```
  make
  ```

3. Access the application:
  - Frontend: https://localhost:81 ,Use HTTPS for secure connections.

### Configuration
  - Duplicate the .env.example file and rename it to .env.
  - Fill in the necessary variables such as:
      - POSTGRES_USER and POSTGRES_PASSWORD for database setup.
      - SECRET_KEY for token security.
      - SECRET for enabling two-factor authentication.
      - CLIENT_ID for use 42 intra register
  - Make sure to configure the database connection settings.
    
### Usage
  - Register a new account by navigating to the registration page.
  - Log in to access the game features.
  - Use the chat to invite friends and manage game invitations.
  - Customize your profile and enable 2FA for added security.

### API Documentation
  - For API endpoint documentation, refer to the API Docs.

### Acknowledgements
  - [Django REST Framework](https://www.django-rest-framework.org/)
  - [PostgreSQL](https://www.postgresql.org/)
  - [Docker](https://www.docker.com/)

### Contact
  - For questions or feedback, please contact:
    - Oussama Bouhrir
    - Email: bouhrir26@gmail.com

### App Daemon
<img width="1445" alt="Screen Shot 2024-12-21 at 2 38 22 PM" src="https://github.com/user-attachments/assets/bcb4cf2b-e563-4b41-b5a8-9dd6f9239ff9" />
<img width="1445" alt="Screen Shot 2024-12-21 at 1 54 36 PM" src="https://github.com/user-attachments/assets/97c6b99b-9a0b-446f-ab0c-2ab254089d4d" />


