import { createClient } from "@supabase/supabase-js";

// Usa este script con el service role key (no lo subas al repo).
// Ejemplo de ejecución:
// SUPABASE_URL=https://uycqxbrxhmhgithjzycs.supabase.co \
// SUPABASE_SERVICE_ROLE_KEY=tu_service_key \
// node scripts/seed-users.js

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const users = [
  {
    email: "tisnadoguevaraa@gmail.com",
    password: "132456",
    fullName: "Anthony Tisnado",
    role: "admin",
  },
  {
    email: "anthonytisnado9@gmail.com",
    password: "132456",
    fullName: "Segundo Tisnado",
    role: "docente",
  },
  {
    email: "atisnadog1@upao.edu.pe",
    password: "132456",
    fullName: "Alan Tisnado",
    role: "estudiante",
  },
];

async function main() {
  for (const u of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (error) {
      console.error(`No se pudo crear ${u.email}:`, error.message);
      continue;
    }

    const userId = data.user?.id;
    if (!userId) {
      console.error(`No se obtuvo ID para ${u.email}`);
      continue;
    }

    const names = u.fullName.split(" ");
    const first_name = names.slice(0, -1).join(" ") || u.fullName;
    const last_name = names.slice(-1).join(" ");

    const { error: profileErr } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: u.fullName,
      first_name,
      last_name,
      email: u.email,
      role: u.role,
    });

    if (profileErr) {
      console.error(`No se pudo crear perfil para ${u.email}:`, profileErr.message);
    } else {
      console.log(`Usuario creado: ${u.email} (rol ${u.role})`);
    }
  }
}

main()
  .then(() => {
    console.log("Seed completado.");
  })
  .catch((e) => {
    console.error(e);
  });
