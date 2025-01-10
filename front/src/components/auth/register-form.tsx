"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { RegisterFormHeader } from "@/components/auth/register-form-header";
import { AuthLinks } from "@/components/auth/auth-links";
import { AUTH_MESSAGES } from "@/lib/constants/auth";
import { Loader2 } from 'lucide-react';
import { AreaSelect } from "@/components/auth/area-select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { registerFormSchema, type RegisterFormData } from "@/lib/validations/auth";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      area: "",
    },
  });

  const onSubmit = async (values: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Implement your registration logic here
      console.log("Registration values:", values);
      // If registration is successful, redirect to dashboard or login page
      router.push("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      // Handle registration error (e.g., show error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0">
      <CardHeader>
        <RegisterFormHeader />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      id="name"
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      required
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Endereço de email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      id="email"
                      placeholder="exemplo@gmail.com"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Senha</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword">Confirmar senha</FormLabel>
                  <FormControl>
                    <PasswordInput field={field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="area">Área de interesse</FormLabel>
                  <FormControl>
                    <AreaSelect field={field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {AUTH_MESSAGES.LOADING}
                </>
              ) : (
                AUTH_MESSAGES.REGISTER_BUTTON
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <AuthLinks isRegisterPage />
      </CardFooter>
    </Card>
  );
}
