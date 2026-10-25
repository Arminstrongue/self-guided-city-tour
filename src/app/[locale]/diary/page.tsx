import { redirect } from "next/navigation";

/** O diário passou a fazer parte da carteira. */
export default async function DiaryPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  redirect(`/${params.locale}/wallet`);
}
