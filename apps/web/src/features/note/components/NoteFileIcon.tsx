import React from "react";
import { FileText, Presentation, FileCode, File, FileSpreadsheet } from "lucide-react";

interface NoteFileIconProps {
  extension?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const NoteFileIcon: React.FC<NoteFileIconProps> = ({
  extension = "",
  className = "",
  size = "md",
}) => {
  const ext = (extension || "").toLowerCase().replace(/^\./, "");

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg text-xs",
    md: "w-10 h-10 rounded-xl text-sm",
    lg: "w-12 h-12 rounded-2xl text-base",
  }[size];

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  if (ext === "pdf") {
    return (
      <div
        className={`flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0 shadow-xs ${sizeClasses} ${className}`}
      >
        <FileText className={iconSizes} />
      </div>
    );
  }

  if (ext === "ppt" || ext === "pptx") {
    return (
      <div
        className={`flex items-center justify-center bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0 shadow-xs ${sizeClasses} ${className}`}
      >
        <Presentation className={iconSizes} />
      </div>
    );
  }

  if (ext === "doc" || ext === "docx") {
    return (
      <div
        className={`flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 shadow-xs ${sizeClasses} ${className}`}
      >
        <FileText className={iconSizes} />
      </div>
    );
  }

  if (ext === "xls" || ext === "xlsx" || ext === "csv") {
    return (
      <div
        className={`flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 shadow-xs ${sizeClasses} ${className}`}
      >
        <FileSpreadsheet className={iconSizes} />
      </div>
    );
  }

  if (ext === "zip" || ext === "rar" || ext === "tar") {
    return (
      <div
        className={`flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 shadow-xs ${sizeClasses} ${className}`}
      >
        <FileCode className={iconSizes} />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 shrink-0 shadow-xs ${sizeClasses} ${className}`}
    >
      <File className={iconSizes} />
    </div>
  );
};
