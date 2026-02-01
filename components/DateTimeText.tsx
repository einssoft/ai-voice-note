"use client";

import { useEffect, useState } from "react";

import { formatDateTime } from "@/lib/utils";

type DateTimeTextProps = {
  value: string | number | Date;
  locale?: string;
  className?: string;
};

export function DateTimeText({ value, locale, className }: DateTimeTextProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText(formatDateTime(value, locale));
  }, [value, locale]);

  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
