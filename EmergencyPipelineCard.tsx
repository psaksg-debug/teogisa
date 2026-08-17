type Step = {
    name: string;
    owner: string;
    status: "완료" | "진행 중" | "대기";
};

type EmergencyDraft = {
    title: string;
    reason: string;
    steps: Step[];
};

const statusStyles = {
    "완료": { icon: "✅", color: "text-green-600" },
    "진행 중": { icon: "⏳", color: "text-blue-600" },
    "대기": { icon: "◻️", color: "text-gray-500" },
};

export function EmergencyPipelineCard({ draft }: { draft: EmergencyDraft }) {
    return (
        <div className="border-2 border-red-500 rounded-lg p-6 bg-red-50 shadow-lg">
            <h2 className="text-sm font-bold text-red-700 mb-2">🚨 긴급 발행 프로토콜 진행 중</h2>
            <p className="text-xl font-bold mb-1">{draft.title}</p>
            <p className="text-sm text-gray-600 mb-4">사유: {draft.reason}</p>

            <ol className="space-y-3">
                {draft.steps.map((step) => (
                    <li key={step.name} className={`flex items-center ${statusStyles[step.status].color}`}>
                        <span className="mr-2">{statusStyles[step.status].icon}</span>
                        <span className="font-semibold">{step.name}</span>
                        <span className="text-xs mx-1">(담당: {step.owner})</span>
                        <span className="flex-grow border-b border-dotted border-gray-300 mx-2"></span>
                        <span className="font-mono text-xs p-1 bg-gray-200 rounded">{step.status}</span>
                    </li>
                ))}
            </ol>
            <p className="text-xs text-gray-500 mt-4">*참고: 발행 후 24시간 내 정규 검토 절차(Full Review)를 다시 거쳐야 합니다.</p>
        </div>
    );
}