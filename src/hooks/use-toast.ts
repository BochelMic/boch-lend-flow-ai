
import { useState, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: React.ReactNode
}

type ToasterToast = ToastProps & {
  id: string
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const toast = useCallback(({ title, description, variant = "default", action }: Omit<ToastProps, "id">) => {
    const id = genId()
    const newToast: ToasterToast = {
      id,
      title,
      description,
      variant,
      action,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      update: (props: Partial<ToasterToast>) => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...props } : t))
        )
      },
    }
  }, [])

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId))
  }, [])

  return {
    toast,
    toasts,
    dismiss,
  }
}

export { toast } from "./use-toast"
