import imgImage from "figma:asset/cb013c9687ff52e74d53c6665566f530d237cb2e.png";

export default function Component1440X() {
  return (
    <div className="bg-[#f7f7f7] content-stretch flex flex-col items-center justify-center px-[64px] py-[80px] relative size-full" data-name="1440x960">
      <div className="h-[864px] pointer-events-none relative rounded-[8px] shrink-0 w-[918px]" data-name="image">
        <div className="absolute inset-0 overflow-hidden rounded-[8px]">
          <img alt="" className="absolute h-[100.44%] left-[-1.25%] max-w-none top-0 w-[102.5%]" src={imgImage} />
        </div>
        <div aria-hidden="true" className="absolute border border-[#b6bcbf] border-solid inset-[-0.5px] rounded-[8.5px]" />
      </div>
    </div>
  );
}