import Editor from "./components/editor"
import ExerciseComponent from "./components/exercise-component"

const ExercisePage = () => {
    return (
        <section className="grid grid-cols-2 h-full min-h-[calc(100vh-200px)] gap-5">
            <div className="col-span-1">
                <ExerciseComponent />
            </div>
            <div className="col-span-1">
                <Editor />
            </div>
        </section>
    )
}

export default ExercisePage
