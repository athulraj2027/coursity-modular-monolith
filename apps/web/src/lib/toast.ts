import { toast as toastify, type ToastOptions } from "react-toastify"

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toastify.success(message, {
      ...defaultOptions,
      ...options,
    }),

  error: (message: string, options?: ToastOptions) =>
    toastify.error(message, {
      ...defaultOptions,
      ...options,
    }),

  info: (message: string, options?: ToastOptions) =>
    toastify.info(message, {
      ...defaultOptions,
      ...options,
    }),

  warning: (message: string, options?: ToastOptions) =>
    toastify.warning(message, {
      ...defaultOptions,
      ...options,
    }),

  loading: (message: string, options?: ToastOptions) =>
    toastify.loading(message, {
      ...defaultOptions,
      ...options,
    }),

  dismiss: (toastId?: string | number) => toastify.dismiss(toastId),
}

export const toast = showToast
export default showToast
