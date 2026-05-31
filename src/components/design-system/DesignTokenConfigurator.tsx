import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type TokenOverrides = Record<string, string>

const RADIUS_OPTIONS = [
  { value: "", label: "Default" },
  { value: "4px", label: "4px" },
  { value: "6px", label: "6px" },
  { value: "8px", label: "8px" },
  { value: "10px", label: "10px" },
  { value: "12px", label: "12px" },
]

const PRIMARY_OPTIONS = [
  { value: "", label: "Default" },
  { value: "var(--primary-400)", label: "Lighter (400)" },
  { value: "var(--primary-500)", label: "Base (500)" },
  { value: "var(--primary-600)", label: "Darker (600)" },
]

const SPACING_OPTIONS = [
  { value: "", label: "Default" },
  { value: "4px", label: "4px" },
  { value: "8px", label: "8px" },
  { value: "12px", label: "12px" },
  { value: "16px", label: "16px" },
]

export interface DesignTokenConfiguratorProps {
  overrides: TokenOverrides
  onChange: (overrides: TokenOverrides) => void
  className?: string
}

export function DesignTokenConfigurator({
  overrides,
  onChange,
  className,
}: DesignTokenConfiguratorProps) {
  const update = (key: string, value: string) => {
    const next = { ...overrides }
    if (!value) {
      delete next[key]
    } else {
      next[key] = value
    }
    onChange(next)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-sm font-semibold mb-3">Design Tokens</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Override tokens to see how they affect the canvas.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">--radius-md</Label>
          <Select
            value={overrides["--radius-md"] || "__default__"}
            onValueChange={(v) => update("--radius-md", v === "__default__" ? "" : v)}
          >
            <SelectTrigger className="h-8 mt-1">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((o) => (
                <SelectItem key={o.value || "def"} value={o.value || "__default__"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">--primary</Label>
          <Select
            value={overrides["--primary"] || "__default__"}
            onValueChange={(v) => update("--primary", v === "__default__" ? "" : v)}
          >
            <SelectTrigger className="h-8 mt-1">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {PRIMARY_OPTIONS.map((o) => (
                <SelectItem key={o.value || "def"} value={o.value || "__default__"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">--spacing-3</Label>
          <Select
            value={overrides["--spacing-3"] || "__default__"}
            onValueChange={(v) => update("--spacing-3", v === "__default__" ? "" : v)}
          >
            <SelectTrigger className="h-8 mt-1">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {SPACING_OPTIONS.map((o) => (
                <SelectItem key={o.value || "def"} value={o.value || "__default__"}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
