import { Fragment } from "react";
import { CheckIcon } from "./Icons";

const steps = ["Account", "Profile", "Interests"];

type StepperProps = { current: number };

const Stepper = ({ current }: StepperProps) => {
  return (
    <div className="flex items-center gap-3 mt-8 px-5 py-4 rounded-xl bg-surface-low">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <Fragment key={step}>
            {index > 0 && (
              <div
                className={`flex-1 h-px ${done || active ? "bg-primary/30" : "bg-surface-high"}`}
              />
            )}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span
                className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${
                  done || active
                    ? "bg-primary text-white"
                    : "bg-surface-high text-muted"
                }`}
              >
                {done ? <CheckIcon className="w-3 h-3" /> : index + 1}
              </span>
              <span className={done || active ? "text-primary" : "text-muted"}>
                {step}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
