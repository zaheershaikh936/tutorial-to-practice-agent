import SearchableDropdown from "@/components/smoothui/searchable-dropdown";
import { useSupportLanguages } from "../api/service";
import { AlertCircleIcon, LoaderCircle } from "lucide-react"
import { PistonLanguageResType } from "../api/types"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"


interface LanguageSelectorProps {
    language: any;
    setLanguage: (language: any) => void;
}

const LanguageSelector = ({ language, setLanguage }: LanguageSelectorProps) => {
    const { data, isLoading, isError } = useSupportLanguages();
    if (isError) return <LanguageSelectorHasError />
    if (isLoading) return <div className="flex items-center justify-center">
        <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" />
    </div>
    const defaultValue = data?.find((item) => item.language === language);
    return (
        <SearchableDropdown
            className="w-48"
            items={
                data?.map((item: PistonLanguageResType) => ({
                    id: item.id,
                    label: `${item.language} v${item.version}`,
                })) || []
            }
            label={"Language"}
            defaultValue={defaultValue?.id}
            onChange={(value) => setLanguage(value.label)}
        />
    )
}

const LanguageSelectorHasError = () => {
    return <Alert>
        <AlertCircleIcon />
        <AlertTitle>Failed to load languages</AlertTitle>
        <AlertDescription>
            Please try again later.
        </AlertDescription>
    </Alert>
}

export default LanguageSelector