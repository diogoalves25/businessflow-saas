import * as React from "react"

type ToastActionElement = React.ReactElement

interface Toast {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (toastId: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Return a mock implementation if no provider
    return {
      toasts: [],
      toast: () => {},
      dismiss: () => {},
    }
  }
  return context
}