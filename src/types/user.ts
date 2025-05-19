/**
 * User interface definition for MongoDB user model
 */
export interface User {
  _id: string;
  email: string;
  name?: string;
  favorites?: number[];
  watchlist?: number[];
  customLists?: {
    name: string;
    items: {
      id: number;
      title: string;
      poster_path?: string;
      media_type: string;
    }[];
  }[];
  createdAt?: string;
  updatedAt?: string;
}