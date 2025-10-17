import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  variant = 'default'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === 'destructive' ? (
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            )}
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed mt-2">
          {description}
        </AlertDialogDescription>
        
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
          <AlertDialogCancel className="w-full sm:w-auto">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};