import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Compass, Home, ArrowLeft } from "lucide-react"

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-[#F42A18]/10 border border-[#F42A18]/20 flex items-center justify-center text-[#F42A18] shadow-lg shadow-[#F42A18]/5 animate-in zoom-in duration-300">
          <Compass className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-[#F42A18] bg-[#F42A18]/10 px-3 py-1 rounded-full border border-[#F42A18]/20">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Lost in Cyberspace?
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            The page you're looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="w-full sm:w-auto bg-[#F42A18] hover:bg-[#d92211] text-white shadow-md shadow-[#F42A18]/20 rounded-xl"
          >
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto rounded-xl border-neutral-200 dark:border-neutral-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
