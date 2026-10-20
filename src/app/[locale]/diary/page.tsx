import { redirect } from "next/navigation";

/** O diário passou a fazer parte da carteira. */
export default function DiaryPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/wallet`);
}
