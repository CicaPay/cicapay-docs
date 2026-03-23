import { getTestnetToken } from "@/app/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getTestnetToken(body);
    return Response.json(data);
  } catch (err: any) {
    return Response.json(
      {
        status: "error",
        message: err?.message ?? "Something went wrong",
        amount: err?.amount,
        address: err?.address,
      },
      { status: 500 },
    );
  }
}