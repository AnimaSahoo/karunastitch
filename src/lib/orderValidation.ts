import { z } from "zod";

// Rate limiting configuration
const RATE_LIMIT_KEY = "order_submission_timestamps";
const MAX_SUBMISSIONS_PER_HOUR = 3;
const COOLDOWN_MINUTES = 2;

// Validation schema for order form
export const orderFormSchema = z.object({
  // Customer Info
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Name contains invalid characters"),
  
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .or(z.literal("")), // Allow empty email
  
  phone: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[\d\s\-+().]+$/, "Phone number contains invalid characters"),
  
  // Address
  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must be less than 200 characters"),
  
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must be less than 100 characters"),
  
  zip: z
    .string()
    .trim()
    .min(3, "ZIP code must be at least 3 characters")
    .max(20, "ZIP code must be less than 20 characters")
    .regex(/^[\dA-Za-z\s\-]+$/, "ZIP code contains invalid characters"),
  
  country: z
    .string()
    .trim()
    .max(100, "Country must be less than 100 characters"),
  
  // Measurements (all optional, but validated when provided)
  shoulder: z.string().max(10).optional(),
  shoulderFullLength: z.string().max(10).optional(),
  frontNeckDepth: z.string().max(10).optional(),
  chest: z.string().max(10).optional(),
  waist: z.string().max(10).optional(),
  backNeckDepth: z.string().max(10).optional(),
  blouseLength: z.string().max(10).optional(),
  sleeveLength: z.string().max(10).optional(),
  sleeveRound: z.string().max(10).optional(),
  armHole: z.string().max(10).optional(),
  
  // Options
  blouseType: z.enum(["princess-cut", "standard"]),
  hookPosition: z.enum(["front-hook", "back-hook"]),
  extraClothsLaces: z.enum(["yes", "no"]),
  wantMeasurementHelp: z.boolean(),
  isCustomItem: z.boolean(),
  
  // Text fields with limits
  specialRequests: z
    .string()
    .trim()
    .max(1000, "Special requests must be less than 1000 characters"),
  
  designDescription: z
    .string()
    .trim()
    .max(1000, "Design description must be less than 1000 characters"),
});

export type ValidatedOrderForm = z.infer<typeof orderFormSchema>;

// Get submission timestamps from localStorage
const getSubmissionTimestamps = (): number[] => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save submission timestamp
const saveSubmissionTimestamp = (timestamp: number): void => {
  const timestamps = getSubmissionTimestamps();
  // Keep only timestamps from the last hour
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentTimestamps = timestamps.filter((t) => t > oneHourAgo);
  recentTimestamps.push(timestamp);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentTimestamps));
};

// Check if rate limited
export const checkRateLimit = (): { allowed: boolean; message?: string; cooldownSeconds?: number } => {
  const timestamps = getSubmissionTimestamps();
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
  
  // Filter to recent timestamps
  const recentTimestamps = timestamps.filter((t) => t > oneHourAgo);
  
  // Check hourly limit
  if (recentTimestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return {
      allowed: false,
      message: `You've reached the maximum of ${MAX_SUBMISSIONS_PER_HOUR} orders per hour. Please try again later.`,
    };
  }
  
  // Check cooldown since last submission
  if (recentTimestamps.length > 0) {
    const lastSubmission = Math.max(...recentTimestamps);
    const timeSinceLastSubmission = now - lastSubmission;
    
    if (timeSinceLastSubmission < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastSubmission) / 1000);
      return {
        allowed: false,
        message: `Please wait ${remainingSeconds} seconds before placing another order.`,
        cooldownSeconds: remainingSeconds,
      };
    }
  }
  
  return { allowed: true };
};

// Record a submission
export const recordSubmission = (): void => {
  saveSubmissionTimestamp(Date.now());
};

// Check honeypot field - should always be empty
export const checkHoneypot = (value: string): boolean => {
  // If honeypot is filled, it's likely a bot
  return value.trim() === "";
};

// Validate form data with Zod
export const validateOrderForm = (data: unknown): { 
  success: boolean; 
  data?: ValidatedOrderForm; 
  errors?: Record<string, string>;
} => {
  const result = orderFormSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Convert Zod errors to a simple object
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  
  return { success: false, errors };
};

// Sanitize text input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .trim();
};
