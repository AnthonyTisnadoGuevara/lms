import { Resend } from "resend";

const resend = new Resend(import.meta.env.VITE_RESEND_KEY);

export async function sendVerificationEmail(email, url) {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verifica tu cuenta",
    html: `
      <p>Hola 👋</p>
      <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <a href="${url}">Verificar cuenta</a>
    `,
  });
}

export async function sendRecoverEmail(email, url) {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Recuperar contraseña",
    html: `
      <p>Para recuperar tu contraseña haz clic aquí:</p>
      <a href="${url}">Restablecer contraseña</a>
    `,
  });
}
