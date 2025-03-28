export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/", "/seznam-lektoru", "/seznam-studentu", "/muj-profil", "/seznam-kurzu"],
};
