interface Contents {
  dueDate: string;
  file: string;
  partName: string;
  title: string;
}
enum UserRole {
  Teacher = "teacher",
  Student = "student",
}
interface Members {
  email: string;
  name: string;
  uid: string;
  craeteAt: string;
  role: UserRole;
  submitted: boolean;
}
interface Exercis {
  id: string;
  uid: string;
  createdAt: string; // hoặc Date nếu bạn muốn xử lý ngày tháng
  content: Contents;
  members: Members[];

  name: string;
  email: string;
}
interface ExerciseDetailProps {
  exercise: Exercis;
}
const ContentExercise: React.FC<ExerciseDetailProps> = ({ exercise }) => {
  return (
    <div className="w-5/6 bg-while ">
      <div className="flex p-4 items-center ">
        <div className="flex items-center justify-center w-10 h-10 bg-gray-500 rounded-full">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 3a1 1 0 00-1 1v1H2.5A1.5 1.5 0 001 6.5v10A1.5 1.5 0 002.5 18h15a1.5 1.5 0 001.5-1.5v-10A1.5 1.5 0 0017.5 5H16V4a1 1 0 00-1-1H4zm11 2H5V4h10v1zM2 8h16v8H2V8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="text-gray-500 px-2 text-base">
          {exercise.content.title}
        </div>
      </div>

      <div className="flex justify-between mt-2">
        {/*     <div className="text-gray-500 px-2 ml-14 text-sm">100 points</div> */}
        {exercise.content.dueDate.trim() && (
          <div className="text-gray-500 px-2 ml-14 text-sm">
            Hạn nộp {exercise.content.dueDate}
          </div>
        )}
      </div>

      <div className="   px-4 ml-12 mt-4">
        {exercise.content.file &&
          (exercise.content.partName.endsWith(".pdf") ||
          exercise.content.partName.endsWith(".docx") ||
          exercise.content.partName.endsWith(".xlsx") ? (
            // Nếu file là PDF, hiển thị liên kết để tải về
            <a
              href={exercise.content.file}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {exercise.content.partName}
            </a>
          ) : (
            // Nếu không phải PDF, hiển thị hình ảnh
            <img
              src={exercise.content.file}
              alt="Content"
              className="h-auto max-w-md border border-gray-300 rounded-md"
            />
          ))}
        <a
          href={exercise.content.file}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          <p className="text-xs text-gray-500 mt-2">
            {exercise.content.partName}
          </p>
        </a>
      </div>
    </div>
  );
};
export default ContentExercise;
