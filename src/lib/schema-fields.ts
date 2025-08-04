import * as yup from "yup";

export const strictEmailSchema = (message: string | undefined) => yup.string().email(message).matches(/^[^.]+(\.[^.]+)*@.*\.[^.][^.]+$/, message);

export const yupObject = (schema: Record<string, any>) => yup.object().shape(schema);