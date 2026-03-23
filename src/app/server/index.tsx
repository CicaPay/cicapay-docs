interface Props {
  amount: number;
  public_key: string;
  address: string;
}
export async function getTestnetToken({ amount, public_key, address }: Props) {
  const path = `/faucet/get`;
  const timestamp = Date.now().toString();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "POST",
    headers: {
      "X-Service": "faucet-view",
      "X-Timestamp": timestamp,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ amount, public_key, address }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw {
      status: "error",
      message: data?.message ?? "Faucet request failed",
      amount,
      address,
    };
  }


  return data;
}