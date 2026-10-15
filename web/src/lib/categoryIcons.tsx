import type { IconType } from 'react-icons';
import {
  HiOutlineArchiveBox,
  HiOutlineBeaker,
  HiOutlineBolt,
  HiOutlineCake,
  HiOutlineCube,
  HiOutlineDocument,
  HiOutlineShoppingBag,
  HiOutlineSquares2X2,
  HiOutlineSquare3Stack3D,
  HiOutlineSparkles,
  HiOutlineTrophy,
} from 'react-icons/hi2';

const ICON_BY_SLUG: Record<string, IconType> = {
  'bandejas-espuma': HiOutlineSquare3Stack3D,
  'bandejas-plasticas': HiOutlineArchiveBox,
  vasos: HiOutlineBeaker,
  'potes-envases': HiOutlineCube,
  'pvc-film': HiOutlineDocument,
  'papel-aluminio': HiOutlineBolt,
  'papel-manteca': HiOutlineDocument,
  bolsas: HiOutlineShoppingBag,
  cubiertos: HiOutlineTrophy,
  'servilletas-sorbetes': HiOutlineSparkles,
};

export function getCategoryIcon(slug: string): IconType {
  return ICON_BY_SLUG[slug] ?? HiOutlineSquares2X2;
}