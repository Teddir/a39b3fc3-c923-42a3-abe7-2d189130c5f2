"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pencil, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
export type Payment = {
  id?: string;
  amount?: number;
  status?: "pending" | "processing" | "success" | "failed";
  name?: string;
  email?: string;
};

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
  amount: z.coerce.number().int().gte(1).lte(999999),
});

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Payment ID",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Email
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className='text-right'>
          <Button
            variant='ghost'
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }>
            Amount
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className='text-right font-medium'>{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: ({ column }) => {
      return <div className='text-right'>Actions</div>;
    },
    cell: ({ row, table }) => {
      const payment = row.original;
      /* eslint-disable react-hooks/rules-of-hooks */
      const { toast } = useToast();
      const queryClient = useQueryClient();

      async function deleteData() {
        try {
          let res = await fetch(`/api?id=${payment?.id}`, {
            method: "DELETE",
          });
          res = await res?.json();

          await queryClient.setQueryData(
            ["payments"],
            (oldData?: Payment[]) => {
              if (oldData) {
                return oldData.filter((val) => val?.id !== payment?.id);
              }
              return [payment];
            }
          );

          toast({
            description: `Deleted data : ${payment?.id}.`,
            duration: 3000,
          });
          table.reset();
        } catch (error) {
          if (error instanceof Error) console.log(error?.message);
        }
      }

      return (
        <div className='text-right'>
          <Button
            onClick={deleteData}
            variant='ghost'
            className='h-8 w-8 p-0'>
            <span className='sr-only'>Delete</span>
            <Trash className='h-4 w-4' />
          </Button>
          <DialogCrack
            type='update'
            reset={() => table.reset()}
            {...payment}
          />
        </div>
      );
    },
    enableHiding: false,
  },
];

export function DialogCrack(
  params: Payment & { type: "update" | "add"; reset?: () => void }
) {
  /* eslint-disable react-hooks/rules-of-hooks */
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: params?.name,
      email: params?.email,
      amount: params?.amount,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let response = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({ ...params, ...values }),
      });
      let res = await response.json();

      if (res?.error) throw new Error(res?.error);

      if (params?.type == "add")
        await queryClient.invalidateQueries({
          queryKey: ["payments"],
        });
      else
        await queryClient.setQueryData(["payments"], (oldData?: Payment[]) => {
          if (oldData) {
            if (params?.type == "update")
              return oldData.map((val) =>
                val?.id === params?.id ? { ...val, ...values } : val
              );
            return [res?.data, ...oldData];
          }
          return [params];
        });
      if (params?.reset) params?.reset();

      toast({
        description: `Data ${
          params?.type == "update" ? "updated" : "created"
        }.`,
        duration: 3000,
      });

      document.getElementById("closeDialog")?.click();
      form?.reset({});
    } catch (error) {
      if (error instanceof Error) {
        console.log(error?.message);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error?.message ?? error,
          duration: 2000,
        });
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={params?.type == "update" ? "ghost" : "outline"}
          className={params?.type == "update" ? "h-8 w-8 p-0" : "ml-3"}>
          <span className={"sr-only"}>
            {params?.type == "update" ? "Edit" : "Add"}
          </span>
          {params?.type == "update" ? (
            <Pencil className='h-4 w-4' />
          ) : (
            <Plus className='h-4 w-4' />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] overflow-y-auto max-h-screen'>
        <DialogHeader>
          <DialogTitle>
            {params?.type == "update" ? "Edit" : "Add"} Payment
          </DialogTitle>
          <DialogDescription>
            {params?.type == "update"
              ? "Make changes to your"
              : "Make your new"}{" "}
            Payment here. Click {params?.type == "update" ? "save" : "add"} when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-2'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-8'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. bismillah keterima'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. bismillah@gmail.com'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g. 0'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>This is your amount.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-col gap-2'>
                <Button
                  type='submit'
                  className='w-full'>
                  {params?.type == "update" ? "Save Changes" : "Add Payment"}
                </Button>
                <DialogClose
                  asChild
                  id='closeDialog'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => {
                      form?.reset();
                    }}>
                    Close
                  </Button>
                </DialogClose>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
