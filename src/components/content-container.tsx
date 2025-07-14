export function ContentContainer(props: { children: React.ReactNode }) {
    return (
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {props.children}
        </main>
    )
}