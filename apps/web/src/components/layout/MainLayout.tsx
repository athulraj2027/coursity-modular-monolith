import React from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-black dark:text-neutral-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
