import React from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useTheme } from "@/context/theme-context"

export const ThemedToastContainer: React.FC = () => {
  const { theme } = useTheme()

  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === "light" ? "light" : "dark"}
    />
  )
}

export default ThemedToastContainer
