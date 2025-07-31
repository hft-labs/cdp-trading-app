import { useCallsStatus, useShowCallsStatus } from "wagmi";

export function CallStatus({ id }: { id: string }) {
  const { data: callsStatus } = useCallsStatus({
    id,
    query: {
      refetchInterval: (data) =>
        data.state.data?.status === "success" ? false : 1000,
    },
  });
  const { showCallsStatus } = useShowCallsStatus();

  return (
    <div>
      <p>Status: {callsStatus?.status || "loading"}</p>
      <button onClick={() => showCallsStatus({ id })}>View in Wallet</button>
    </div>
  );
}