import React from "react";
import { Download, ExternalLink, Trash2, Calendar, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteFileIcon } from "./NoteFileIcon";
import type { Note } from "../types/note.types";

interface NoteCardProps {
  note: Note;
  canManage?: boolean;
  onDelete?: (note: Note) => void;
  className?: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  canManage = false,
  onDelete,
  className = "",
}) => {
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const ext = (note.fileExtension || "pdf").toUpperCase();

  return (
    <div
      className={`group relative p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-xs hover:shadow-sm flex flex-col justify-between gap-3.5 ${className}`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <NoteFileIcon extension={note.fileExtension} size="md" />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
              {note.name}
            </h4>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700">
              {ext}
            </span>
          </div>

          {note.description && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
              {note.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            {note.fileSizeBytes > 0 && (
              <span className="flex items-center gap-1 font-mono">
                <HardDrive className="w-3 h-3" />
                {formatBytes(note.fileSizeBytes)}
              </span>
            )}
            {note.fileSizeBytes > 0 && formattedDate && <span>•</span>}
            {formattedDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 gap-2">
        <div className="flex items-center gap-1.5">
          <a
            href={note.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-[#F42A18] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Preview
          </a>
          <span className="text-neutral-300 dark:text-neutral-700">|</span>
          <a
            href={note.fileUrl}
            download={note.name}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F42A18] hover:underline"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
        </div>

        {canManage && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note)}
            className="h-7 w-7 p-0 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
