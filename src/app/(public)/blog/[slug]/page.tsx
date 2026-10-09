import { notFound } from "next/navigation";
import { publicPageMetadata } from "@/config/seo";
import { BlogDetail } from "@/features/marketing/components/blog-detail";
import { blogArticles, getBlogArticle } from "@/features/marketing/config/blog-articles";

/*
 * Detail artikel blog. Slug diambil dari whitelist artikel contoh; slug asing
 * menghasilkan 404 agar tidak ada halaman dinamis tak terbatas.
 *
 * `generateMetadata` juga memanggil `notFound()` — bukan hanya mengembalikan
 * metadata pengganti — supaya respons tetap berstatus 404 dan tidak terindeks
 * mesin pencari sebagai halaman valid.
 */
export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

/*
 * dynamicParams=false: hanya slug di whitelist yang dirender. Slug asing
 * langsung 404 tanpa merender halaman dinamis, sehingga status HTTP benar
 * dan tidak ada permukaan halaman tak terbatas.
 */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();
  return publicPageMetadata(`/blog/${article.slug}`, article.title, article.excerpt);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();
  return (
    <main id="main">
      <BlogDetail article={article} />
    </main>
  );
}
