import GoatCourt from "./GoatCourt";

// Read the API-key presence at request time, not build time,
// so dropping a key into .env.local flips the demo badge without a rebuild.
export const dynamic = "force-dynamic";

export default function Home() {
  const live = Boolean(process.env.GROQ_API_KEY);
  return <GoatCourt live={live} />;
}
