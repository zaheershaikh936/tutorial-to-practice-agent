import ExerciseComponent from "./components/exercise-component"

const ExercisePage = () => {
    return (
        <section className="grid grid-cols-2 w-full gap-5">
            <div className="col-span-1">
                <h2 className="text-2xl font-bold mb-3">Exercises</h2>
                <ExerciseComponent />
            </div>
            <div className="col-span-1">
                <h2 className="text-2xl font-bold">Tutorial Transcript</h2>
            </div>
        </section>
    )
}

export default ExercisePage
