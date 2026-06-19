import { redirect } from "next/navigation";

/** Workshop model home: the cockpit is わたしのビジネス. */
export default function Home() {
  redirect("/business");
}
