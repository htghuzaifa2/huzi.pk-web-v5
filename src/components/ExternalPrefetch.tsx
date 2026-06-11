"use client";

import { useEffect } from "react";

export default function ExternalPrefetch() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "/prefetch.js";
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    return null;
}
