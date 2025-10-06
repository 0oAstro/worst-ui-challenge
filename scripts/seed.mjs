import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const users = [
  {
    email: "alice@example.com",
    password: "password123",
    display_name: "Alice",
  },
  { email: "bob@example.com", password: "password123", display_name: "Bob" },
  {
    email: "carol@example.com",
    password: "password123",
    display_name: "Carol",
  },
];

const submissions = [
  {
    title: "Cursed Login Form",
    codepen_url: "https://codepen.io/team/codepen/pen/KKPQLmJ",
  },
  {
    title: "Nightmare Modal",
    codepen_url: "https://codepen.io/team/codepen/pen/poRrYpM",
  },
  {
    title: "Unusable Dropdown",
    codepen_url: "https://codepen.io/team/codepen/pen/abvNdPj",
  },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const getOrCreateUser = async (email, password) => {
  const { data: existing, error: listErr } =
    await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;
  const found = existing.users.find((u) => u.email === email);
  if (found) return found;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user;
};

const main = async () => {
  console.log("Seeding database...");

  // Create users
  const createdUsers = [];
  for (const u of users) {
    const user = await getOrCreateUser(u.email, u.password);
    createdUsers.push(user);
  }
  console.log(`Users ready: ${createdUsers.map((u) => u.email).join(", ")}`);

  // Insert submissions for first two users
  const ownerIds = createdUsers.slice(0, 2).map((u) => u.id);
  const rows = submissions.map((s, i) => ({
    user_id: ownerIds[i % ownerIds.length],
    title: s.title,
    id: new URL(s.codepen_url).pathname.split("/").filter(Boolean).slice(-1)[0],
  }));

  // Upsert by unique composite of (user_id,title) via natural key emulation
  for (const row of rows) {
    const { data: existing, error: selErr } = await supabase
      .from("submissions")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("title", row.title)
      .maybeSingle();
    if (selErr && selErr.code !== "PGRST116") throw selErr;
    if (!existing) {
      const { error: insErr } = await supabase.from("submissions").insert(row);
      if (insErr) throw insErr;
      await delay(50);
    }
  }

  const { data: allSubs, error: subsErr } = await supabase
    .from("submissions")
    .select("id,user_id,title")
    .order("created_at", { ascending: true });
  if (subsErr) throw subsErr;

  // Cast some votes from all users to random submissions
  for (const user of createdUsers) {
    for (const sub of allSubs) {
      if (sub.user_id === user.id) continue; // skip self vote
      // try insert, ignore unique violation
      const { error: voteErr } = await supabase.from("votes").insert({
        submission_id: sub.id,
        voter_id: user.id,
      });
      if (voteErr && voteErr.code !== "23505") throw voteErr;
    }
  }

  console.log("Seed complete.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
