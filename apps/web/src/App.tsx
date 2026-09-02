import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/context/theme-context"
import { MainLayout } from "@/components/layout/MainLayout"
import { HomePage } from "@/pages/Home"
import { SigninPage } from "@/pages/Signin"
import { SignupPage } from "@/pages/Signup"
import { DashboardPage } from "@/pages/Dashboard"
import { TeachersPage } from "@/pages/Teachers"
import { NotFoundPage } from "@/pages/NotFound"

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <BrowserRouter>
      <Routes>
        {/* Layout with Navbar for general pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dashboard page without Navbar */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
