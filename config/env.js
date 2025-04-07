import { z } from "zod";

export const env = z
  .object({
    PORT: z.coerce.number().default(3000),
    //? Using mongodb
    // MONGODB_URI: z.string(),
    // MONGODB_DATABASE_NAME: z.string(),

    //? Using MySQL
    DATABASE_HOST: z.string(),
    DATABASE_USER: z.string(),
    DATABASE_PASSWORD: z.string(),
    DATABASE_NAME: z.string(),
  })
  .parse(process.env);
