"use client";

import { useState } from "react";
import UploadTab from "@/components/UploadTab";

export default function UploadPage() {
    const [files, setFiles] = useState([]);

    return <UploadTab files={files} setFiles={setFiles} />;
}
