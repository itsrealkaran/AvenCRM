import EmailPageContent from "@/components/email/EmailPageContent";
import { Suspense } from "react";

function EmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailPageContent />
    </Suspense>
  );
}

export default EmailPage;