import React from "react";

function MonthSelector() {
  return (
    <div className="flex flex-1 gap-6 sm:gap-9 px-3 sm:px-4 py-4 sm:py-3.5 rounded border border-solid border-neutral-300">
      <span>Month</span>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/6fffd334700ca341bf217780e63bdc958cc087f0?placeholderIfAbsent=true&apiKey=a118aaf9fa744758b0bffd36059eea5b"
        alt=""
        className="object-contain shrink-0 w-5 aspect-square"
      />
    </div>
  );
}

export default MonthSelector;
