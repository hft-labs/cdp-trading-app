import { TestProvider } from "./provider";
import PageClient from "./page-client";
export default function TestPage() {
    return <TestProvider>
        <PageClient />
    </TestProvider>;
}