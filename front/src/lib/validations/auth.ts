import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .min(3, "Email precisa ter no mínimo 3 caracteres.")
    .max(50, "Email não pode ter mais de 50 caracteres."),
  password: z
    .string()
    .min(6, "Senha precisa de pelo menos 6 caracteres.")
    .max(20, "A senha não pode ser maior que 20 caracteres."),
  rememberMe: z.boolean().optional(),
});

export const registerFormSchema = loginFormSchema.extend({
  name: z.string().min(5, "Por favor, insira seu nome."),
  area: z.string().min(1, "Por favor, selecione uma área de interesse."),
  confirmPassword: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;