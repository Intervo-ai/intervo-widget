import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import returnAPIUrl from "@/config/config";
import { useWidget } from "@/context/WidgetContext";
import {
  Phone,
  Captions,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Mail,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const backendAPIUrl = returnAPIUrl();

const Call = ({ onBack, agentId }) => {
  const [isTwilioLoaded, setIsTwilioLoaded] = useState(false);
  const { toast } = useToast();
  const [scriptLoadState, setScriptLoadState] = useState("pending");
  const [showTranscript, setShowTranscript] = useState(false);
  const { callState, initiateCall, endCall, setDevice, device, messages } =
    useWidget();

  // Function to get Twilio token from backend
  async function getToken() {
    try {
      const response = await fetch(`${backendAPIUrl}/token`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch Twilio token");
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching token:", error);
      toast({
        title: "Error",
        description: "Failed to get Twilio token",
        variant: "destructive",
      });
    }
  }

  function handleTwilioScriptLoad() {
    console.log("Twilio script loaded successfully");
    setIsTwilioLoaded(true);
    setScriptLoadState("loaded");
  }

  function handleTwilioScriptError() {
    console.error("Failed to load Twilio script");
    setScriptLoadState("failed");
  }

  // Script loading effect
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js";
    script.async = true;
    script.onload = handleTwilioScriptLoad;
    script.onerror = handleTwilioScriptError;
    document.body.appendChild(script);

    console.log("script added");
    return () => {
      console.log("script removed");
      // document.body.removeChild(script);
    };
  }, []);

  // Monitor script load state
  useEffect(() => {
    console.log("Script load state:", scriptLoadState);
    if (scriptLoadState === "failed") {
      toast({
        title: "Error",
        description: "Failed to load Twilio SDK",
        variant: "destructive",
      });
    }
  }, [scriptLoadState, toast]);

  // Device setup effect
  useEffect(() => {
    let mounted = true;

    async function setupDevice() {
      try {
        const token = await getToken();

        console.log("tokenizor", token, mounted);
        if (!token || !mounted) return;

        const twilioDevice = new window.Twilio.Device(token, {
          debug: true,
        });

        twilioDevice.on("ready", () => {
          console.log("Twilio.Device is ready", mounted);
          if (mounted) {
            setDevice(twilioDevice);
          }
        });

        twilioDevice.on("error", (error) => {
          console.error("Twilio Device Error:", error);
          toast({
            title: "Call Error",
            description: error.message,
            variant: "destructive",
          });
        });

        twilioDevice.on("disconnect", () => {
          if (mounted) {
            endCall();
            onBack();
          }
        });
      } catch (error) {
        console.error("Failed to initialize Twilio device:", error);
        toast({
          title: "Setup Error",
          description: "Failed to initialize Twilio device",
          variant: "destructive",
        });
      }
    }

    if (isTwilioLoaded && !device) {
      setupDevice();
    }

    return () => {
      mounted = false;
      // if (device) {
      //   console.log("device destroyed");
      //   device.destroy();
      // }
    };
  }, [isTwilioLoaded, device, endCall, onBack, toast]);

  // Handle call initiation
  async function handleCall() {
    if (!device || !device.status === "ready") {
      toast({
        title: "Error",
        description: "Please wait for Twilio to initialize",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${backendAPIUrl}/stream/prepare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          aiConfig: JSON.stringify({
            agentId,
            playground: false,
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server error: ${response.status}`
        );
      }

      const prepareData = await response.json();

      if (!prepareData || !prepareData.conversationId) {
        throw new Error("Invalid response from prepare endpoint");
      }

      const callParams = {
        To: "client",
        aiConfig: JSON.stringify({
          agentId,
          conversationId: prepareData.conversationId,
          playground: false,
        }),
      };

      await initiateCall(agentId);

      try {
        const connection = await device.connect(callParams);

        if (!connection) {
          throw new Error("Failed to establish connection");
        }

        connection.on("error", (error) => {
          console.error("Call connection error:", error);
          toast({
            title: "Call Error",
            description: error.message || "Connection error occurred",
            variant: "destructive",
          });
          handleEndCall();
        });

        connection.on("disconnect", () => {
          console.log("Call disconnected");
          handleEndCall();
        });
      } catch (twilioError) {
        console.error("Twilio connection error:", twilioError);
        throw new Error("Failed to establish call connection");
      }
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Call Error",
        description: error.message || "Failed to start call",
        variant: "destructive",
      });
      endCall();
    }
  }

  // Use endCall from context
  function handleEndCall() {
    try {
      if (device) {
        device.disconnectAll();
      }
      endCall();
    } catch (error) {
      console.error("Error ending call:", error);
      toast({
        title: "Error",
        description: "Failed to end call properly",
        variant: "destructive",
      });
    }
  }

  const ListItem = ({ text }) => (
    <li className="text-purple-500">
      <span className="text-neutral-600">{text}</span>
    </li>
  );

  console.log(callState, "call state");
  const renderActiveCall = () => (
    <>
      <div className="bg-black pt-[30px] px-8 pb-[22px] h-full max-h-[134px] rounded-t-[18px] flex flex-col justify-between gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-[34px] font-inter font-semibold leading-[40.8px] text-[#F8F8F8]/[.7]">
            {callState === "ringing"
              ? "Ringing..."
              : callState === "connected"
              ? "In Call"
              : "Ready to Call"}
          </h2>
          {callState !== "idle" && (
            <h2 className="text-2xl leading-8 font-semibold text-[#F1F5F9] font-sans">
              00:00
            </h2>
          )}
        </div>
        {callState === "connected" || callState === "ringing" ? (
          <Button
            onClick={handleEndCall}
            className="h-10 bg-red-600 text-white text-sm leading-6 font-medium font-sans hover:bg-red-700"
          >
            <Phone /> End Call
          </Button>
        ) : (
          <Button
            onClick={() => initiateCall(agentId)}
            disabled={!device}
            className="h-10 bg-green-600 text-white text-sm leading-6 font-medium font-sans hover:bg-green-700"
          >
            <Phone /> Start Call
          </Button>
        )}
      </div>
      <div className="px-5 py-3 flex flex-col justify-between h-full">
        <div className="flex h-full flex-col">
          <button
            className="h-[76px] w-full flex justify-between gap-[22px] py-[22px] px-6  bg-white hover:bg-neutral-100 rounded-[10px] items-center shadow-md border border-black/[.14] disabled:cursor-not-allowed"
            onClick={() => setShowTranscript(!showTranscript)}
            disabled={callState !== "connected"}
          >
            <Captions className="h-8 w-8" />
            <p className="w-full text-left font-inter font-semibold leading-[22.4px]">
              Show Transcript
            </p>
            {showTranscript ? (
              <ChevronUp className="h-8 w-8" />
            ) : (
              <ChevronDown className="h-8 w-8" />
            )}
          </button>
          {showTranscript && (
            <ScrollArea className="max-h-[390px]">
              <div className="space-y-3 mt-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="flex items-start pr-2 pl-1.5 gap-2"
                  >
                    <p className="text-xs text-neutral-500 leading-6 font-medium font-sans">
                      {message.time}
                    </p>
                    <p className="text-sm text-neutral-500 leading-6">
                      <span className="font-semibold text-neutral-950">
                        {message.source}:
                      </span>{" "}
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        <div
          className={`text-neutral-500 font-inter text-sm leading-4 pt-1 text-center ${
            showTranscript && "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          }`}
        >
          Powered by intervo
        </div>
      </div>
    </>
  );

  const renderCallEnded = () => (
    <>
      <div className="bg-black pt-[20px] px-8 pb-[12px] h-full max-h-[134px] rounded-t-[18px] flex flex-col justify-between gap-3">
        <button
          onClick={onBack}
          className="text-white text-base leading-6 font-medium font-sans flex gap-3"
        >
          <ChevronLeft className="h-6 w-6" /> Back
        </button>
        <div className="flex justify-between items-center mt-4">
          <h2 className="text-[34px] font-inter font-semibold leading-[40.8px] text-[#F8F8F8]/[.7]">
            Call ended
          </h2>
          <h2 className="text-2xl leading-8 font-semibold text-[#F1F5F9] font-sans">
            38:22
          </h2>
        </div>
      </div>
      <div className="px-5 py-6 flex flex-col justify-between h-full">
        <div className="flex h-full flex-col gap-2 px-1.5">
          <h5 className="text-neutral-950 text-[15px] leading-6 font-medium font-sans">
            Call summary:{" "}
            <span className="text-purple-500">Powered by intervo AI</span>
          </h5>
          <ul className="list-disc list-inside text-sm leading-6 font-sans">
            <ListItem text="Angela calls Ruth to ask about her thoughts on the report." />
            <ListItem text="Angela suggests reaching out to the client to clarify data issues." />
            <ListItem text="Angela is busy with meetings scheduled for later in the day but is available on Friday to help Ruth." />
          </ul>

          <h5 className="text-neutral-950 text-[15px] leading-6 font-medium font-sans">
            Next step:
          </h5>
          <ul className="list-disc list-inside text-sm leading-6 font-sans">
            <ListItem text="Reach out to the client to clarify data issues." />
            <ListItem text="Angela to check her calendar and confirm availability for the new project on Friday." />
            <ListItem text="Ruth to send an email with details of the new project to Angela." />
          </ul>

          <Button className="bg-secondary text-primary h-10 text-sm leading-6 font-medium font-sans hover:bg-secondary/80">
            <Mail /> Send transcript to my email
          </Button>
        </div>
        <div className="text-neutral-500 font-inter text-sm leading-4 pt-1 text-center">
          Powered by intervo
        </div>
      </div>
    </>
  );

  return (
    <>
      {scriptLoadState === "failed" && (
        <div className="text-red-500">
          Failed to load Twilio SDK. Please check your network connection.
        </div>
      )}
      {callState !== "callended" && renderActiveCall()}
      {callState === "callended" && renderCallEnded()}
    </>
  );
};

export default Call;
