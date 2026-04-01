export type UserRole = "subscriber" | "admin";

export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "canceled"
  | "past_due"
  | "lapsed";

export type DrawType = "random" | "algorithmic";

export type DrawStatus = "draft" | "simulated" | "published";

export type WinnerReviewStatus = "pending" | "approved" | "rejected";

export type PaymentStatus = "pending" | "paid";
