# Savannah-Project
Savannah Informatics Assessment Project 

# MovieMate

## Setup Instructions

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add the following:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   Replace `your_tmdb_api_key_here` with your actual TMDB API key.
4. Start the development server:
   ```bash
   npm run dev
   ```

# Interview Preparation Guide for MovieMate Project
   # Overview
Based on your project structure, you'll need to walk the interview team through your MovieMate application. Here's how to prepare for an effective technical walkthrough:

   # 1. Project Introduction (2-3 minutes)
-Brief overview: 
    "MovieMate is a responsive web application built with React, TypeScript, and Tailwind CSS that allows users to discover movies and TV shows"
-Key technologies: 
    React, TypeScript, Zustand, React Router, TMDB API, Tailwind CSS
-Project structure: 
    Explain the organization of your codebase (components, pages, store, lib)
   
   # 2. Architecture Walkthrough (5-7 minutes)
-State management: 
    Demonstrate your Zustand stores (authStore.ts, movieStore.ts, tvSeriesStore.ts)
-API integration: 
    Walk through tmdb.ts and show how you're fetching data
-Routing: 
    Explain how App.tsx defines your routes and protected routes
   # 3. Key Features Demonstration (10-15 minutes)
Be prepared to show:

-Authentication flow: 
    From Auth.tsx to protected routes
-Movie/TV Series browsing: 
    Show both list views and how filters work
-Search functionality: 
    Demonstrate the search with debouncing from useDebounce.ts
-Details pages: 
    Show movie/TV series detail pages and how they fetch and display data
-Responsive design: 
    Show how the UI adapts to different screen sizes

   # 4. Code Quality Highlights (5-7 minutes)
-Component reusability: 
    Show how MovieCard and TVSeriesCard follow similar patterns
-Custom hooks: 
    Explain useDebounce.ts and its implementation
-Testing approach: 
    Discuss your test files in tests
-CI/CD pipeline: 
    Explain your GitHub Actions workflow in ci.yml

   # 5. Technical Challenges (3-5 minutes)
Prepare to discuss:

-How you implemented the authentication system
-Data fetching strategies and error handling
-Performance optimizations (like pagination)
-Any interesting bugs you solved

   # 6. Potential Improvements (2-3 minutes)
Show you're thinking ahead:

-Additional features you'd add with more time
-Performance optimizations you'd implement
-UX improvements you'd make
-Testing coverage you'd expand

 # Important Files to Highlight

# Core Components:
-MovieCard.tsx and TVSeriesCard.tsx - Show component design
-SearchBar.tsx - Explain search implementation

# State Management:
-movieStore.ts - Demonstrate Zustand store patterns

# Pages:
Home.tsx - Entry point for user experience
MovieDetails.tsx - Show data fetching and display

# Authentication:
authStore.ts - Explain auth state management
ProtectedRoute.tsx - Show route protection

# API Integration:
tmdb.ts - API interaction

# Technical Interview Tips
-Be prepared to explain any specific code section if asked
-Know your CSS/Tailwind implementation details
-Understand the flow of data through your application
-Be ready to discuss your testing approach and CI/CD setup
-Have clear explanations for architectural decisions
