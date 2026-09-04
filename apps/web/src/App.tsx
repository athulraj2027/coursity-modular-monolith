import { BrowserRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { queryClient } from "@/lib/query-client"
import { ThemeProvider } from "@/context/theme-context"
import { ThemedToastContainer } from "@/components/common/ThemedToastContainer"
import { AppRoutes } from "./router"

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ThemedToastContainer />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
