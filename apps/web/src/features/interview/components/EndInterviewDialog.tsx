import React from "react";
import { AlertTriangle, PhoneOff } from "lucide-react";

interface EndInterviewDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const EndInterviewDialog: React.FC<EndInterviewDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-neutral-200">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#F42A18] flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white">Leave Interview?</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Are you sure you want to end this interview session? Your completed conversation turns will be submitted for multi-agent assessment.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition"
          >
            Stay in Interview
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d82212] text-white flex items-center gap-2 shadow-lg transition"
          >
            <PhoneOff className="w-4 h-4" />
            <span>{isSubmitting ? "Submitting Assessment..." : "Yes, End Interview"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
