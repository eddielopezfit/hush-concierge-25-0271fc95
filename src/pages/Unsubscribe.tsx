import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already" | "invalid" | "submitting" | "done" | "error";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const validate = async () => {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: supabaseAnonKey } }
        );
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
          return;
        }
        if (data.valid) {
          setStatus("valid");
          return;
        }
        setStatus("invalid");
      } catch (e) {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setStatus("submitting");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setStatus("done");
      } else if (data?.reason === "already_unsubscribed") {
        setStatus("already");
      } else {
        setStatus("error");
        setError("Something went wrong.");
      }
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6 py-16">
        <div className="space-y-2">
          <h1
            className="text-4xl tracking-[0.3em] font-bold text-foreground"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            HUSH
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-primary">
            Salon · Spa · Sanctuary
          </p>
        </div>

        {status === "loading" && (
          <p className="text-muted-foreground">Validating your link…</p>
        )}

        {status === "valid" && (
          <div className="space-y-6">
            <h2 className="text-2xl text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
              Unsubscribe from emails?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We'll stop sending you marketing and notification emails from Hush Salon.
              You'll still receive essential transactional emails (like booking confirmations).
            </p>
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-sm tracking-[0.15em] uppercase font-semibold hover:opacity-90 transition-opacity"
            >
              Confirm Unsubscribe
            </button>
          </div>
        )}

        {status === "submitting" && (
          <p className="text-muted-foreground">Processing…</p>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <h2 className="text-2xl text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
              You've been unsubscribed.
            </h2>
            <p className="text-muted-foreground">
              Sorry to see you go. You're always welcome back at hush-salon.lovable.app.
            </p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-3">
            <h2 className="text-2xl text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
              Already unsubscribed
            </h2>
            <p className="text-muted-foreground">
              This email address has already been removed from our list.
            </p>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-3">
            <h2 className="text-2xl text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
              Invalid or expired link
            </h2>
            <p className="text-muted-foreground">
              This unsubscribe link is no longer valid. If you'd like to stop receiving emails,
              please call us at <strong>(520) 327-6753</strong>.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <h2 className="text-2xl text-foreground" style={{ fontFamily: "Playfair Display, serif" }}>
              Something went wrong
            </h2>
            <p className="text-muted-foreground">{error || "Please try again."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;