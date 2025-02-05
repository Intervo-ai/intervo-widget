import HandIcon from "@/assets/widgetHand.png";
import { Mail, MessageCircle, Phone } from "lucide-react";

const Main = ({ onCardClick }) => {
  return (
    <>
      <div className="bg-black pt-[30px] px-8 pb-[22px] h-full max-h-[124px] rounded-t-[18px] flex flex-col leading-9 text-3xl font-semibold -tracking-[0.75px]">
        <p className="text-[#F8F8F8]/[.7] flex gap-2">
          Hi There
          <img src={HandIcon} alt="Hand Icon" width={24} height={24} />
        </p>
        <p className="text-slate-100">How can we help?</p>
      </div>
      <div className="px-5 py-3 flex flex-col justify-between h-full">
        <div className="flex flex-col gap-3">
          {/* cards */}
          <div
            className="bg-white hover:bg-neutral-100 hover:cursor-pointer transition-all duration-300 border border-black/[.14] flex py-[22px] px-6 rounded-[10px] items-center gap-[22px] shadow-md"
            onClick={() => onCardClick("call")}
          >
            <Phone className="h-6 w-6" />
            <div className="flex flex-col gap-[6px]">
              <p className="text-black font-semibold text-base leading-[22.4px]">
                Talk to us now
              </p>
              <p className="text-neutral-500 font-inter text-[15px] leading-[18px]">
                Live web call with our AI agent
              </p>
            </div>
          </div>

          <div
            className="bg-white hover:bg-neutral-100 hover:cursor-pointer transition-all duration-300 border border-black/[.14] flex py-[22px] px-6 rounded-[10px] items-center gap-[22px] shadow-md"
            onClick={() => onCardClick("message")}
          >
            <MessageCircle className="h-6 w-6" />
            <div className="flex flex-col gap-[6px]">
              <p className="text-black font-semibold text-base leading-[22.4px]">
                Send a message
              </p>
              <p className="text-neutral-500 font-inter text-[15px] leading-[18px]">
                AI typically reply in a few seconds
              </p>
            </div>
          </div>

          <div
            className="bg-white hover:bg-neutral-100 hover:cursor-pointer transition-all duration-300 border border-black/[.14] flex py-[22px] px-6 rounded-[10px] items-center gap-[22px] shadow-md"
            onClick={() => onCardClick("email")}
          >
            <Mail className="h-6 w-6" />
            <div className="flex flex-col gap-[6px]">
              <p className="text-black font-semibold text-base leading-[22.4px]">
                Send us a email
              </p>
              <p className="text-neutral-500 font-inter text-[15px] leading-[18px]">
                AI typically reply in a few seconds
              </p>
            </div>
          </div>
        </div>
        <div className="text-neutral-500 font-inter text-sm leading-4 text-center">
          Powered by intervo
        </div>
      </div>
    </>
  );
};

export default Main;
