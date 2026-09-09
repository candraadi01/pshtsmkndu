import HomePage from "@/components/home-page";
import Preloader from "@/components/preloader";
import { getHomeData } from "@/lib/services/home";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getHomeData();
  return (
    <>
      <Preloader />
      <HomePage data={data} />
    </>
  );
}
