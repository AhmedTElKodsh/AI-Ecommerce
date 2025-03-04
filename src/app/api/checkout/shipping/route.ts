// src/app/api/checkout/shipping/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "city",
      "state",
      "postalCode",
      "country",
      "phone",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Store shipping details in a cookie for now
    const shippingDetails = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      phone: data.phone,
      userId: session?.user?.id,
    };

    (await cookies()).set("shippingDetails", JSON.stringify(shippingDetails), {
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving shipping details:", error);
    return NextResponse.json(
      { error: "Failed to save shipping details" },
      { status: 500 }
    );
  }
}
