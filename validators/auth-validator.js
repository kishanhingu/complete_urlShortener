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
    .min(6, { message: "Password must be at least 3 characters long." })
    .max(100, { message: "Password must be no more than 100 characters." }),
});
