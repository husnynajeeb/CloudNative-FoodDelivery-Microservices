import React from "react";

function FormInput({ label, value, icon, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium leading-none text-black mb-2">
        {label}
      </label>
      <div
        className={`
        flex gap-5 justify-between
        px-3 sm:px-4 py-4 sm:py-3.5
        text-base leading-relaxed sm:leading-none
        rounded border border-solid border-neutral-300
        text-zinc-400
        ${icon ? "items-center" : ""}
      `}
      >
        <span>{value}</span>
        {icon && (
          <img
            src={icon}
            alt=""
            className="object-contain shrink-0 w-5 aspect-square"
          />
        )}
      </div>
    </div>
  );
}

export default FormInput;
