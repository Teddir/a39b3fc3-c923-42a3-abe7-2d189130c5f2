import db from "@/lib/firebase";
import {
  collection,
  getDocs,
  DocumentData,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

import { NextResponse } from "next/server";

export async function GET(request: any) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    console.log('asas');
    if (!id) {
      const payments: DocumentData[] = [];
      const paymentsCollection = collection(db, "payments");
      const paymentsSnapshot = await getDocs(paymentsCollection);
      paymentsSnapshot.forEach((doc) => {
        payments.push({ id: doc.id, ...doc.data() });
      });
      return NextResponse.json(
        {
          status: "success get list payment",
          datas: payments,
        },
        { status: 200 }
      );
    }

    let docUser = await getDoc(doc(db, `payments/`, id));
    if (!docUser.exists()) throw new Error("Payment not found");
    return NextResponse.json(
      {
        status: "success get detail payment",
        datas: docUser.data(),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ message: error.message });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { id = "", name = "", email = "" } = body || {};

  try {
    if (!id) throw new Error("missing payment id");

    await updateDoc(doc(db, `payments`, id), {
      name,
      email,
      updated_at: serverTimestamp(),
    });
    return NextResponse.json(
      { status: "success", message: `Data updated: ${name}` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id = "", name = "" } = body || {};

  try {
    if (!id) throw new Error("missing payment id");

    await deleteDoc(doc(db, `payments/`, id));

    return NextResponse.json(
      { status: "success", message: `Data deleted: ${name}` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
