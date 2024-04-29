import { Payment, columns } from "./payments/columns";
import { DataTable } from "./payments/data-table";

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      name: "a",
      email: "z@example.com",
    },
    {
      id: "728edas52f",
      amount: 100,
      status: "pending",
      name: "z",
      email: "a@example.com",
    },
    {
      id: "728eqwd52f",
      amount: 100,
      status: "pending",
      name: "c",
      email: "b@example.com",
    },
    {
      id: "728ed5fd2f",
      amount: 100,
      status: "pending",
      name: "d",
      email: "c@example.com",
    },
    // ...
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className='container mx-auto py-10'>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
}
