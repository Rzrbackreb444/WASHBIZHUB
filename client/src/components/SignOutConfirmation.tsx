import { useState, useCallback, createContext, useContext } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface SignOutContextValue {
  signOut: () => void;
  isSigningOut: boolean;
}

const SignOutContext = createContext<SignOutContextValue | null>(null);

export function useSignOut(): SignOutContextValue {
  const context = useContext(SignOutContext);
  if (!context) {
    throw new Error("useSignOut must be used within a SignOutConfirmationProvider");
  }
  return context;
}

interface SignOutConfirmationProviderProps {
  children: React.ReactNode;
}

export function SignOutConfirmationProvider({ children }: SignOutConfirmationProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout error:", e);
    }
    window.location.href = "/";
  }, []);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SignOutContext.Provider value={{ signOut, isSigningOut }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent data-testid="dialog-signout-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out of your account and redirected to the home page. Any unsaved changes may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              disabled={isSigningOut}
              data-testid="button-signout-cancel"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isSigningOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-signout-confirm"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                "Sign Out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SignOutContext.Provider>
  );
}
