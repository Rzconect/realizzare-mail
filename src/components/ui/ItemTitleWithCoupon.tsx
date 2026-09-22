import React from 'react';
import { Tag } from 'lucide-react';

interface ItemTitleWithCouponProps {
  rawTitle: string;
  titleClassName?: string;
  couponBadgeClassName?: string;
  containerClassName?: string;
}

export default function ItemTitleWithCoupon({ 
  rawTitle, 
  titleClassName = "block",
  couponBadgeClassName = "mt-1.5 inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md",
  containerClassName = "flex flex-col"
}: ItemTitleWithCouponProps) {
  if (!rawTitle) return null;

  let title = rawTitle;
  let coupon = null;

  const match = rawTitle.match(/\(Cupom: (.*?)\)/i);
  if (match) {
    coupon = match[1];
    title = rawTitle.replace(/\s*\(Cupom: (.*?)\)/i, "").trim();
  }

  return (
    <div className={containerClassName}>
      <span className={titleClassName}>{title}</span>
      {coupon && (
        <span className={couponBadgeClassName}>
          <Tag className="h-3 w-3 shrink-0" />
          CUPOM: {coupon.toUpperCase()}
        </span>
      )}
    </div>
  );
}
