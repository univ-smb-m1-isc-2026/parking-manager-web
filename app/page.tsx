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
    </div>
  );
}
