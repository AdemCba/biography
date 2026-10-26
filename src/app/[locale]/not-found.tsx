import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="mt-4">
        <Link href="/" className="underline">Home</Link>
      </p>
    </div>
  );
}
