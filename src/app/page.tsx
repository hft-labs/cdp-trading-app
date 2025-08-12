import { redirect } from "next/navigation";

export default async function Dashboard() {
    redirect("/portfolio");
    return <div>Home Page</div>;
}