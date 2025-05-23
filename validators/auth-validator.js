import z from "zod";

export const loginUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Name must be no more than 100 characters." }),

  password: z
    .string()
    .trim()
    .min(3, { message: "Password must be at least 3 characters long." })
    .max(100, { message: "Password must be no more than 100 characters." }),
});

export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name must be no more than 100 characters." }),

  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Name must be no more than 100 characters." }),

  password: z
    .string()
    .trim()
    .min(3, { message: "Password must be at least 3 characters long." })
    .max(100, { message: "Password must be no more than 100 characters." }),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().length(8),
});

export const editUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(100, { message: "Name must be no more than 100 characters." }),
});

export const verifyPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current Password is required!" }),

    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),

    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password don't match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." }),
});

export const forgotPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "New Password must be at least 6 characters long." })
      .max(100, {
        message: "New Password must be no more than 100 characters.",
      }),

    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm Password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm Password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password don't match.",
    path: ["confirmPassword"],
  });

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." })
      .max(100, { message: "Password must be no more than 100 characters." }),

    confirmPassword: z
      .string()
      .min(6, {
        message: "Confirm password must be at least 6 characters long.",
      })
      .max(100, {
        message: "Confirm password must be no more than 100 characters.",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match.",
    path: ["confirmPassword"],
  });
