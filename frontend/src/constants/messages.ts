/**
 * Centralized frontend messages for fallback and UI-only strings.
 * Actual success/error messages should primarily come from the backend.
 */
export const MESSAGES = {
  SUCCESS: {
    DEFAULT: "Operation successful",
    USER_CREATED: "User created successfully",
    USER_UPDATED: "User updated successfully",
    AUCTION_CREATED: "Auction created successfully",
    BID_PLACED: "Bid placed successfully",
  },
  ERROR: {
    DEFAULT: "An unexpected error occurred",
    UNAUTHORIZED: "Please login to continue",
    FORBIDDEN: "You don't have permission to do this",
    VALIDATION: "Please check the form for errors",
    SERVER: "Server is currently unavailable",
    RATE_LIMIT: "Too many requests. Please slow down and try again later.",
  },
  COMMON: {
    LOADING: "Processing...",
    SAVING: "Saving changes...",
    DELETING: "Deleting...",
  }
};
