import Link from "next/link";
import type { Post } from "./types";

const crtPath =
  "M 100 50 Q 500 -60 900 50 Q 980 350 900 650 Q 500 760 100 650 Q 20 350 100 50 Z";

interface PostsSectionProps {
  posts: Post[];
  className?: string;
}

export default function PostsSection({ posts, className = "" }: PostsSectionProps) {
  return (
    <section id="posts" className={`w-full py-16 flex flex-col items-center ${className}`}>
      <h2 className="text-4xl font-bold mb-8 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Link
            href={`/${post.slug.current}`}
            key={post._id}
            className="group flex flex-col items-center hover:scale-105 transition-transform"
          >
            {/* CRT Masked Project Image */}
            <div className="relative flex items-center justify-center w-[320px] h-[260px] md:w-[400px] md:h-[340px] py-4">
              <svg
                viewBox="0 0 1000 700"
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "visible" }}
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <clipPath id={`crtMaskProject${post._id}`}> {/* Unique ID for each project */}
                    <path d={crtPath} />
                  </clipPath>
                </defs>
                <image
                  href="/assets/images/project1.JPG"
                  width="1000"
                  height="700"
                  clipPath={`url(#crtMaskProject${post._id})`}
                  preserveAspectRatio="none"
                  style={{ filter: "brightness(0.6)" }}
                />
                {/* Black overlay for opacity */}
                <path
                  d={crtPath}
                  fill="#000"
                  opacity="0.4"
                  style={{ zIndex: 1 }}
                />
                {/* Yellow border */}
                <path
                  d={crtPath}
                  stroke="#FACC15"
                  strokeWidth="8"
                  fill="none"
                  style={{ zIndex: 2 }}
                />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-orange-200 group-hover:text-yellow-300 text-center text-large-upper">
              {post.title}
            </h3>
            <p className="text-lg text-orange-100 mt-1">
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
// Add tv-mask CSS in globals.css for the bulging square effect. 