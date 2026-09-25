import { useParams, Link } from "react-router-dom";
import { useGetCertificate } from "../hooks/use-enrollment";
import { Button } from "@/components/ui/button";
import { Award, ShieldCheck, CheckCircle2, ArrowLeft, Printer, Share2 } from "lucide-react";
import { useState } from "react";

export function CertificateViewPage() {
  const { code } = useParams<{ code: string }>();
  const { data: cert, isLoading, isError } = useGetCertificate(code || "");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-neutral-500">Verifying Certificate...</p>
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Certificate Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          No verified certificate matches the code <code className="font-mono">{code}</code>.
        </p>
        <Button asChild className="rounded-xl text-xs font-bold">
          <Link to="/courses">Browse Verified Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-8 min-h-screen">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-xl text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white gap-1.5 cursor-pointer"
        >
          <Link to="/students/courses">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Link Copied!" : "Share Certificate"}</span>
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-bold gap-1.5 shadow-md shadow-[#F42A18]/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Certificate</span>
          </Button>
        </div>
      </div>

      {/* Verified Certificate Card */}
      <div className="bg-white dark:bg-neutral-900 border-4 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
        {/* Background Watermark & Accents */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-[#F42A18]/5 blur-3xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Certificate of Completion
          </span>
          <h2 className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
            Coursity Live Interactive Academy
          </h2>
        </div>

        {/* Recipient */}
        <div className="space-y-2 py-4 border-y border-neutral-100 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">This is to proudly certify that</p>
          <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-serif tracking-wide">
            {cert.studentName}
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed pt-1">
            has successfully completed all live lecture modules, coursework requirements, and syllabus assessments for
          </p>
          <h4 className="text-lg sm:text-xl font-bold text-[#F42A18] pt-2">
            {cert.courseTitle}
          </h4>
        </div>

        {/* Verification & Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 items-end text-xs">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-neutral-400 text-[11px] block">Instructor</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {cert.instructorName}
            </span>
          </div>

          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Authentic</span>
            </div>
            <p className="font-mono text-[11px] text-neutral-400">{cert.certificateCode}</p>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <span className="text-neutral-400 text-[11px] block">Issued On</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              {new Date(cert.issuedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
