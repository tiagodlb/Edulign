import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { loginUser } from "@/lib/api/auth";
import { loginFormSchema } from "@/lib/validations/auth";
import { AUTH_COOKIE_CONFIG } from "@/lib/constants/auth";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const credentials = loginFormSchema.parse(body);
    
    const result = await loginUser(credentials);
    
    const response = NextResponse.json(result);
    
    // Cookies
    if (credentials.rememberMe && result.tokens) {
      const { accessToken, refreshToken } = result.tokens;
      const cookieStore = await cookies();
      
      cookieStore.set(AUTH_COOKIE_CONFIG.TOKEN, accessToken, {
        ...AUTH_COOKIE_CONFIG.OPTIONS,
        maxAge: AUTH_COOKIE_CONFIG.MAX_AGE,
      });
      
      if (refreshToken) {
        cookieStore.set(AUTH_COOKIE_CONFIG.REFRESH_TOKEN, refreshToken, {
          ...AUTH_COOKIE_CONFIG.OPTIONS,
          maxAge: AUTH_COOKIE_CONFIG.MAX_AGE,
        });
      }
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados de entrada inválidos", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error ? 401 : 500 }
    );
  }
}