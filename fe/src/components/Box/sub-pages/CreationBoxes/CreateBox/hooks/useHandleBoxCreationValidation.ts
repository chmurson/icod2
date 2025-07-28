import { useCallback, useRef } from "react";
import { type CreateBoxSchema, useValidateBoxForm } from "./useValidateBoxForm";

type Props = {
  onValid: (payload: CreateBoxSchema) => void | Promise<void>;
};

export const useBoxCreationValidation = ({ onValid }: Props) => {
  const onValidRef = useRef(onValid);
  onValidRef.current = onValid;
  const { errors, getError, validate } = useValidateBoxForm();

  const handleBoxCreationValidation = useCallback(
    (payload: CreateBoxSchema) => {
      const isValid = validate(payload);

      if (!isValid) {
        return;
      }

      onValidRef.current(payload);
    },
    [validate],
  );

  return {
    handleBoxCreationValidation,
    errors,
    getError,
  };
};
