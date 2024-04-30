import { Payment, columns } from "./component/columns";
import { DataTable } from "./component/data-table";

async function getData(): Promise<Payment[]> {
  let response = await fetch("http://localhost:3000/api", {
    method: "GET",
  });
  let res = await response.json();
  if (res?.error) return []
  
  return res?.datas
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
