"use client";

import React from "react";
import FlowCanvas from "@/components/FlowCanvas";

export default function EditFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  return <FlowCanvas editId={resolvedParams.id} />;
}
