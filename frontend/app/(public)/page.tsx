import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>this is the main public page</h1>

      <Link href="/admin">Admin</Link>

      <Link href="/company">Company</Link>
    </main>
  );
}
