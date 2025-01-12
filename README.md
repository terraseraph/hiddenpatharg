# Hidden Path ARG Game

A Next.js-based Alternate Reality Game (ARG) platform that allows teams to solve puzzles and progress through interactive game instances. Built with the T3 Stack for robust type safety and modern development practices.

## Features

- Multiple puzzle types (input, multiple choice, QR code, image, location)
- Team management system
- Booking system for game sessions
- Real-time game progress tracking
- Admin dashboard for game management
- Authentication system

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- SQLite database (configurable to other databases)

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/terraseraph/hiddenpatharg.git
   cd hiddenpatharg
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your environment variables.

4. Set up the database:

   ```bash
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

For production deployment, consider using:

- [Vercel](https://vercel.com) (Recommended)
- [Docker](https://www.docker.com)
- Any Node.js hosting platform

## Database Schema

### Core Game Models

#### Game

- Main game configuration
- Contains puzzles and can have multiple bookings/instances

#### Puzzle

- Individual challenges within games
- Types: input, multiple_choice, qrcode, image, location
- Tracks which users have solved it

#### Team

- Group of players
- Can have multiple bookings and game instances
- Stores player information as JSON

### Booking System

#### Booking

- Links teams to games
- Includes booking code, payment status, and scheduling
- Can have an associated game instance

#### GameInstance

- Active game session
- Tracks progress, start/completion times
- Records solved puzzles

### Authentication

#### User

- Player account information
- Tracks solved puzzles
- Links to auth accounts/sessions

#### Account

- OAuth account information
- Linked to users

#### Session

- Auth session management

#### VerificationToken

- Email verification tokens

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
