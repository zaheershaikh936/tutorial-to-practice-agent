import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { editorLanguages } from "../../../utils/languages"

interface LanguageSelectorProps {
    language: string;
    setLanguage: (language: string) => void;
}

const LanguageSelector = ({ language, setLanguage }: LanguageSelectorProps) => {
    return (
        <Select value={language} onValueChange={(value) => setLanguage(value as string)}>
            <SelectTrigger size="sm" className="w-40">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {editorLanguages.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

export default LanguageSelector