import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface LeadSelectorProps {
  leads: Lead[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const LeadSelector = ({ 
  leads, 
  value, 
  onValueChange, 
  placeholder = "Selecione um lead",
  disabled = false,
  required = false
}: LeadSelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedLead = leads.find(lead => lead.id === value);
  
  const sortedLeads = [...leads].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedLead ? selectedLead.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar lead..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Nenhum lead encontrado.</CommandEmpty>
            <CommandGroup>
              {sortedLeads.map((lead) => (
                <CommandItem
                  key={lead.id}
                  value={lead.name}
                  onSelect={() => {
                    onValueChange(lead.id);
                    setOpen(false);
                  }}
                  className="flex flex-col items-start py-2"
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === lead.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{lead.name}</div>
                      {(lead.email || lead.phone) && (
                        <div className="text-sm text-muted-foreground">
                          {[lead.email, lead.phone].filter(Boolean).join(" • ")}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};