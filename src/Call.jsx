import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import returnAPIUrl from "@/config/config";
import { useWidget } from "@/context/WidgetContext";

const backendAPIUrl = returnAPIUrl();
import {
  Phone,
  Captions,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Mail,
} from "lucide-react";

const chatData = [
  {
    time: "0:01",
    sender: "Angela Campbell",
    message: "Hello, this is agent_name speaking.",
  },
  {
    time: "0:05",
    sender: "You",
    message: "Hi Angela, this is Ruth. How are you doing today?",
  },
  {
    time: "0:10",
    sender: "Angela Campbell",
    message: "Hi Ruth, I'm doing well. How can I assist you today?",
  },
  {
    time: "0:15",
    sender: "You",
    message: "I need help with updating my account information.",
  },
  {
    time: "0:01",
    sender: "Angela Campbell",
    message: "Hello, this is agent_name speaking.",
  },
  {
    time: "0:05",
    sender: "You",
    message: "Hi Angela, this is Ruth. How are you doing today?",
  },
  {
    time: "0:10",
    sender: "Angela Campbell",
    message: "Hi Ruth, I'm doing well. How can I assist you today?",
  },
  {
    time: "0:15",
    sender: "You",
    message: "I need help with updating my account information.",
  },
  {
    time: "0:01",
    sender: "Angela Campbell",
    message: "Hello, this is agent_name speaking.",
  },
  {
    time: "0:05",
    sender: "You",
    message: "Hi Angela, this is Ruth. How are you doing today?",
  },
  {
    time: "0:10",
    sender: "Angela Campbell",
    message: "Hi Ruth, I'm doing well. How can I assist you today?",
  },
  {
    time: "0:15",
    sender: "You",
    message: "I need help with updating my account information.",
  },
  {
    time: "0:01",
    sender: "Angela Campbell",
    message: "Hello, this is agent_name speaking.",
  },
  {
    time: "0:05",
    sender: "You",
    message: "Hi Angela, this is Ruth. How are you doing today?",
  },
  {
    time: "0:10",
    sender: "Angela Campbell",
    message: "Hi Ruth, I'm doing well. How can I assist you today?",
  },
  {
    time: "0:15",
    sender: "You",
    message: "I need help with updating my account information.",
  },
  {
    time: "0:01",
    sender: "Angela Campbell",
    message: "Hello, this is agent_name speaking.",
  },
  {
    time: "0:05",
    sender: "You",
    message: "Hi Angela, this is Ruth. How are you doing today?",
  },
  {
    time: "0:10",
    sender: "Angela Campbell",
    message: "Hi Ruth, I'm doing well. How can I assist you today?",
  },
  {
    time: "0:15",
    sender: "You",
    message: "I need help with updating my account information.",
  },
];

const Calling = ({ onEnd, agentId }) => {
  const { callState, initiateCall, endCall, device, setDevice } = useWidget();
  const [isTwilioLoaded, setIsTwilioLoaded] = useState(false);
  const { toast } = useToast();

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

  // Setup Twilio device when script is loaded
  useEffect(() => {
    let mounted = true;

    async function setupDevice() {
      try {
        const token = await getToken();
        if (!token || !mounted) return;

        const twilioDevice = new window.Twilio.Device(token, {
          debug: true,
        });

        twilioDevice.on("ready", () => {
          console.log("Twilio.Device is ready");
          setDevice(twilioDevice);
        });

        twilioDevice.on("error", (error) => {
          console.error("Twilio device error:", error);
          toast({
            title: "Call Error",
            description: error.message,
            variant: "destructive",
          });
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
      if (device) {
        device.destroy();
      }
    };
  }, [isTwilioLoaded, device, setDevice]);

  // Add script load handler
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js";
    script.async = true;
    script.onload = () => setIsTwilioLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
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
            onClick={endCall}
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
    </>
  );
};

const CallEnded = ({ onBack }) => {
  const ListItem = ({ text }) => {
    return (
      <li className="text-purple-500">
        <span className="text-neutral-600">{text}</span>
      </li>
    );
  };

  return (
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
          {/* Call summary */}
          <h5 className="text-neutral-950 text-[15px] leading-6 font-medium font-sans">
            Call summary:{" "}
            <span className="text-purple-500">Powered by intervo AI</span>
          </h5>
          <ul className="list-disc list-inside text-sm leading-6 font-sans">
            <ListItem text="Angela calls Ruth to ask about her thoughts on the report." />
            <ListItem text="Angela suggests reaching out to the client to clarify data issues." />
            <ListItem text="Angela is busy with meetings scheduled for later in the day but is available on Friday to help Ruth." />
          </ul>
          {/* Next step */}
          <h5 className="text-neutral-950 text-[15px] leading-6 font-medium font-sans">
            Next step:
          </h5>
          <ul className="list-disc list-inside text-sm leading-6 font-sans">
            <ListItem text="Reach out to the client to clarify data issues." />
            <ListItem text="Angela to check her calendar and confirm availability for the new project on Friday." />
            <ListItem text="Ruth to send an email with details of the new project to Angela." />
          </ul>
          {/* send email button */}
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
};

const Call = ({ onBack }) => {
  const [callState, setCallState] = useState("calling");
  const [device, setDevice] = useState(null);
  const [isTwilioLoaded, setIsTwilioLoaded] = useState(false);
  const { toast } = useToast();
  const [scriptLoadState, setScriptLoadState] = useState("pending");

  // Add the missing function
  function handleTwilioScriptLoad() {
    console.log("Twilio script loaded successfully");
    setIsTwilioLoaded(true);
    setScriptLoadState("loaded");
  }

  // Function to get Twilio token from backend
  async function getToken() {
    try {
      const response = await fetch(`${backendAPIUrl}/token`);
      if (!response.ok) {
        throw new Error("Failed to fetch Twilio token");
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  }

  // Twilio device setup
  useEffect(() => {
    let mounted = true;

    async function setupDevice() {
      try {
        const token = await getToken();
        if (!token || !mounted) return;

        const twilioDevice = new window.Twilio.Device(token, { debug: true });

        twilioDevice.on("ready", () => {
          console.log("Twilio.Device is ready.");
          setDevice(twilioDevice);
        });

        // Set up event listeners
        twilioDevice.on("error", (error) => {
          console.error("Twilio Device Error:", error);
          toast({
            title: "Call Error",
            description: error.message,
            variant: "destructive",
          });
        });

        twilioDevice.on("disconnect", () => {
          setCallState("idle");
          onBack();
        });

        setDevice(twilioDevice);
      } catch (error) {
        console.error("Failed to initialize Twilio device:", error);
        toast({
          title: "Initialization Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
    if (isTwilioLoaded) {
      setupDevice();
    }

    return () => {
      mounted = false;
      if (device) {
        device.destroy();
      }
    };
  }, [isTwilioLoaded]);

  // Handle call initiation
  async function handleCall(agentId) {
    if (!device) return;

    try {
      // Prepare the call
      const response = await fetch(`${backendAPIUrl}/stream/prepare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aiConfig: JSON.stringify({ agentId, playground: false }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to prepare audio");
      }

      const prepareData = await response.json();
      const callParams = {
        To: "client",
        aiConfig: JSON.stringify({
          agentId,
          conversationId: prepareData.conversationId,
          playground: false,
        }),
      };

      // Start the call
      const connection = device.connect(callParams);
      if (!connection) {
        throw new Error("Failed to make a call. Device not ready.");
      }

      setCallState("connected");
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Call Error",
        description: error.message,
        variant: "destructive",
      });
      setCallState("idle");
    }
  }

  // Handle call end
  function handleHangUp() {
    if (device) {
      device.disconnectAll();
      setCallState("idle");
      onBack();
    }
  }

  const handleEndCall = () => setCallState("callended");

  // Replace Script component with useEffect for script loading
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://media.twiliocdn.com/sdk/js/client/v1.13/twilio.min.js";
    script.async = true;
    script.onload = handleTwilioScriptLoad;
    script.onerror = handleTwilioScriptError;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Add error handler
  function handleTwilioScriptError() {
    console.error("Failed to load Twilio script");
    setScriptLoadState("failed");
  }

  // Add useEffect to monitor script state
  useEffect(() => {
    console.log("Script load state:", scriptLoadState);
    if (scriptLoadState === "failed") {
      toast({
        title: "Error",
        description: "Failed to load Twilio SDK",
        variant: "destructive",
      });
    }
  }, [scriptLoadState]);

  return (
    <>
      {/* Add debug info */}
      {scriptLoadState === "failed" && (
        <div className="text-red-500">
          Failed to load Twilio SDK. Please check your network connection.
        </div>
      )}

      {callState === "calling" && (
        <Calling
          onEnd={handleEndCall}
          handleCall={handleCall}
          // agentId={agentId}
          device={device}
        />
      )}
      {callState === "callended" && <CallEnded onBack={onBack} />}
    </>
  );
};

export default Call;
