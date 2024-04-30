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
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";

import { NextResponse } from "next/server";

export async function GET(request: any) {
  const id = request.nextUrl.searchParams.get("id");

  try {
    if (!id) {
      const payments: DocumentData[] = [];
      const paymentsCollection = collection(db, "payments");
      const paymentsSnapshot = await getDocs(
        query(paymentsCollection, orderBy("created_at", "desc"))
      );
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

export async function POST(request: Request) {
  const body = await request.json();
  const { id = "", name = "", email = "", type = "", amount = 0 } = body || {};

  try {
    if (type == "update") {
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
    }

    if (!name) throw new Error("missing name");
    if (!email) throw new Error("missing email");

    const validasiEmailFirebase = await getDocs(
      query(collection(db, "payments"), where("email", "==", email))
    );

    if (!validasiEmailFirebase?.empty) throw new Error("email has been used");

    let res = await addDoc(collection(db, "payments"), {
      name,
      email,
      amount,
      status: "pending",
      created_at: serverTimestamp(),
    });
    let docUser = await getDoc(doc(db, `payments/`, res?.id));
    return NextResponse.json(
      {
        status: "success",
        message: `Data created: ${name}`,
        data: { id: res?.id, ...docUser?.data() },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: any) {
  const id = request.nextUrl.searchParams.get("id");
  try {
    if (!id) throw new Error("missing payment id");

    await deleteDoc(doc(db, `payments/`, id));
    revalidatePath("/", "layout");
    return NextResponse.json(
      { status: "success", message: `Data deleted: ${id}` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error)
      return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
