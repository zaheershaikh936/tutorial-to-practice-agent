import MarkdownComponent from "./editor/components/common/react-makdown-compoent";

const ProblemStatement = ({ problem_statement }: { problem_statement?: string }) => {
    if (!problem_statement) return null;
    return (
        <MarkdownComponent text={problem_statement} />
    )
}
export default ProblemStatement