import { Accessibility, Contrast, Minus, Moon, Plus, Volume2 } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { usePreferences } from '@/lib/preferences'

export default function AccessibilityMenu() {
  const p = usePreferences()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Opções de acessibilidade">
          <Accessibility aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Acessibilidade</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); p.update({ fontScale: Math.min(1.5, +(p.fontScale + 0.125).toFixed(3)) }) }}>
          <Plus aria-hidden /> Aumentar texto
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); p.update({ fontScale: Math.max(0.875, +(p.fontScale - 0.125).toFixed(3)) }) }}>
          <Minus aria-hidden /> Diminuir texto
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={p.dark} onCheckedChange={(v) => p.update({ dark: !!v })}>
          <Moon aria-hidden /> Modo escuro
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={p.highContrast} onCheckedChange={(v) => p.update({ highContrast: !!v })}>
          <Contrast aria-hidden /> Alto contraste
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={p.sound} onCheckedChange={(v) => p.update({ sound: !!v })}>
          <Volume2 aria-hidden /> Efeitos sonoros
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
