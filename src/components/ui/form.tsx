"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, Control, FieldValues, FieldPath } from "react-hook-form";

import { cn } from "@/lib/utils";

const Form = FormProvider;

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  name,
  control,
  ...props
}: {
  name: TName;
  control: Control<TFieldValues>;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      {...props}
      render={({ field, /* fieldState, formState */ }) => {
        return (
          <FormItem>
            <FormLabel />
            <FormControl>{field.value}</FormControl>
            <FormDescription />
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const FormItemContext = React.createContext<{
  name: string;
}>({ name: "" });

const FormItem = React.forwardRef<  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { name?: string }
>(({ className, name, ...props }, ref) => {
  return (
    <FormItemContext.Provider value={{ name: name || "" }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        error && "text-destructive",
        className
      )}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { formItemId } = useFormField();

  return <Slot ref={ref} id={formItemId} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-[0.8rem] text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-[0.8rem] font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

function useFormField() {
  const fieldContext = React.useContext(FormItemContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, /* formState */ } = useFormContext();

  const _fieldState = getFieldState(fieldContext.name, /* formState */);

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const _id = React.useId();

  return {
    id: _id,
    name: itemContext.name,
    formItemId: `${_id}-form-item`,
    formDescriptionId: `${_id}-form-item-description`,
    formMessageId: `${_id}-form-item-message`,
    ..._fieldState,
  };
}

export { Form, FormField, FormItem, FormControl, FormLabel, FormDescription, FormMessage };
