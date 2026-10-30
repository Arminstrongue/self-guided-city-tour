import { travellerEmails } from "@/lib/city-access";
import { Locked } from "./Locked";

/** Versão do servidor: sabe se o viajante já tem sessão (não lhe pede para entrar outra vez). */
export async function LockedFor(props: Omit<React.ComponentProps<typeof Locked>, "signedIn">) {
  const signedIn = (await travellerEmails().catch(() => [])).length > 0;
  return <Locked {...props} signedIn={signedIn} />;
}
