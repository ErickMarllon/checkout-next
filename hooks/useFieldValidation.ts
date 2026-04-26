import { FieldValues, Path, useFormContext } from "react-hook-form";

export function useFieldValidation<T extends FieldValues>() {
  const { getFieldState } = useFormContext<T>();

  const checkIsValidField = (key: Path<T>) => {
    const fieldState = getFieldState(key);
    const isValid = !fieldState.invalid && fieldState.isDirty;
    return isValid;
  };

  return { checkIsValidField };
}
