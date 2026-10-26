import Link from "next/link";
import type { Article, Person } from "@/lib/content";
import { personPath } from "@/lib/content";

export function PersonCard({ person, article }: { person: Person; article: Article }) {
  const img = person.data.image;
  return (
    <Link href={personPath(article.locale, article.meta.slug)} className="group flex gap-4 rounded-lg border border-line bg-white p-4 transition hover:border-ink/30">
      {img ? (
        // Plain img: the site is a static export and images are already sized in /public/images.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.src} alt={img.alt} width={72} height={72} loading="lazy" className="size-18 shrink-0 rounded-md object-cover" />
      ) : (
        <div aria-hidden className="flex size-18 shrink-0 items-center justify-center rounded-md bg-line font-serif text-2xl text-muted">
          {person.data.name.charAt(0)}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-serif text-lg leading-snug group-hover:underline">{article.meta.title}</h3>
        <p className="mt-1 text-sm text-muted">{article.meta.knownFor}</p>
      </div>
    </Link>
  );
}
