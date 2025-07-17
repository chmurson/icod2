import { useCallback, useState } from "react";
import z from "zod";
import { useCreateBoxStore } from "@/stores";

export const useCreateBoxState = () => {
  const title = useCreateBoxStore((state) => state.title);
  const content = useCreateBoxStore((state) => state.content);
  const leader = useCreateBoxStore((state) => state.leader);
  const threshold = useCreateBoxStore((state) => state.threshold);
  const keyHolders = useCreateBoxStore((state) => state.keyHolders);
  const actions = useCreateBoxStore((state) => state.actions);

  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const validate = useCallback(
    (partialStateUpdate?: Partial<CreateBoxSchema>) => {
      setErrors(null);
      const dataToValidate = {
        title,
        content,
        keyHolders: keyHolders,
        threshold,
        ...partialStateUpdate,
      } satisfies CreateBoxSchema;

      const validationResult = createBoxSchema.safeParse(dataToValidate);

      if (!validationResult.success) {
        setErrors(validationResult.error);
        return false;
      }
      return true;
    },
    [title, content, keyHolders, threshold],
  );

  const getError = (fieldName: keyof CreateBoxSchema) => {
    return errors?.errors.find((e) => e.path[0] === fieldName)?.message;
  };

  return {
    state: {
      title,
      content,
      leader,
      threshold,
      keyHolders: keyHolders,
    },
    actions,
    getError,
    validate: validate,
  };
};

const createBoxSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, { message: "Title must be at least 3 characters long." }),
    content: z.string().trim().min(1, { message: "Content cannot be empty." }),
    threshold: z.number().min(1, { message: "Threshold must be at least 1." }),
    keyHolders: z
      .array(z.any())
      .min(1, { message: "At least one keyHolders is required." }),
  })
  .refine((data) => data.threshold <= data.keyHolders.length + 1, {
    message: "Threshold cannot be greater than the total number of keyHolders.",
    path: ["threshold"], // This will attach the error message to the `threshold` field
  });

type CreateBoxSchema = z.infer<typeof createBoxSchema>;
