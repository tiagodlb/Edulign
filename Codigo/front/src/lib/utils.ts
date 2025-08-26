// lib/utils.ts
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format a date string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Checks if a user has permission for an action
 */
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Trunca um texto com ellipsis após um número específico de caracteres
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Gera um ID único baseado em timestamp e número aleatório
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Retorna há quanto tempo uma data ocorreu em formato legível (ex: "há 2 dias")
 */
export function timeAgo(date: Date | string): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "há 1 ano" : `há ${interval} anos`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "há 1 mês" : `há ${interval} meses`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "há 1 dia" : `há ${interval} dias`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "há 1 hora" : `há ${interval} horas`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "há 1 minuto" : `há ${interval} minutos`;
  }
  
  return seconds < 10 ? "agora mesmo" : `há ${Math.floor(seconds)} segundos`;
}

/**
 * Retorna a primeira letra de cada palavra em maiúsculo
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Verifica se estamos em ambiente de produção
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Retorna o device a partir do user agent
 */
export function getDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  
  return "desktop";
}

/**
 * Sleep function para uso com async/await
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sanitiza uma string para uso em URLs
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}