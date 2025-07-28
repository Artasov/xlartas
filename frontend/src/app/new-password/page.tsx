import type { Metadata } from "next";
import NewPassword from "../../Modules/Core/pages/NewPassword";

export const metadata: Metadata = {
  title: "Reset Password - XLARTAS",
  description: "Change your password on XLARTAS platform",
};

export default function NewPasswordPage() {
  return <NewPassword />;
}
