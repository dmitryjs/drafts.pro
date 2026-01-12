export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Требуется авторизация",
      description: "Пожалуйста, войдите в систему",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    window.location.href = "/auth";
  }, 500);
}
