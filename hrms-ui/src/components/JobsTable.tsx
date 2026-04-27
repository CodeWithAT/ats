import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useJobs, type Job } from "@/context/JobsContext";

/* ── Status Dot ── */
const StatusDot = ({ status }: { status: string }) => {
  if (status === "Active") return <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.1)]" />;
  if (status === "Draft") return <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />;
  return <div className="h-2 w-2 rounded-full bg-gray-400" />;
};

/* ── Main Component ── */
export default function JobsTable() {
  const navigate = useNavigate();
  const { jobs } = useJobs();

  const columns: ColumnDef<Job>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <div onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 select-none text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Job Title <ArrowUpDown className="h-3 w-3" />
        </div>
      ),
      cell: ({ row }) => (
        <div 
          className="flex flex-col gap-1 cursor-pointer group" 
          onClick={() => navigate('/create-job', { state: { jobToEdit: row.original } })}
        >
          <span className="font-medium text-[14px] text-indigo-600 group-hover:underline">{row.original.title}</span>
          <span className="text-[12px] text-gray-500">{row.original.department}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Type</div>,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] h-5 px-2 rounded-full font-medium shadow-none bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "location",
      header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Location</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
          <MapPin size={13} className="text-gray-400 shrink-0" />
          <span className="whitespace-nowrap">{row.original.location}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</div>,
      cell: ({ row }) => {
        const st = row.original.status;
        return (
          <div className="flex items-center gap-2 text-[13px] text-gray-600 whitespace-nowrap">
            <StatusDot status={st} />
            <span>{st}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "applicants",
      header: ({ column }) => (
        <div onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900 select-none text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Applicants <ArrowUpDown className="h-3 w-3" />
        </div>
      ),
      cell: ({ row }) => <span className="text-[13px] font-semibold text-gray-900 tabular-nums">{row.original.applicants}</span>,
    },
    {
      accessorKey: "postedDate",
      header: () => <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Posted</div>,
      cell: ({ row }) => <span className="text-[13px] text-gray-500 whitespace-nowrap">{row.original.postedDate}</span>,
    },
  ], []);

  const renderMobileCard = (row: any) => {
    const j = row.original as Job;
    return (
      <div key={row.id} className="flex flex-col p-4 bg-white border border-gray-200 rounded-xl shadow-sm gap-3 w-full">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-semibold text-[15px] text-gray-900 truncate">{j.title}</span>
            <span className="text-[12px] text-gray-500">{j.department}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusDot status={j.status} />
            <span className="text-[12px] text-gray-600 font-medium">{j.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-[12px]">
          <Badge variant="outline" className="text-[10px] h-5 px-2 rounded-full font-medium shadow-none bg-blue-50 text-blue-700 border-blue-200">{j.type}</Badge>
          <div className="flex items-center gap-1 text-gray-500"><MapPin size={11} />{j.location}</div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[12px] text-gray-500">
          <span>{j.applicants} applicants</span>
          <span className="font-medium">{j.postedDate}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={jobs}
        isLoading={false}
        title="Jobs"
        searchPlaceholder="Find..."
        mode="client"
        primaryAction={
          <Button
            onClick={() => navigate("/create-job")}
            className="bg-black text-white hover:bg-black/90 h-8 px-3 rounded-md text-[11px] whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus size={14} />
            Post Job
          </Button>
        }
        renderMobileCard={renderMobileCard}
      />

    </>
  );
}
