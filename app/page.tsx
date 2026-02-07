import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link
        href="/hello"
        className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Aller à la page Hello
      </Link>

      <Link
        href="/signIn"
        className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Aller à la page signIn
      </Link>

      <Link
        href="/signUp"
        className="rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
      >
        Aller à la page signUp
      </Link>
    </div>
  );
}
