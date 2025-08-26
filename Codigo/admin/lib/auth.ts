export function getAuthToken(): string | null {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  return token
}

export function setAuthToken(token: string, rememberMe: boolean = false): void {
  if (rememberMe) {
    localStorage.setItem('authToken', token)
  } else {
    sessionStorage.setItem('authToken', token)
  }
}

export function clearAuthToken(): void {
  localStorage.removeItem('authToken')
  sessionStorage.removeItem('authToken')
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}