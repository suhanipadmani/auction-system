import rateLimit from "express-rate-limit";

// Strict rate limit for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, 
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Very strict rate limit for registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    message: "Too many registration attempts, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Relaxed rate limit for bidding
export const bidLimiter = rateLimit({
  windowMs: 60 * 1000,  
  max: 100,  
  message: {
    success: false,
    message: "Too many bid attempts, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limit for other API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   
  max: 1000,  
  message: {
    success: false,
    message: "Too many requests, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
