import React, { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import TVSeriesDetails from './pages/TVSeriesDetails';
import TVSeriesPage from './pages/TVSeriesPage';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import MovieList from './pages/MovieList';
import MostWatched from './pages/MostWatched';
import Latest from './pages/Latest';
import MyListsPage from './pages/MyListsPage';
import GenrePage from './pages/GenrePage';

const queryClient = new QueryClient();

function App() {
  const { checkAuthentication, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    // Check for stored user session on app load
    checkAuthentication();
  }, [checkAuthentication]);

  // Layout component to include Navbar
  const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Create router with the routes configuration
  const router = createBrowserRouter([
    {
      path: "/auth",
      element: loading ? (
        <Layout>
          <LoadingSpinner />
        </Layout>
      ) : isAuthenticated ? (
        <Navigate to="/" replace />
      ) : (
        <Layout>
          <Auth />
        </Layout>
      ),
    },
    {
      path: "/",
      element: (
        <Layout>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/movie/:id",
      element: (
        <Layout>
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/movies",
      element: (
        <Layout>
          <ProtectedRoute>
            <MovieList type="movie" />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/tv",
      element: (
        <Layout>
          <ProtectedRoute>
            <TVSeriesPage />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/series",
      element: (
        <Layout>
          <ProtectedRoute>
            <MovieList type="tv" />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/tv/:id",
      element: (
        <Layout>
          <ProtectedRoute>
            <TVSeriesDetails />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/most-watched",
      element: (
        <Layout>
          <ProtectedRoute>
            <MostWatched />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/latest",
      element: (
        <Layout>
          <ProtectedRoute>
            <Latest />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/my-lists",
      element: (
        <Layout>
          <ProtectedRoute>
            <MyListsPage />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "/genre/:genreId",
      element: (
        <Layout>
          <ProtectedRoute>
            <GenrePage />
          </ProtectedRoute>
        </Layout>
      ),
    },
    {
      path: "*",
      element: (
        <Layout>
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Layout>
      ),
    },
  ], {
    // Only use valid flags
    future: {
      v7_relativeSplatPath: true
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;