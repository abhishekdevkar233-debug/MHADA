import type { ComponentType } from "react";
import type { SvgIconProps } from "@mui/material/SvgIcon";

import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import EventOutlined from "@mui/icons-material/EventOutlined";
import RemoveCircleOutlineOutlined from "@mui/icons-material/RemoveCircleOutlineOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import AddCircleOutlineOutlined from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import WorkspacePremiumOutlined from "@mui/icons-material/WorkspacePremiumOutlined";
import NoteAddOutlined from "@mui/icons-material/NoteAddOutlined";
import AutorenewOutlined from "@mui/icons-material/AutorenewOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import PieChartOutlineOutlined from "@mui/icons-material/PieChartOutlineOutlined";
import ElderlyOutlined from "@mui/icons-material/ElderlyOutlined";
import CompareArrowsOutlined from "@mui/icons-material/CompareArrowsOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import PrintOutlined from "@mui/icons-material/PrintOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import KeyboardDoubleArrowLeftOutlined from "@mui/icons-material/KeyboardDoubleArrowLeftOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";

type IconProps = {
  name: string;
  className?: string;
};

/**
 * One name -> one Material UI icon, used for that feature everywhere in the
 * app (e.g. "attendance" is always FactCheckOutlined, never a mix of
 * variants). @mui/icons-material is the only icon source; nothing here is a
 * hand-drawn or AI-generated SVG.
 */
const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  dashboard: DashboardOutlined,
  employee: PersonOutlineOutlined,
  "leave-balance": EventAvailableOutlined,
  "leave-assign": EventOutlined,
  "special-deduction": RemoveCircleOutlineOutlined,
  attendance: FactCheckOutlined,
  "pay-change": SwapHorizOutlined,
  allowance: AddCircleOutlineOutlined,
  deduction: RemoveOutlined,
  "income-tax": ReceiptLongOutlined,
  "da-arrears": TrendingUpOutlined,
  "seventh-pay": WorkspacePremiumOutlined,
  "bill-create": NoteAddOutlined,
  "bill-process": AutorenewOutlined,
  "bill-report": BarChartOutlined,
  "salary-slip": DescriptionOutlined,
  "deduction-report": PieChartOutlineOutlined,
  retirement: ElderlyOutlined,
  transfer: CompareArrowsOutlined,
  "user-circle": AccountCircleOutlined,
  settings: SettingsOutlined,
  shield: ShieldOutlined,
  sliders: TuneOutlined,
  printer: PrintOutlined,
  money: PaymentsOutlined,
  logout: LogoutOutlined,
  key: VpnKeyOutlined,
  menu: MenuOutlined,
  close: CloseOutlined,
  chevron: ChevronRightOutlined,
  search: SearchOutlined,
  bell: NotificationsOutlined,
  help: HelpOutlineOutlined,
  pencil: EditOutlined,
  eye: VisibilityOutlined,
  "eye-off": VisibilityOffOutlined,
  "chevron-double-left": KeyboardDoubleArrowLeftOutlined,
  filter: FilterListOutlined,
  "x-circle": CancelOutlined,
  palette: PaletteOutlined,
  check: CheckOutlined,
};

// Tailwind spacing scale: 1 unit = 0.25rem = 4px. Covers every h-*/w-* value
// currently used on <Icon>; falls back to 20px (within the 20–22px MHADA
// icon guideline) for anything else, e.g. sizing driven by a parent's
// font-size instead.
const SPACING_PX: Record<string, number> = {
  "3": 12,
  "3.5": 14,
  "4": 16,
  "4.5": 18,
  "5": 20,
  "6": 24,
  "7": 28,
};

function sizeFromClassName(className?: string): number {
  if (!className) return 20;
  const arbitrary = className.match(/h-\[(\d+)px\]/);
  if (arbitrary) return Number(arbitrary[1]);
  const scale = className.match(/(?:^|\s)h-([\d.]+)(?:\s|$)/);
  if (scale && SPACING_PX[scale[1]] !== undefined) return SPACING_PX[scale[1]];
  return 20;
}

export default function Icon({ name, className }: IconProps) {
  const Glyph = ICONS[name] ?? ICONS.dashboard;
  const px = sizeFromClassName(className);
  return (
    <Glyph
      className={className}
      aria-hidden="true"
      // Inline style always wins over MUI's own generated CSS class, so the
      // Tailwind h-*/w-* size implied by className renders exactly as
      // intended regardless of stylesheet insertion order.
      style={{ width: px, height: px, fontSize: px }}
    />
  );
}
