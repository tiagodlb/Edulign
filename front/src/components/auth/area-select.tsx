import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaAvaliacao } from "@/types";
import type { ControllerRenderProps } from "react-hook-form";
import type { RegisterFormData } from "@/lib/validations/auth";

interface AreaSelectProps {
  field: ControllerRenderProps<RegisterFormData, "area">;
  disabled?: boolean;
}

export function AreaSelect({ field, disabled }: Readonly<AreaSelectProps>) {
  return (
    <Select
      onValueChange={field.onChange}
      defaultValue={field.value}
      disabled={disabled}
    >
      <SelectTrigger id="area" className="w-full">
        <SelectValue placeholder="Selecione sua área de interesse" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(AreaAvaliacao).map((area) => (
          <SelectItem key={area} value={area}>
            {area}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
