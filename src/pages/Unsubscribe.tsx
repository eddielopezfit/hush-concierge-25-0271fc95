import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Status =
  | "validating"
  | "valid"
  | "already"
  | "invalid"
  | "submitting"
  | "success"
  | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("validating");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
    fetch(
      `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(
        token
      )}`,
      { headers: { apikey: anonKey } }
    )
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setStatus("invalid");
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
          return;
        }
        if (data.valid === true) {
          setStatus("valid");
          return;
        }
        setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setStatus("submitting");
    try {
      const { data, error } = await supabase.functions.invoke(
        "handle-email-unsubscribe",
        { body: { token } }
      );
      if (error) throw error;
      if (data?.success) {
        setStatus("success");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-3xl text-primary mb-3 tracking-wide">
          HUSH
        </h1>
        <div className="h-px w-16 bg-primary/40 mx-auto mb-8" />

        {status === "validating" && (
          <p className="text-muted-foreground">Checking your link…</p>
        )}

        {status === "valid" && (
          <>
            <h2 className="font-display text-2xl text-foreground mb-3">
              Step away — quietly.
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Click below to unsubscribe from Hush emails. We'll be here if
              you'd ever like to come back.
            </p>
            <Button
              onClick={handleConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              Confirm Unsubscribe
            </Button>
          </>
        )}

        {status === "submitting" && (
          <p className="text-muted-foreground">Processing…</p>
        )}

        {status === "success" && (
          <>
            <h2 className="font-display text-2xl text-foreground mb-3">
              You're unsubscribed.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You won't receive further emails from Hush. Thank you for the
              time we had.
            </p>
          </>
        )}

        {status === "already" && (
          <>
            <h2 className="font-display text-2xl text-foreground mb-3">
              Already unsubscribed.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This email is no longer on our list. Nothing more to do.
            </p>
          </>
        )}

        {status === "invalid" && (
          <>
            <h2 className="font-display text-2xl text-foreground mb-3">
              Link expired or invalid.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Please use the unsubscribe link from a recent email, or call
              us at{" "}
              <a
                href="tel:+15203276753"
                className="text-primary hover:underline"
              >
                (520) 327-6753
              </a>
              .
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="font-display text-2xl text-foreground mb-3">
              Something went wrong.
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {errorMsg ?? "Please try again."}
            </p>
            <Button onClick={handleConfirm} variant="outline">
              Try again
            </Button>
          </>
        )}
      </div>
    </main>
  );
}