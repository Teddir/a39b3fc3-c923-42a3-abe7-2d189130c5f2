"use client";

import { Payment, columns } from "./component/columns";
import { DataTable } from "./component/data-table";
import { useQuery } from "@tanstack/react-query";

export default function DemoPage() {
  const { data: datas, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      async function getData(): Promise<Payment[]> {
        let response = await fetch("/api", {
          method: "GET",
        });
        let res = await response.json();
        if (res?.error) return [];

        return res?.datas;
      }

      let result = await getData();
      return result ?? [];
    },
  });

  return (
    <div className='container mx-auto py-10'>
      {isLoading ? (
        "loading..."
      ) : (
        <DataTable
          columns={columns}
          data={datas ?? []}
        />
      )}
    </div>
  );
}
