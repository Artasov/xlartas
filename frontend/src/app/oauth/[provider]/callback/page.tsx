import type { Metadata } from "next";
import OAuthCallback from "../../../../Modules/Auth/Social/OAuthCallback";

export const metadata: Metadata = {
  title: "OAuth Callback - XLARTAS",
  description: "OAuth provider callback",
};

export default function OAuthCallbackPage() {
  return <OAuthCallback />;
}
