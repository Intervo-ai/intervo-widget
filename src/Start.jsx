import { Mail, MessageCircle, Phone } from "lucide-react";
import PropTypes from "prop-types";

const Main = ({ onCardClick, hidePoweredBy = false }) => {
  return (
    <>
      <div className="pt-[30px] px-8 pb-[22px] h-full max-h-[110px] rounded-t-[18px] flex flex-col leading-8 text-2xl font-semibold -tracking-[0.75px]">
        <p className="text-slate-950 flex gap-2">Hi there</p>
        <p className="text-slate-400">How can we help?</p>
      </div>
      <div className="px-5 py-3 flex flex-col justify-between h-full">
        <div className="flex flex-col gap-3">
          {/* cards */}
          <div
            className="bg-white hover:cursor-pointer transition-all duration-300 border border-black/[.14] hover:border-black/[.24] focus:border-black/[.8] flex py-[22px] px-6 rounded-[10px] items-center gap-[22px] shadow-md hover:shadow-sm"
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
            className="bg-white hover:cursor-pointer transition-all duration-300 border border-black/[.14] hover:border-black/[.24] focus:border-black/[.8] flex py-[22px] px-6 rounded-[10px] items-center gap-[22px] shadow-md hover:shadow-sm"
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
            className="bg-white hover:cursor-pointer transition-all duration-300 border border-black/[.14] hover:border-black/[.24] focus:border-black/[.8] flex py-[22px] px-6 rounded-[10px] items-center gap-[22px] shadow-md hover:shadow-sm"
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
        {!hidePoweredBy && (
          <div className="text-neutral-500 font-inter text-sm leading-4 text-center">
            Powered by intervo
          </div>
        )}
      </div>
    </>
  );
};

Main.propTypes = {
  onCardClick: PropTypes.func.isRequired,
  hidePoweredBy: PropTypes.bool,
};

export default Main;
