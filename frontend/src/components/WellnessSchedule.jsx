export default function WellnessSchedule({ schedule }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Today's Wellness Timetable
      </h2>

      <ul className="space-y-3">
        {schedule.map((item, i) => (
          <li
            key={i}
            className="flex justify-between bg-gray-50 p-3 rounded-md border"
          >
            <span className="font-medium text-gray-700">{item.activity}</span>
            <span className="text-gray-500">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
