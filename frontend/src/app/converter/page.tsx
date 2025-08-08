// app/converter/page.tsx
import type {Metadata} from "next";
import Converter from "../../Modules/Converter/Converter";

export const metadata: Metadata = {
    title: "Converter - XLARTAS",
    description: "Convert your files on the XLARTAS platform",
};

export default function ConverterPage() {
    return <Converter/>;
}
