import { useTeacherCourseStudents } from "../hooks/use-enrollment";
import { Users, GraduationCap, Calendar, CheckCircle2, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TeacherEnrolledStudentsTabProps {
  courseId: string;
}

export function TeacherEnrolledStudentsTab({ courseId }: TeacherEnrolledStudentsTabProps) {
  const { data: students = [], isLoading } = useTeacherCourseStudents(courseId);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-5 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#F42A18]" />
            <span>Enrolled Students ({students.length})</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor live class attendance, syllabus progress, and student participation.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-neutral-400">Loading enrolled students...</div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Students Enrolled Yet</h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Share your course link and promotional coupons to start filling up this live batch cohort.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/70 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Enrollment Status</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Live Classes Attended</th>
                  <th className="p-4">Enrolled On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/50 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{st.studentName || "Student"}</p>
                        <p className="text-[11px] text-neutral-400">{st.studentEmail}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          st.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                            : st.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]"
                            : "bg-red-500/10 text-red-600 border-red-500/20 text-[10px]"
                        }
                      >
                        {st.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 max-w-[120px]">
                        <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-[#F42A18] rounded-full"
                            style={{ width: `${st.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px]">{st.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        {st.attendedClassesCount} classes attended
                      </span>
                    </td>
                    <td className="p-4 text-neutral-500">
                      {new Date(st.enrolledAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
