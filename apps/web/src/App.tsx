import { BrowserRouter, Routes, Route } from "react-router-dom"
import { HomePage } from "@/pages/Home"
import { SigninPage } from "@/pages/Signin"
import { SignupPage } from "@/pages/Signup"
import { DashboardPage } from "@/pages/Dashboard"
import { NotFoundPage } from "@/pages/NotFound"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
