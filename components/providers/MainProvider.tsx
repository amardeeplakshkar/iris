'use client'

import { PropsWithChildren } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";

const MainProvider = ({ children }: PropsWithChildren) => {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <Toaster position="top-center" duration={2000} richColors />
            {children}
        </ThemeProvider>
    )
}

export default MainProvider