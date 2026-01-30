import svgPaths from "./svg-jgo80qxeor";

function Group() {
  return (
    <div className="absolute inset-[16.67%]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Group 2087326569">
          <path clipRule="evenodd" d={svgPaths.p70d4700} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector (Stroke)" />
          <g id="Group 2087326464">
            <path d={svgPaths.p2f78d900} fill="var(--fill-0, black)" id="Vector" />
            <path d={svgPaths.p3c90b880} fill="var(--fill-0, black)" id="Vector_2" />
          </g>
          <path clipRule="evenodd" d={svgPaths.p3c746100} fill="var(--fill-0, black)" fillRule="evenodd" id="Vector (Stroke)_2" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-0">
      <div className="absolute bg-[#ffe769] left-0 rounded-[4px] size-[48px] top-0" />
      <Group />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-0 top-0">
      <Group1 />
    </div>
  );
}

export default function ScreenshotnitsaLogo() {
  return (
    <div className="relative size-full" data-name="screenshotnitsa_logo">
      <Group2 />
    </div>
  );
}