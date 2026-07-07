export function OfficialSolutionPanel({ officialSolution }) {
    if (!officialSolution) return null

    return (
        <div className="pt-5 border-t border-white/10 space-y-3">
            <h3 className="text-lg font-semibold">Official Explanation</h3>
            {officialSolution.empty ? (
                <p className="text-sm text-gray-400">Official solution content has not been added yet.</p>
            ) : (
                <div className="space-y-3 text-sm text-gray-300">
                    {officialSolution.officialSolution?.optimizedApproach && <p>{officialSolution.officialSolution.optimizedApproach}</p>}
                    {officialSolution.officialSolution?.complexityExplanation && <p className="text-gray-400">{officialSolution.officialSolution.complexityExplanation}</p>}
                    {officialSolution.officialSolution?.interviewExplanation && <p className="text-google-blue">{officialSolution.officialSolution.interviewExplanation}</p>}
                </div>
            )}
        </div>
    )
}
