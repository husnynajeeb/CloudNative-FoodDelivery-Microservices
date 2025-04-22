import React from "react";

function PaymentMethodSelector() {
  return (
    <div className="flex gap-3 sm:gap-5 justify-between px-3 sm:px-4 py-4 sm:py-3 mt-8 sm:mt-10 rounded border border-dashed border-neutral-300">
      <span className="text-sm font-medium leading-5 text-black flex items-center">
        Payment Method
      </span>
      <div className="flex gap-3 sm:gap-2 my-auto">
        <span className="flex shrink-0 w-8 h-8 rounded-3xl bg-neutral-100" />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3045bbe4d212e7a9fa6612503428b85322c34c88?placeholderIfAbsent=true&apiKey=a118aaf9fa744758b0bffd36059eea5b"
          alt="Payment method"
          className="object-contain shrink-0 w-8 aspect-square"
        />
        <span className="flex shrink-0 w-8 h-8 bg-sky-600 rounded-3xl" />
        <span className="flex shrink-0 w-8 h-8 rounded-3xl bg-neutral-100" />
      </div>
    </div>
  );
}

export default PaymentMethodSelector;
