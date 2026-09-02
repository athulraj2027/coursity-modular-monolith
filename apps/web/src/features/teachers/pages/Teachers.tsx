import React from "react"
import { TeacherHero } from "../components/TeacherHero"
import { TeacherStats } from "../components/TeacherStats"
import { TeacherFeatures } from "../components/TeacherFeatures"
import { TeacherSteps } from "../components/TeacherSteps"

export const TeachersPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center">
      <TeacherHero />
      <TeacherStats />
      <TeacherFeatures />
      <TeacherSteps />
    </div>
  )
}

export default TeachersPage
