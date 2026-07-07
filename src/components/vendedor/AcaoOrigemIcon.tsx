import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { origemMeta, type OrigemAcao } from "@/lib/acoes";

interface Props {
  origem?: OrigemAcao;
  size?: number;
}

export function AcaoOrigemIcon({ origem, size = 14 }: Props) {
  const { Icon, cls, tooltip } = origemMeta(origem);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center ${cls}`}>
          <Icon style={{ width: size, height: size }} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
