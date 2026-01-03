import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormProps,
} from "react-hook-form";
import type { z, ZodType } from "zod";
import * as React from "react";
import { View } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm as __useForm,
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";

import { cn } from "../lib/utils";
import { Text } from "./text";

const useForm = <TSchema extends ZodType<FieldValues, FieldValues>>(
  props: Omit<
    UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>,
    "resolver"
  > & {
    schema: TSchema;
  },
) => {
  const form = __useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
};

const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<typeof View>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View
        data-slot="form-item"
        className={cn("gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Text>) {
  const { error, formItemId } = useFormField();

  return (
    <Text
      data-slot="form-label"
      className={cn(
        "text-sm font-medium",
        error && "text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof View>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return <View data-slot="form-control" id={formItemId} {...props} />;
}

function FormDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  const { formDescriptionId } = useFormField();

  return (
    <Text
      data-slot="form-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Text>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <Text
      data-slot="form-message"
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </Text>
  );
}

export {
  useForm,
  useFormField,
  useFormContext,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
