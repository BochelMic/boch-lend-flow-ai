
import { useState } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, variant = "default" }: ToastProps) => {
    console.log("Toast:", { title, description, variant })
    // Simular toast por enquanto com console.log
    // Em produção, integraria com o sistema de toast do shadcn/ui
  }

  return { toast, toasts }
}
